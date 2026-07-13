-- Trigger functions must not be callable via /rest/v1/rpc
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;

-- Revoke anon access to internal query helpers
-- Authenticated warnings are acceptable: functions only return the caller's own data
revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_access(uuid) from anon;
revoke execute on function public.log_book_access(uuid) from anon;
