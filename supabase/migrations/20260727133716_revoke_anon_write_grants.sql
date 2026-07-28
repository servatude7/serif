-- Harden table privileges that were left wide open by Supabase's default
-- privileges on the public schema.
--
-- Every table in `public` was granted INSERT/UPDATE/DELETE/TRUNCATE to both
-- `anon` and `authenticated`, regardless of what the earlier migrations
-- explicitly granted. Nothing is currently exploitable because RLS denies
-- these writes (`anon` fails the `auth.uid() = id` checks, and subscriptions
-- and transactions have no write policies at all), but RLS is then the only
-- thing standing between an anonymous request and the table that stores
-- authorization roles. Grants are the cheaper, more durable gate.

-- 1. `anon` never writes. Public pages only read published blogs and author
-- names.
revoke insert, update, delete, truncate on public.profiles from anon;
revoke insert, update, delete, truncate on public.blogs from anon;
    20|revoke insert, update, delete, truncate on public.subscriptions from anon;
revoke insert, update, delete, truncate on public.transactions from anon;

-- 2. Billing tables are written only by the Stripe webhook through the
-- service-role client, which bypasses grants and RLS. This is what
-- 20260723090000_stripe_billing.sql already documented as its intent; the
-- default privileges were silently overriding it.
revoke insert, update, delete, truncate on public.subscriptions from authenticated;
revoke insert, update, delete, truncate on public.transactions from authenticated;

    30|-- `authenticated` keeps its blogs writes (authors manage their own posts) and
-- its column-scoped profiles insert/update from the previous migration.
