-- 1. Role enum
create type public.user_role as enum ('admin', 'user');

-- 2. Add the role column to profiles
alter table public.profiles
  add column role public.user_role not null default 'user';

comment on column public.profiles.role is 'Authorization role. Only writable by trusted server code (service role) or direct SQL; never by the end user.';

    10|-- 3. Security: keep `role` out of reach of end users.
--
-- UPDATE is already column-scoped to (first_name, avatar_url) by
-- 20260723090000_stripe_billing.sql, so the new column is not self-updatable.
-- INSERT, however, was still granted for the whole row, which would let a user
-- whose profile row is missing insert one with role = 'admin'. Scope it to the
-- columns that are safe for self-service, matching the UPDATE grant.
revoke insert on public.profiles from authenticated;
grant insert (id, first_name, avatar_url) on public.profiles to authenticated;

    20|-- SELECT was granted for the whole row to `anon`, which would publish every
-- user's role and stripe_customer_id. Public pages only ever read the author's
-- name and avatar (via the embedded profiles(first_name, avatar_url) join on
-- blogs), so narrow the anonymous grant to those columns. `authenticated`
-- keeps full-row select, which the admin dashboard relies on.
revoke select on public.profiles from anon;
grant select (id, first_name, avatar_url) on public.profiles to anon;

-- Note: public.handle_new_user() deliberately does NOT copy a role out of
-- raw_user_meta_data. That metadata is supplied by the client at sign-up, so
    30|-- reading a role from it would let anyone register as an admin.

-- 4. Admin predicate
--
-- SECURITY DEFINER so it bypasses RLS on profiles when called from inside a
-- policy, which avoids recursive policy evaluation. search_path is pinned to
-- prevent resolution of unqualified names against a caller-controlled schema.
create or replace function public.is_admin()
returns boolean
language sql
    40|security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
    50|$$;

comment on function public.is_admin() is 'True when the calling user has profiles.role = admin';

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 5. Admin read access
--
-- The owner-scoped policies from earlier migrations stay as they are; these are
    60|-- additive, so an admin sees every row while everyone else still sees only
-- their own. profiles needs no policy here because its select policy is
-- already `using (true)`.
create policy "Admins can view all blogs"
  on public.blogs for select
  using (public.is_admin());

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());
    70|
create policy "Admins can view all transactions"
  on public.transactions for select
  using (public.is_admin());

-- 6. Account emails for the admin users view
--
-- Emails live in auth.users, which is not exposed through the Data API. This
-- returns no rows for non-admins, so it is safe to expose over RPC.
create or replace function public.admin_list_user_emails()
    80|returns table (id uuid, email text)
language sql
security definer
set search_path = ''
stable
as $$
  select u.id, u.email::text
  from auth.users u
  where public.is_admin();
$$;
    90|
comment on function public.admin_list_user_emails() is 'Maps user id to email for admins; returns zero rows for everyone else';

revoke execute on function public.admin_list_user_emails() from public;
grant execute on function public.admin_list_user_emails() to authenticated;
