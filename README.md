# Paddler Management App

A team management app for dragon boat crews — RSVPs, attendance, race commitments, and drag-and-drop boat lineups — built with Next.js App Router, TypeScript, Tailwind v4, and Supabase/Postgres.

The visual identity — a sporty, high-contrast "Kit Green & Gold" palette (inspired by national-team kit colors), soft-shadow/rounded mobile-app styling, and Barlow/Barlow Condensed display type with condensed numerals throughout — is grounded in dragon boat racing itself rather than generic UI defaults. A manual light/dark toggle (floating button, bottom-right of every screen) lets you flip the whole app between themes; it remembers your choice.

**Live prototype:** https://mybluecoffeecup-ops.github.io/paddlermgmt/

The live link above serves [`prototype.html`](prototype.html), a standalone, single-file interactive mockup (mock data, no backend) with three tabs — Paddler Home, Coach/Captain Command Center, and a Lineup Tool — that runs entirely in the browser. **Note:** `prototype.html` still uses the older teal/ember look — it hasn't been updated to match the Next.js app's current Kit Green & Gold redesign yet (a known, deliberate gap, not an oversight). The full Next.js application described below is the real app and currently runs locally.

## Features

- **Paddler dashboard** (`/`; mirrored in the "Paddler Home" tab in `prototype.html`) — a profile summary card (weight, preferred side for DB/Both paddlers, Pacer/OC Steer/DB Steer/Drummer role badges), quick Going/Not Going RSVP to a scrollable list of upcoming sessions, and a scrollable Race Tracking card with live per-race countdowns, RSVP/payment status, and a lime-highlighted "going" count of attending crewmates, plus a private "Coaching Feedback Corner" for cues from coaching staff. Works identically for coaches, since a coach is also a full paddler in the data model
- **Profile page** (`/profile`) — self-service editing of name, weight, discipline, preferred side, eligibility (Citizen/PR/Other), age range, boat roles (Pacer, Drummer, OC Steer, DB Steer), and crew categories (grouped into Gender, Age Range, and Other), reachable via the header avatar
- **Coach/Captain command center** (`/command-center`) — a session manager for browsing/creating sessions (including a "repeat weekly" option) and broadcasting markdown workout/training logs; a race management panel for adding races to the calendar (date, location, discipline, competitiveness level, and Gender/Age Range/Other category tags) that immediately appear on paddlers' dashboards; a metrics summary (headcount vs. boat capacity, total attending weight, response rate, discipline); and a collapsible Segment Roster filter (discipline plus Gender/Age Range/Other category tags) paired with the roster table. Restricted to coaches client-side
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

By default the app runs entirely on mock data from `src/lib/mock-data.ts` (a 30-paddler roster) — no environment setup required, and `/login`/`/signup` are bypassed. To connect a real Supabase project, copy `.env.local.example` to `.env.local`, fill in your project's URL and anon key (plus `NEXT_PUBLIC_SITE_URL` for email-confirmation redirects), and apply the migrations in `supabase/migrations/` in order (`0001_init.sql` through `0006_crew_tags_gender_age_categories.sql`). To switch an already-configured project back to mock mode for local UI work, comment out the two Supabase env vars in `.env.local` and restart the dev server.

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
