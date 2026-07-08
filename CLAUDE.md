# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build — also runs the TypeScript check
npm run lint     # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # type-check only, faster than a full build
```

There is no test suite configured in this repo.

Global npm config on this machine pins npm's `allow-scripts` security feature and disallows project-level overrides — plain `npm install` works (scripts run only for allow-listed packages), but anything that passes `--allow-scripts` explicitly (e.g. some `create-*` scaffolding tools) will fail with `EALLOWSCRIPTS`.

## Architecture

Next.js App Router + TypeScript + Tailwind v4, mobile/iPad-first, backed by Supabase/Postgres. No auth is wired up yet — see "No real auth" below.

### Data layer: one context, three consumers

`src/hooks/app-data.tsx` (`AppDataProvider`/`useAppData`) is the single source of truth for all domain data (profiles, sessions, attendance, races, race_commitments, lineups) and is mounted once in `src/app/layout.tsx`, wrapping every route. All three views (`/`, `/command-center`, `/lineups/*`) read and mutate through this one hook — there is no per-page fetching.

- State is seeded from `src/lib/mock-data.ts` and used as-is when Supabase isn't configured.
- `src/lib/supabase/client.ts` exports `isSupabaseConfigured` (true when `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set). When true, `AppDataProvider` fetches live rows on mount and every mutator (`rsvpToSession`, `updateProfile`, `updateSession`, `createSession`, `updateRaceCommitment`, `createLineup`, `saveLineupSeating`) updates local state optimistically *and* fires the matching `src/lib/api/*.ts` CRUD call. API failures are logged, not rolled back.
- `src/lib/supabase/database.types.ts` documents the table shapes but is **not** passed as a generic to `createBrowserClient` — supabase-js's `GenericTable` constraints didn't structurally match hand-written row types without heavy boilerplate, so each `api/*.ts` function casts its result to the domain type from `src/types/index.ts` instead.
- Domain types in `src/types/index.ts` mirror the SQL schema 1:1; treat that file and the migration as the source of truth together.

### No real auth — role switching is a UI toggle

There's no Supabase Auth integration. `AppShell` (`src/components/nav/AppShell.tsx`) has a Paddler/Coach toggle that flips `AppDataProvider`'s `role` state, which swaps `currentUserId` between two fixed mock IDs (`CURRENT_USER_ID` / `CURRENT_COACH_ID` in `src/lib/mock-data.ts`). Wiring real auth means replacing that toggle with a Supabase session and deriving `role` from `profiles.is_coach`.

### Database (`supabase/migrations/0001_init.sql`)

Enums (`discipline_type`, `paddle_side`, `boat_type`, `attendance_status`) plus `profiles`, `sessions`, `attendance`, `races`, `race_commitments`, `lineups`, all with `updated_at` triggers and RLS (an `is_coach()` SQL helper gates writes to coach-only tables; paddlers can only write their own attendance/race_commitments rows). **This migration has not been applied to any live project** — there's no Supabase CLI in this environment. Apply it via `supabase db push` or paste it into the SQL editor after linking a project, then copy `.env.local.example` to `.env.local`.

### Boat layouts and the lineup generator

`src/lib/boat-config.ts` defines `BOAT_LAYOUTS` (seat lists) for `DB12`/`DB22`/`V6` and `getBalanceGroups()`, which decides what the telemetry widget compares: Left vs Right seats for dragon boats, Bow vs Stern (first half vs second half of paddling seats) for the single-file `V6`. `WEIGHT_IMBALANCE_WARNING_KG` (15) is the threshold used by `TelemetryBar`.

`Lineup.seating_configuration` is a flat `seatId -> paddlerId | null` map (see `SeatingConfiguration` in `src/types/index.ts`). Bench membership is **derived, not stored**: it's "attending paddlers for this session" minus "paddler IDs currently present as a value in the seating map." The drag-and-drop logic lives entirely in `src/components/lineup/LineupEditor.tsx`'s `handleDragEnd` — dragging onto an occupied seat swaps the two occupants if the dragged paddler had a previous seat, or bumps the occupant back to the bench if the dragged paddler came from the bench. dnd-kit draggable IDs are paddler IDs; droppable IDs are seat IDs (plus the sentinel `BENCH_DROPPABLE_ID`).

### Routes

- `/` — paddler dashboard (`src/app/page.tsx`)
- `/command-center` — coach/captain view (`src/app/command-center/page.tsx`)
- `/lineups` — session/boat picker + list of existing lineups (`src/app/lineups/page.tsx`)
- `/lineups/[lineupId]` — the drag-and-drop editor, an async server component that awaits `params` and renders the client `LineupEditor`
