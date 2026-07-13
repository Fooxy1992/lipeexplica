-- 1. RLS policy for webhook_events (was RLS-enabled with no policies)
create policy "webhook_events: admin read" on public.webhook_events
  for select using (public.is_admin());

-- 2. Revoke anon execute from internal SECURITY DEFINER functions
--    These are called by app code and RLS policies, not by direct API callers
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_access(uuid) from anon;
revoke execute on function public.log_book_access(uuid) from anon;

-- 3. Fix set_updated_at mutable search_path
create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
