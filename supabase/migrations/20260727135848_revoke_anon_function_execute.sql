-- Follow-up to 20260727133521: `revoke execute ... from public` was not enough.
--
-- Supabase's default privileges on the public schema grant EXECUTE to `anon`
-- and `authenticated` by name, and revoking from PUBLIC does not remove a
-- named grant. Both functions were therefore still reachable anonymously at
-- /rest/v1/rpc/... Neither leaks anything (they gate on `is_admin()`, which is
-- false when `auth.uid()` is null), but an admin-only helper should not be part
-- of the anonymous API surface.
revoke execute on function public.is_admin() from anon;
revoke execute on function public.admin_list_user_emails() from anon;
