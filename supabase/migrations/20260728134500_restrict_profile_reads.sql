-- Profiles were readable in full by every signed-in user.
--
-- "Profiles are viewable by everyone" (20260702110633) is `using (true)` and
-- `authenticated` still held a full-row SELECT grant, so any account could
-- enumerate every profile including `role`, `stripe_customer_id` and
-- `subscription_status`. Anonymous access was already narrowed to
-- (id, first_name, avatar_url) by 20260727133521; this migration does the same
-- for `authenticated` and replaces the blanket row policy with three scoped
-- ones: own row, admin, and the public author byline.

-- 1. Public author bylines
--
-- Public blog pages read through a session-less publishable-key client
-- (lib/blog-data.ts), so they act as `anon` and need the author's row for the
-- embedded profiles(first_name, avatar_url) join. SECURITY DEFINER so the
-- policy does not re-enter RLS on blogs, with search_path pinned to prevent
-- resolution of unqualified names against a caller-controlled schema.
create or replace function public.is_published_author(profile_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.blogs
    where author_id = profile_id
      and status = 'published'
  );
$$;

comment on function public.is_published_author(uuid) is 'True when the profile has at least one published blog, which makes its byline public';

revoke execute on function public.is_published_author(uuid) from public;
grant execute on function public.is_published_author(uuid) to anon;

-- 2. Row visibility
drop policy "Profiles are viewable by everyone" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

create policy "Published authors are publicly readable"
  on public.profiles for select
  to anon
  using (public.is_published_author(id));

-- 3. Column visibility for `authenticated`
--
-- Grants are role-wide, so admins are covered by the same grant. Keeping
-- `stripe_customer_id` out of it means the admin users page has to read billing
-- identifiers through the SECURITY DEFINER RPC below instead of the table.
revoke select on public.profiles from authenticated;
grant select (id, first_name, avatar_url, role, subscription_status, created_at)
  on public.profiles to authenticated;

-- 4. Admin users view
--
-- Replaces admin_list_user_emails(): the page needs emails (auth.users is not
-- exposed through the Data API) plus the billing columns that are no longer
-- granted to `authenticated`. Returns zero rows for non-admins, so it is safe
-- to expose over RPC.
drop function public.admin_list_user_emails();

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  first_name text,
  avatar_url text,
  role public.user_role,
  subscription_status public.subscription_status,
  stripe_customer_id text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id,
    u.email::text,
    p.first_name,
    p.avatar_url,
    p.role,
    p.subscription_status,
    p.stripe_customer_id,
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

comment on function public.admin_list_users() is 'Full profile rows with account emails for admins; returns zero rows for everyone else';

revoke execute on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
