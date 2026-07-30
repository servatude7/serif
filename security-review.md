# Security review — Serif

Last reviewed: 2026-07-28 · All High, Medium, and Low findings remediated (see Status column)

Scope: Supabase RLS/grants, `proxy.ts` route gating, server actions, API routes, Stripe webhook, storage policies, and logging. `.env.local` is gitignored; secrets are not committed.

**Production checklist:** Confirm these migrations are applied in production:

- `20260727133521_admin_role_and_policies.sql`
- `20260727133716_revoke_anon_write_grants.sql`
- `20260727135848_revoke_anon_function_execute.sql`
- `20260728124850_scope_admin_policies_to_authenticated.sql`
- `20260728134500_restrict_profile_reads.sql` (new)
- `20260728134600_restrict_billing_reads.sql` (new)
- `20260728134700_storage_bucket_limits.sql` (new)

After applying, regenerate `lib/database.types.ts` — `admin_list_user_emails()` was replaced by `admin_list_users()`.

---

## High

| # | Location | Finding | Status |
|---|----------|---------|--------|
| H1 | `supabase/migrations/20260702110633_create_profiles_table.sql`, `20260727133521_admin_role_and_policies.sql` | **Any authenticated user could read every profile row** via PostgREST or the browser Supabase client. RLS policy `"Profiles are viewable by everyone"` used `using (true)`, and `authenticated` retained **full-row** `SELECT`, exposing other users’ `role`, `stripe_customer_id`, and `subscription_status` to any signed-in account. | **Fixed** in `20260728134500_restrict_profile_reads.sql`: the blanket policy is replaced by own-row and `is_admin()` policies for `authenticated` plus an `anon`-only `is_published_author(id)` policy for public bylines; `authenticated` now holds column grants for `(id, first_name, avatar_url, role, subscription_status, created_at)` only. `stripe_customer_id` moved behind the new `admin_list_users()` RPC ([app/admin/users/page.tsx](app/admin/users/page.tsx)) and the service-role client ([lib/actions/billing.ts](lib/actions/billing.ts)). |

---

## Medium

| # | Location | Finding | Status |
|---|----------|---------|--------|
| M1 | `app/api/loops/subscribe/route.ts` | **Unauthenticated POST** with no rate limiting, CAPTCHA, or auth. Anyone could trigger Loops upserts/events (spam, list poisoning, API cost). | **Fixed** — route deleted. [lib/actions/loops.ts](lib/actions/loops.ts) is a server action that reads the email from the session, called from [app/auth/confirm/route.ts](app/auth/confirm/route.ts) after OTP verification (and directly after sign-up when confirmations are disabled and a session exists). Arbitrary addresses can no longer be submitted. |
| M2 | `supabase/migrations/20260723090000_stripe_billing.sql` | **`transactions.payload`** (full raw Stripe event JSON) was readable by the row owner through the publishable key. | **Fixed** in `20260728134600_restrict_billing_reads.sql`: `payload` excluded from the `authenticated` column grants, and the unused table-level `SELECT` for `anon` on `subscriptions` / `transactions` revoked. |
| M3 | `lib/supabase/middleware.ts`, `proxy.ts` | **Proxy enforced login, not authorization.** `/admin/*` only required *some* session; the admin role was checked solely in `app/admin/layout.tsx`. | **Fixed** — [lib/supabase/middleware.ts](lib/supabase/middleware.ts) now looks up `profiles.role` for `/admin` requests only and redirects non-admins to `/dashboard`. `requireAdmin()` remains the authoritative check. |
| M4 | `lib/actions/blog.ts` (`getBlogBySlug`) | **No explicit `author_id` or `published` filter**; access depended entirely on RLS. | **Fixed** — the duplicate `getPublishedBlogs` / `getBlogBySlug` were dead code and are deleted. Public reads go through [lib/blog-data.ts](lib/blog-data.ts), which filters `status = 'published'` explicitly. |
| M5 | `lib/actions/ai-blog.ts` | Server **`console.error` logged AI SDK `error.response`**, putting provider response bodies in hosting logs. | **Fixed** — only the cause message and token usage are logged. |

---

## Low

| # | Location | Finding | Status |
|---|----------|---------|--------|
| L1 | `components/sign-up-form.tsx`, `components/settings/profile-form.tsx`, `components/blog/blog-form.tsx` | **Client `console.error(err)`** surfaced Supabase/network error text in browser devtools. | **Fixed** — replaced with toast-only handling; the sign-up form's logging disappeared with the M1 change. |
| L2 | `app/billing/success/page.tsx` | **Static “You’re on Pro!”** with no server-side subscription check. | **Fixed** — the page now requires a session and renders a "Payment processing" state until `isProUser()` confirms the webhook has synced. |
| L3 | Storage (`blog-images`, `avatars`) | **Public buckets** with UUID paths; size/mime limits only existed in the server actions, so a direct storage API call with a user's token could store any file type. | **Fixed** in `20260728134700_storage_bucket_limits.sql`: 5 MB `file_size_limit` and a jpeg/png/webp/gif `allowed_mime_types` allowlist on both buckets. Buckets stay public by design (`next/image` and OG images need unauthenticated GETs). |
| L4 | `lib/actions/profile.ts` (`updateProfile`) | **`avatar_url` accepted from a form field** without validation, so arbitrary URLs could be stored. | **Fixed** — `isSupabasePublicUrl()` in [lib/storage.ts](lib/storage.ts) rejects anything outside this project's public bucket path; applied to `avatar_url` and to `blogs.image` in `createBlog`/`updateBlog`. `uploadAvatar` also uses the shared mime allowlist and extension map instead of `image/*` plus a filename-derived extension. |

