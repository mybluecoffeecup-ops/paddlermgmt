# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build — also runs the TypeScript check
npm run start    # run a production build
npm run lint     # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # type-check only, faster than a full build
```

There is no test suite configured in this repo.

Global npm config on this machine pins npm's `allow-scripts` security feature and disallows project-level overrides — plain `npm install` works (scripts run only for allow-listed packages), but anything that passes `--allow-scripts` explicitly (e.g. some `create-*` scaffolding tools) will fail with `EALLOWSCRIPTS`.

## Architecture

Next.js App Router + TypeScript + Tailwind v4, mobile/iPad-first, backed by Supabase/Postgres.

### Data layer: one context, every `(app)` route

`src/hooks/app-data.tsx` (`AppDataProvider`/`useAppData`) is the single source of truth for all domain data (profiles, sessions, attendance, races, race_commitments, lineups) and is mounted in `src/app/(app)/layout.tsx`, wrapping every route in that route group (`/`, `/command-center`, `/lineups/*`, `/profile`). The root `src/app/layout.tsx` only sets up fonts and the `<html>`/`<body>` shell — it does *not* mount the provider, so `/login` and `/signup` (outside the `(app)` group) have no access to `useAppData()` by design.

- State is seeded from `src/lib/mock-data.ts` and used as-is when Supabase isn't configured.
- `src/lib/supabase/client.ts` exports `isSupabaseConfigured` (true when `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set). When true, `AppDataProvider` fetches live rows on mount and every mutator (`rsvpToSession`, `updateProfile`, `updateSession`, `createSession`, `updateRaceCommitment`, `createLineup`, `saveLineupSeating`) updates local state optimistically *and* fires the matching `src/lib/api/*.ts` CRUD call. API failures are logged, not rolled back.
- `src/lib/supabase/database.types.ts` documents the table shapes but is **not** passed as a generic to `createBrowserClient` — supabase-js's `GenericTable` constraints didn't structurally match hand-written row types without heavy boilerplate, so each `api/*.ts` function casts its result to the domain type from `src/types/index.ts` instead.
- Domain types in `src/types/index.ts` mirror the SQL schema 1:1; treat that file and the migrations as the source of truth together.
- **Async resolution race**: `role` is derived from `currentUser?.is_coach`, and `currentUser` resolves asynchronously (a profiles fetch plus a separate Supabase auth effect). Before both settle, `currentUser` is `undefined` and `role` silently falls back to `"paddler"` — even for an actual coach. Anything that gates behavior on `role` must wait for `!loading && currentUser !== undefined` before trusting it, or a coach will get bounced/flash-hidden on first load. See `src/components/auth/RequireCoach.tsx` and the nav filtering in `AppShell.tsx` for the established pattern.

### Auth and roles

Real Supabase Auth (email/password) is wired up: `/login` and `/signup` (`src/app/login/page.tsx`, `src/app/signup/page.tsx`) call server actions in `src/lib/auth-actions.ts`; `/auth/callback` exchanges the email-confirmation code for a session; new signups get a `profiles` row auto-created by the `handle_new_user()` trigger (`supabase/migrations/0002_handle_new_user.sql`) with `is_coach` defaulting to `false`.

Route protection is in `src/proxy.ts` — **not** `middleware.ts`. This is a real Next.js 16 rename (Middleware → Proxy, same mechanism, `export function proxy` instead of `export function middleware`); don't "fix" the filename. It only checks whether a user is logged in and redirects to `/login`/`/`; it does **not** check role. Coach-only route gating (`/command-center`, `/lineups`) is instead enforced client-side via `RequireCoach` (`src/components/auth/RequireCoach.tsx`), used by `src/app/(app)/command-center/layout.tsx` and `src/app/(app)/lineups/layout.tsx`. `role: "paddler" | "coach"` is derived from `currentUser.is_coach` (see the race condition above) — a coach is also a full paddler in the data model (same `profiles` row, same attendance/weight/etc.), so `/` and `/profile` are intentionally *not* role-gated.

If Supabase isn't configured, `proxy.ts` is a no-op (no login required) and `AppShell` shows a manual Paddler/Coach toggle instead of a real session, flipping `currentUserId` between two fixed mock IDs (`CURRENT_USER_ID` / `CURRENT_COACH_ID` in `src/lib/mock-data.ts`) — this is the fast path for local UI work.

### Design system

The visual identity is grounded in dragon boat racing rather than generic Tailwind defaults: a "regatta teal" primary and vermilion "ember" accent are defined by overriding/extending Tailwind's color tokens via `@theme` in `src/app/globals.css` (so plain `teal-*` utility classes everywhere already pick up the custom palette — no need to hunt down every usage). Barlow Condensed is loaded in `src/app/layout.tsx` as `--font-barlow-condensed` and exposed as the `font-display` utility class, used for headings, card titles, and numerals (weights, countdowns, metrics) app-wide. New UI should follow this — condensed-caps `font-display` for headers/numbers, `focus-visible:ring-2 focus-visible:ring-teal-500` on interactive elements, and teal/ember (not arbitrary new hues) for brand accents.

`prototype.html` is a **separate, static, single-file mockup** (its own inline Tailwind CDN config, its own hand-rolled JS state, no shared code with the Next.js app) that intentionally mirrors the real app's dashboard/command-center/lineup UI and design tokens for demo purposes. It has no auth/role model. When making visual changes to the Next.js app, check whether `prototype.html` needs the equivalent change to stay in parity — it won't happen automatically. It's deployed to GitHub Pages via `.github/workflows/deploy-pages.yml` on every push to `main` (copies `prototype.html` to `dist/index.html`; the Next.js app itself isn't statically exported and isn't deployed there).

### Database (`supabase/migrations/`)

`0001_init.sql`: enums (`discipline_type`, `paddle_side`, `boat_type`, `attendance_status`) plus `profiles`, `sessions`, `attendance`, `races`, `race_commitments`, `lineups`, all with `updated_at` triggers and RLS (an `is_coach()` SQL helper gates writes to coach-only tables; paddlers can only write their own attendance/race_commitments rows). `0002_handle_new_user.sql`: the `handle_new_user()` trigger that creates a `profiles` row on signup. `0003_profile_eligibility_age_steer.sql`: replaces the old `is_pr_or_citizen` boolean with an `eligibility` enum (`Citizen`/`PR`/`Other`), splits the single `is_steer` boolean into boat-specific `is_oc_steer`/`is_db_steer`, and adds an optional `age_range` enum (`Under 40`/`40-50`/`50-60`/`60+`) — best-effort-migrates existing boolean values before dropping the old columns.

Note the RLS gap: `profiles_update_own_or_coach` allows a user to update *any column* on their own row, including `is_coach` — there's no column-level restriction. The app compensates by simply never sending `is_coach` (or `benchmarks`, `coaching_feedback`) in any self-service `updateProfile` patch (see `src/app/(app)/profile/page.tsx`); don't add a form field for it without also fixing the RLS policy.

Apply migrations via `supabase db push` or paste them into the SQL editor after linking a project, then copy `.env.local.example` to `.env.local`.

### Boat layouts and the lineup generator

`src/lib/boat-config.ts` defines `BOAT_LAYOUTS` (seat lists) for `DB12`/`DB22`/`V6` and `getBalanceGroups()`, which decides what the telemetry widget compares: Left vs Right seats for dragon boats, Bow vs Stern (first half vs second half of paddling seats) for the single-file `V6`. `WEIGHT_IMBALANCE_WARNING_KG` (15) is the threshold used by `TelemetryBar`.

`Lineup.seating_configuration` is a flat `seatId -> paddlerId | null` map (see `SeatingConfiguration` in `src/types/index.ts`). Bench membership is **derived, not stored**: it's "attending paddlers for this session" minus "paddler IDs currently present as a value in the seating map." The drag-and-drop logic lives entirely in `src/components/lineup/LineupEditor.tsx`'s `handleDragEnd` — dragging onto an occupied seat swaps the two occupants if the dragged paddler had a previous seat, or bumps the occupant back to the bench if the dragged paddler came from the bench. dnd-kit draggable IDs are paddler IDs; droppable IDs are seat IDs (plus the sentinel `BENCH_DROPPABLE_ID`).

### Routes

All under `src/app/(app)/` (wrapped in `AppDataProvider` + `AppShell`, see above) unless noted:

- `/` — paddler dashboard (`page.tsx`); role-agnostic, works identically for coaches (who are also paddlers)
- `/command-center` — coach-only roster/session view; gated by `command-center/layout.tsx` → `RequireCoach`
- `/lineups` — session/boat picker + list of existing lineups; gated by `lineups/layout.tsx` → `RequireCoach` (covers `/lineups/[lineupId]` too via layout nesting)
- `/lineups/[lineupId]` — the drag-and-drop editor, an async server component that awaits `params` and renders the client `LineupEditor`
- `/profile` — self-service profile form (name, weight, discipline, preferred side, boat roles, crew tags); not role-gated, reachable via the avatar link in `AppShell`'s header
- `/login`, `/signup` — outside the `(app)` group, no `AppDataProvider`/`AppShell`, use server actions from `src/lib/auth-actions.ts`
