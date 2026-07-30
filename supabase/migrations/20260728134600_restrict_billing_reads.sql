-- 1. `anon` has no business reading billing rows at all.
--
-- Supabase's default privileges on the public schema left a table-level SELECT
-- for `anon` on both billing tables. RLS denies every row (the owner policies
-- compare against a null `auth.uid()`), but 20260727133716 already removed the
-- equivalent write grants for the same reason: the grant should not be the only
-- thing RLS is compensating for.
revoke select on public.subscriptions from anon;
revoke select on public.transactions from anon;

-- 2. `transactions.payload` holds the full raw Stripe event, and the owner-scoped
-- select policy from 20260723090000_stripe_billing.sql made it readable by the
-- user the row belongs to. The app never renders it (the admin transactions
-- view only reads the extracted columns), so keep the audit blob server-side and
-- re-grant every other column.
revoke select on public.transactions from authenticated;

grant select (
  id,
  user_id,
  stripe_event_id,
  stripe_event_type,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_invoice_id,
  amount_total,
  currency,
  status,
  created_at
) on public.transactions to authenticated;