---

## Info (positive / hygiene)

| # | Topic | Notes |
|---|--------|--------|
| I1 | **Secrets** | `.env*` gitignored; `SUPABASE_SERVICE_ROLE_KEY` only in `lib/supabase/admin.ts` and the Stripe Edge Function; `.env.example` has placeholders only. |
| I2 | **Privilege escalation** | Profile **UPDATE/INSERT** is column-scoped; `role` and billing fields are not self-writable. `handle_new_user()` does **not** copy role from sign-up metadata. |
| I3 | **RLS — blogs** | Drafts hidden from anon; published public; authors see own; admin policies scoped to **`authenticated`** with `(select public.is_admin())`. |
| I4 | **RLS — billing writes** | `subscriptions` / `transactions` writes revoked from `authenticated`; webhook uses service role after signature verification. |
| I5 | **Admin RPCs** | `is_admin()`, `is_published_author()`, and `admin_list_users()` have EXECUTE scoped to the single role that needs them; `admin_list_users()` returns zero rows for non-admins. |
| I6 | **Stripe webhook** | Signature verification; `verify_jwt = false` in `supabase/config.toml` (appropriate for Stripe); idempotency via unique `stripe_event_id`. Checkout metadata set server-side in `lib/actions/billing.ts`. |
| I7 | **Protected routes** | Next.js 16 **`proxy.ts`** calls `updateSession`; non-public paths redirect to login, `/api/*` returns 401 JSON, `/admin` also requires `role = 'admin'`. |
| I8 | **Auth redirect** | `app/auth/confirm/route.ts` restricts `next` to paths starting with `/` (no open redirect to external URLs). |
| I9 | **XSS** | `BlogContent` sanitizes links (`safeHref`); JSON-LD uses `replace(/</g, '\\u003c')`. |
| I10 | **Console logging** | No `console.log`, `debug`, or `info` in app code; `console.error` is server/Edge-only and carries no secrets or PII beyond Stripe/Supabase identifiers. |
| I11 | **Pro gating** | AI blog generation checks auth and `isProUser()` server-side in `lib/actions/ai-blog.ts`. |
| I12 | **Image hosts** | `next.config.ts` restricts `images.remotePatterns` to this project's `/storage/v1/object/public/**`, so the optimizer cannot be pointed at third-party hosts. |

---

## RLS access matrix

| Data | Anon | Authenticated (non-admin) | Admin | Gap? |
|------|------|---------------------------|-------|------|
| Published blogs | Read | Read (+ own drafts) | Read all | OK |
| Draft blogs | Deny | Own only | Read all | OK |
| Profiles | `id`, name, avatar of published authors | Own row only | All rows (billing ids via RPC) | OK |
| Subscriptions | Deny (grant revoked) | Own rows | Read all | OK |
| Transactions | Deny (grant revoked) | Own rows, no `payload` | Read all, no `payload` | OK |
| Profile `role` / billing writes | Deny | Deny (grants) | Service role / SQL | OK |
| Storage uploads | Deny | Own `{uid}/` folder, ≤5 MB images | N/A | OK |

Accepted residual risks:

- Storage buckets are public, so a leaked object URL stays readable. Required for `next/image` and OG images.
- A user can read their own `role`, and admins can read every profile row. Both are intended.
- `payload` remains fully readable by the service role (Stripe webhook and SQL), which is where the audit trail is meant to be inspected.

---

## Route protection reference

Public paths (no session required), from `lib/supabase/middleware.ts`:

- `/`, `/robots.txt`, `/sitemap.xml`
- `/blogs/*`, `/pricing/*`
- `/login/*`, `/auth/*`

All other matched paths require a valid session. Page requests redirect to `/auth/login`; requests under `/api/*` get a `401` JSON response instead, so a `fetch()` caller never receives the login HTML.

Authorization by area:

| Area | Session (proxy) | Role |
|------|-----------------|------|
| `/dashboard/*` | Required | `requireUser()` — non-admins only; admins redirected to `/admin` |
| `/admin/*` | Required | `profiles.role = 'admin'` at the proxy, plus `requireAdmin()` in the layout |
| `/billing/success` | Required | Renders a pending state until `isProUser()` is true |
