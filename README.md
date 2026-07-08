# Paddler Management App

A team management app for dragon boat crews — RSVPs, attendance, race commitments, and drag-and-drop boat lineups — built with Next.js App Router, TypeScript, Tailwind v4, and Supabase/Postgres.

The visual identity — a deep "regatta teal" + vermilion "ember" accent palette, Barlow Condensed display type, and condensed numerals throughout — is grounded in dragon boat racing itself rather than generic UI defaults, and is shared identically between the Next.js app and `prototype.html`.

**Live prototype:** https://mybluecoffeecup-ops.github.io/paddlermgmt/

The live link above serves [`prototype.html`](prototype.html), a standalone, single-file interactive mockup (mock data, no backend) with three tabs — Paddler Home, Coach/Captain Command Center, and a Lineup Tool — that runs entirely in the browser. The full Next.js application described below is the real app and currently runs locally.

## Features

- **Paddler dashboard** (`/`; mirrored in the "Paddler Home" tab in `prototype.html`) — a profile summary card (weight, preferred side for DB/Both paddlers, Pacer/OC Steer/DB Steer/Drummer role badges), quick Attending/Absent RSVP to a scrollable list of upcoming sessions, live per-race countdown tickers with RSVP and payment status, and a private "Coaching Feedback Corner" for cues from coaching staff. Works identically for coaches, since a coach is also a full paddler in the data model
- **Profile page** (`/profile`) — self-service editing of name, weight, discipline, preferred side, eligibility (Citizen/PR/Other), age range, boat roles (Pacer, Drummer, OC Steer, DB Steer), and crew categories, reachable via the header avatar
- **Coach/Captain command center** (`/command-center`) — a dense filter sidebar to segment the roster by discipline (DB/OC/Both) and crew category (Premier Mixed, Women, Men, Masters, Youth, Novice), a metrics summary (headcount vs. boat capacity, total attending weight, response rate, discipline), and a session manager for browsing sessions and broadcasting markdown workout/training logs. Restricted to coaches client-side
- **Lineup builder** (`/lineups/[lineupId]`; standalone "Lineup Tool" tab in `prototype.html`) — drag-and-drop seat assignment across boat layouts (DB12, DB22, V6), including dedicated Drummer/Steer seats on dragon boats, with a live left/right (or bow/stern) weight-balance telemetry bar. Restricted to coaches client-side
- **Auth** — real Supabase Auth (email/password) once a Supabase project is configured: `/login` and `/signup`, route protection via `src/proxy.ts`, and a `profiles` row auto-created per signup. Paddler vs. Coach view is derived from `profiles.is_coach`; Command Center and Lineups are gated client-side via `RequireCoach` since a coach is also a paddler and `/`/`/profile` stay open to both roles. Without Supabase configured, the app falls back to a Paddler/Coach UI toggle over mock data (no login required) for local development

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

By default the app runs entirely on mock data from `src/lib/mock-data.ts` — no environment setup required, and `/login`/`/signup` are bypassed. To connect a real Supabase project, copy `.env.local.example` to `.env.local`, fill in your project's URL and anon key (plus `NEXT_PUBLIC_SITE_URL` for email-confirmation redirects), and apply the migrations in `supabase/migrations/` (`0001_init.sql`, `0002_handle_new_user.sql`, `0003_profile_eligibility_age_steer.sql`) to your database in order.

## Project structure

```
src/
  app/
    (app)/                # routes wrapped in AppDataProvider + AppShell: /, /profile, /command-center, /lineups, /lineups/[lineupId]
    login/, signup/       # auth pages (server actions, no AppShell chrome)
    auth/callback/        # exchanges Supabase email-confirmation code for a session
  components/
    auth/                 # RequireCoach client-side route guard
    dashboard/            # paddler home dashboard widgets
    command-center/        # coach roster, filters, session manager
    lineup/               # drag-and-drop boat editor, telemetry, seat/bench UI
    nav/                  # AppShell (role badge/sign-out or demo toggle, navigation)
    ui/                   # shared primitives
  hooks/app-data.tsx      # single data-fetching context consumed by all routes
  lib/
    api/                  # Supabase CRUD calls per table
    auth-actions.ts       # login/signup/logout server actions
    boat-config.ts        # seat layouts + balance-group logic for DB12/DB22/V6
    mock-data.ts          # seed data used when Supabase isn't configured
    supabase/             # browser + server clients, hand-written database types
  proxy.ts                # route guard: redirects unauthenticated requests to /login
  types/index.ts          # domain types mirroring the SQL schema
supabase/migrations/      # SQL schema, RLS policies, triggers
prototype.html            # standalone static mockup (see Deployment below)
```

See [CLAUDE.md](CLAUDE.md) for a deeper architecture walkthrough.

## Deployment

Pushes to `main` automatically deploy `prototype.html` to GitHub Pages via the workflow at [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). The Next.js app itself isn't statically exported — it has Server Actions and a `proxy.ts` route guard, both of which require a live Node server — so GitHub Pages can't host it. The intended host for the real app is Vercel; it isn't deployed there yet.
