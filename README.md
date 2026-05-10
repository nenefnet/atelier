# Atelier — public demo

A productivity dashboard for small teams. Next.js 14 (App Router) · Drizzle ORM · Turso (libSQL/SQLite) · Tailwind · TypeScript.

This build is configured as a public, no-auth demo for portfolio use. Anyone hitting the URL lands directly in the dashboard as a shared "Demo User" with a pre-seeded workspace.

## Quick deploy (Vercel + Turso)

1. Sign up at https://turso.tech (GitHub login, no card).
2. Create a database called `atelier`. From the Connect tab, copy the **Database URL** and a fresh **Auth Token**.
3. Push this repo to GitHub.
4. Import it on https://vercel.com/new. Before deploying, set these env vars:

   ```
   TURSO_DATABASE_URL=libsql://atelier-<you>.turso.io
   TURSO_AUTH_TOKEN=eyJ...
   NEXT_PUBLIC_SITE_URL=https://your-prod-url.vercel.app
   ```

5. Deploy.

Once it's up, run the schema push from your laptop **once**:

```bash
cp .env.example .env.local
# paste the same Turso URL + token into .env.local
npm install
npm run db:push
```

That creates the tables on Turso. Visit your Vercel URL → click into the dashboard → tasks and notes are pre-seeded.

## Local development

```bash
cp .env.example .env.local
npm install
npm run db:push   # creates atelier.db locally
npm run dev
```

Don't have Turso set up yet? Leave both `TURSO_*` env vars blank and a local SQLite file is used. (Note: the local file needs WAL mode — drizzle-kit handles this automatically on push, but if you ever see a "Database is not in WAL mode" error, run: `sqlite3 atelier.db "PRAGMA journal_mode = WAL;"`)

## Architecture notes

- **No auth** — every visitor is auto-resolved to a shared `demo@atelier.local` user via `src/lib/workspace.ts`. To add real auth later, drop in Auth.js / Clerk / etc. and rewrite that file.
- **Authorization** — every server action calls `requireMembership(workspaceId)` to verify the current user belongs to the workspace before mutating. This is the equivalent of Postgres RLS, just enforced in app code.
- **Schema** — `src/lib/db/schema.ts` is the source of truth. The `user`, `account`, `session`, `verificationToken` tables exist for future auth and are unused in this build.
- **Seed data** — `ensureDemoSetup()` in `src/lib/workspace.ts` populates the demo workspace on first request with a few tasks and notes.

## What you can demo

- `/dashboard` — overview with stats, recent tasks, recent notes
- `/tasks` — editable data table with status, priority, assignee, due dates, filters
- `/notes` — auto-saving notes with title/body editor
- `/team` — list members, invite by email (generates a copyable link)
- `/analytics` — last-30-day metrics + completion sparkline + top contributors
- `/settings` — profile and workspace name
