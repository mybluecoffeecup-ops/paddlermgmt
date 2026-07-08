# Paddler Management App

A team management app for dragon boat crews — RSVPs, attendance, race commitments, and drag-and-drop boat lineups — built with Next.js App Router, TypeScript, Tailwind v4, and Supabase/Postgres.

**Live prototype:** https://mybluecoffeecup-ops.github.io/paddlermgmt/

The live link above serves [`prototype.html`](prototype.html), a standalone, single-file interactive mockup (mock data, no backend) with three tabs — Paddler Home, Coach/Captain Command Center, and a Lineup Tool — that runs entirely in the browser. The full Next.js application described below is the real app and currently runs locally.

## Features

- **Paddler dashboard** (`/`) — an editable profile card (weight, preferred side for DB/Both paddlers), quick RSVP to a scrollable list of upcoming sessions, live race countdown tickers, and a private "Coaching Feedback Corner" for cues from coaching staff
- **Coach/Captain command center** (`/command-center`) — a dense filter sidebar to segment the roster by discipline (DB/OC/Both) and crew category (Premier Mixed, Women, Men, Masters), a metrics summary (headcount vs. boat capacity, total attending weight, response rate, discipline), and a session manager for browsing sessions and broadcasting markdown workout/training logs
- **Lineup builder** (`/lineups/[lineupId]`; standalone "Lineup Tool" tab in `prototype.html`) — drag-and-drop seat assignment across boat layouts (DB12, DB22, V6), including dedicated Drummer/Steer seats on dragon boats, with a live left/right (or bow/stern) weight-balance telemetry bar
- Role switching (Paddler / Coach) as a UI toggle — no auth wired up yet

## Running locally

```bash
npm install
npm run dev      # start dev server (Turbopack) at http://localhost:3000
```

Other useful commands:

```bash
npm run build    # production build (also runs the TypeScript check)
npm run lint     # ESLint
npx tsc --noEmit # type-check only
```

By default the app runs entirely on mock data from `src/lib/mock-data.ts` — no environment setup required. To connect a real Supabase project, copy `.env.local.example` to `.env.local`, fill in your project's URL and anon key, and apply `supabase/migrations/0001_init.sql` to your database.

## Project structure

```
src/
  app/                    # routes: /, /command-center, /lineups, /lineups/[lineupId]
  components/
    dashboard/            # paddler home dashboard widgets
    command-center/        # coach roster, filters, session manager
    lineup/               # drag-and-drop boat editor, telemetry, seat/bench UI
    nav/                  # AppShell (role toggle, navigation)
    ui/                   # shared primitives
  hooks/app-data.tsx      # single data-fetching context consumed by all routes
  lib/
    api/                  # Supabase CRUD calls per table
    boat-config.ts        # seat layouts + balance-group logic for DB12/DB22/V6
    mock-data.ts          # seed data used when Supabase isn't configured
    supabase/             # client + hand-written database types
  types/index.ts          # domain types mirroring the SQL schema
supabase/migrations/      # SQL schema, RLS policies, triggers
prototype.html            # standalone static mockup (see Deployment below)
```

See [CLAUDE.md](CLAUDE.md) for a deeper architecture walkthrough.

## Deployment

Pushes to `main` automatically deploy `prototype.html` to GitHub Pages via the workflow at [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). The Next.js app itself isn't statically exported (it has a dynamic Supabase-backed route) and isn't deployed by this workflow.
