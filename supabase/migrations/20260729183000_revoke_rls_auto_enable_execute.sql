-- `public.rls_auto_enable()` is created by the platform on new projects (it backs
-- the `ensure_rls` event trigger that turns RLS on for new public tables). It
-- lands in the `public` schema, so Supabase's default privileges hand EXECUTE to
-- PUBLIC, `anon` and `authenticated`, and PostgREST exposes it at
-- /rest/v1/rpc/rls_auto_enable. Calling an event trigger function outside an
-- event trigger context just errors out, so nothing is exploitable, but the same
-- reasoning as 20260727135848 applies: an internal helper should not be part of
-- the anonymous API surface.
--
-- PUBLIC is revoked alongside the named roles because a named revoke does not
-- remove the grant PUBLIC holds -- the inverse of the mistake 20260727135848
-- was written to fix.
--
-- Wrapped in an existence check: older projects (dev) predate the platform
-- feature and have no such function, so this is a no-op there.
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and p.pronargs = 0
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
