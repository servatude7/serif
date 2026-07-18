<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`serif` is a single Next.js 16 (App Router) blog-authoring app backed by a local Supabase stack (Postgres + Auth + Storage) running in Docker. Package manager is **pnpm** (`pnpm-lock.yaml` is committed; the npm lockfile was intentionally removed). Scripts live in `package.json`: `pnpm dev` (port 3000), `pnpm lint`, `pnpm build`. There is no test framework.

Non-obvious gotchas:
- **Middleware is `proxy.ts`, not `middleware.ts`** (Next 16 convention). It exports a `proxy()` function and calls `updateSession` in `lib/supabase/middleware.ts`. Unauthenticated requests to non-public routes redirect to `/auth/login`.
- **The app needs Supabase env vars in `.env.local`** (git-ignored, so it does NOT persist across fresh VMs — recreate it each session):
  - `NEXT_PUBLIC_SUPABASE_URL` = the `API_URL` from `supabase start` (`http://127.0.0.1:54321`)
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the `PUBLISHABLE_KEY` (`sb_publishable_...`, NOT the legacy anon JWT). The local key is deterministic across restarts.
- **Services must be started manually each session** (the update script only refreshes dependencies, it cannot start services):
  1. Start the Docker daemon (e.g. `sudo dockerd` in a background/tmux session) — it does not auto-start in this VM.
  2. `npx supabase start` from the repo root (pulls images on first run; applies migrations in `supabase/migrations`). Copy `API_URL` + `PUBLISHABLE_KEY` into `.env.local`.
  3. `pnpm dev`.
- **Email confirmation is disabled locally** (`enable_confirmations = false` in `supabase/config.toml`), so a new signup is logged in immediately — no inbox step needed. A `profiles` row is auto-created on signup via a DB trigger.
- Local Supabase URLs: API `54321`, DB `54322`, Studio `54323`, Mailpit `54324`.
