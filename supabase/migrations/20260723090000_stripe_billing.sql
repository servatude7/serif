-- 1. Subscription status enum (mirrors Stripe subscription statuses)
create type public.subscription_status as enum (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

-- 2. Extend profiles with billing fields
alter table public.profiles
  add column stripe_customer_id text unique,
  add column subscription_status public.subscription_status;

comment on column public.profiles.stripe_customer_id is 'Stripe Customer ID for this user';
comment on column public.profiles.subscription_status is 'Denormalized current subscription status, kept in sync by the Stripe webhook';

-- 2a. Security: lock down which profile columns end users can write directly.
-- The existing "Users can update their own profile" policy (see
-- 20260702110633_create_profiles_table.sql) allows a row-level update, but
-- without a column-level restriction any authenticated user could otherwise
-- set their own subscription_status/stripe_customer_id straight from the
-- client and grant themselves a Pro plan. Postgres enforces column
-- privileges in addition to RLS, so restrict the authenticated role to the
-- columns that are safe for self-service edits. Billing columns are only
-- ever written by trusted server code (server actions / the Stripe webhook)
-- using the service-role client, which bypasses grants and RLS entirely.
revoke update on public.profiles from authenticated;
grant update (first_name, avatar_url) on public.profiles to authenticated;

-- 3. Subscriptions table: tracks month-to-month subscription state
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id     text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id        text not null,
  plan                   text not null default 'pro',
  status                 public.subscription_status not null,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  canceled_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is 'Stripe subscription lifecycle state, one row per Stripe subscription';

create index subscriptions_user_id_idx on public.subscriptions (user_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

-- No insert/update/delete grants for authenticated: subscriptions are only
-- ever written by the Stripe webhook via the service-role client, which
-- bypasses RLS and grants entirely.
grant select on public.subscriptions to authenticated;

-- 4. Transactions table: raw log of every processed Stripe webhook event
create table public.transactions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references public.profiles (id) on delete set null,
  stripe_event_id         text not null unique,
  stripe_event_type       text not null,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  stripe_invoice_id       text,
  amount_total            integer,
  currency                text,
  status                  text,
  payload                 jsonb not null,
  created_at              timestamptz not null default now()
);

comment on table public.transactions is 'Audit log of Stripe webhook events (one row per event, deduplicated by stripe_event_id)';
comment on column public.transactions.payload is 'Full raw Stripe event payload';

create index transactions_user_id_idx on public.transactions (user_id);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using ((select auth.uid()) = user_id);

-- No insert/update/delete grants for authenticated: transactions are only
-- ever written by the Stripe webhook via the service-role client.
grant select on public.transactions to authenticated;
