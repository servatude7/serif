<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`serif` is a Next.js 16 (App Router, Turbopack) + Supabase blog CMS. Auth is email/password; blogs are authored with a TipTap editor and stored in Postgres via Supabase, with cover images in Supabase Storage. Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`).

The update script (auto-run on startup) only installs Node deps (`npm install`, per the repo's npm preference). Everything below is service startup / runtime context that is NOT in the update script:

- **Docker is required** for the local Supabase stack but is not running by default. Start it once per VM boot: `sudo dockerd > /tmp/dockerd.log 2>&1 &` (the daemon is preconfigured for this environment with `fuse-overlayfs` + `iptables-legacy`; do not change `/etc/docker/daemon.json`).
- **Local Supabase** (Postgres/Auth/Storage/Studio) is managed with the `supabase` CLI via `npx supabase <cmd>` (it's a project dependency, not on `PATH`). Start it with `npx supabase start`; migrations in `supabase/migrations/` are applied automatically. Reset/re-apply with `npx supabase db reset`. Get URLs/keys with `npx supabase status`. Studio is at http://127.0.0.1:54323, the local inbucket/mailpit (captured emails) at http://127.0.0.1:54324.
- **`.env.local`** (gitignored) must contain `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY from `npx supabase status`>`. The publishable key is the deterministic local dev key, not a real secret.
- **Run order:** start Docker → `npx supabase start` → ensure `.env.local` → `npm run dev` (http://localhost:3000).
- **Auth note:** email confirmations are disabled locally (`enable_confirmations = false` in `supabase/config.toml`), so a newly signed-up user can log in immediately even though the sign-up page shows a "check your email" success screen.
- **Known cosmetic quirk:** saving a new blog post can briefly flash a "Failed to save post" toast even on success — the client catches the server action's `redirect()`. The post is still created (server returns `303`); verify via the blog list, not the toast.
