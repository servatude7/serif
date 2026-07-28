-- Fixes "permission denied for function is_admin" on anonymous reads.
--
-- The admin policies from 20260727133521 were created without a `to` clause,
-- so they default to `to public` and Postgres evaluates them for `anon` too.
-- Once 20260727135848 revoked EXECUTE on is_admin() from `anon`, every
-- anonymous select on blogs failed while evaluating the admin policy -- which
-- broke the public /blogs and /blogs/[slug] pages (and the production build,
-- since those pages are prerendered).
--
-- Admins are authenticated by definition, so scope the policies to that role.
-- `anon` then never touches is_admin() and the revoke can stay in place.
--
-- is_admin() is also wrapped in a scalar subquery so the planner evaluates it
-- once per statement as an InitPlan instead of once per row.
drop policy "Admins can view all blogs" on public.blogs;
drop policy "Admins can view all subscriptions" on public.subscriptions;
drop policy "Admins can view all transactions" on public.transactions;

create policy "Admins can view all blogs"
  on public.blogs for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can view all transactions"
  on public.transactions for select
  to authenticated
  using ((select public.is_admin()));
