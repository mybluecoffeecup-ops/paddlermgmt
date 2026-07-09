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

**Switching between mock and live mode locally**: since `isSupabaseConfigured` is read once at server start, there's no in-app toggle for it — comment out (or delete) `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and restart `npm run dev` to force mock mode (the Paddler/Coach toggle reappears); uncomment and restart again to go back to live mode. `MOCK_PROFILES` in `src/lib/mock-data.ts` currently seeds 30 paddlers with full field variety (all `ALL_CREW_TAGS` values included) for exercising roster/filter/lineup UI without touching the real database.

### Design system: "Kit Green & Gold"

The visual identity is a flat, sporty, high-contrast look tuned for outdoor/sunlight readability — a green-and-gold palette inspired by national team kit colors, editorial and minimalist rather than soft SaaS defaults. **No drop shadows, no gradients, no backdrop-blur anywhere** — panel definition comes from a solid 2px border, not elevation.

Color tokens are defined inside an **`@theme { ... }` block** in `src/app/globals.css` and consumed through Tailwind v4's automatic utility generation (so plain `green-*`/`gold-*` classes everywhere already pick up the palette — no need to hunt down every usage). **They must stay inside `@theme`, not plain `:root`** — this broke once already: a `--color-green-700` declared in `:root` does *not* make `bg-green-700` use it, because `green` is already a stock Tailwind color family, so the class silently falls back to Tailwind's own built-in green (wrong hex, looks "close enough" to pass a casual glance) — and non-stock names (`gold`/`pitch`/`redcard`/`ink`/`chalk`) generate no utility at all in `:root`, rendering as invisible/transparent (white-on-white). If a future color token edit seems to have no visual effect, check it's still inside `@theme` first.
- **`green-*`** — primary brand/action color, a vivid Kit Green. `green-700` is the AAA-contrast (7.9:1 white text) "solid fill" shade used for buttons/active states/badges; `green-500`/`600` are for borders, icons, and text-on-white accents.
- **`gold-*`** — secondary accent and the "caution" semantic (payment due, waitlist, imbalance warnings). **Rule: gold is always a solid fill with Ink text on top, never gold text on a light background** — the lighter/mid gold steps fail text contrast.
- **`pitch-*`** — deep green-black. Used for `AppShell`'s nav bar (a constant "team color" toolbar in both light and dark mode) and as the dark-mode background.
- **`redcard-*`** — functional-only alert color (Absent, destructive, errors), never decorative.
- **`ink`** / **`chalk`** — single-value flat tokens (`#101410` / `#ffffff`) for primary text/panel borders and background, wired as `--background`/`--foreground` (so `bg-background`/`text-foreground` utilities exist too).

The **soccer-card status system** in `src/components/ui/Badge.tsx` is the signature element: `AttendanceBadge`/`DisciplineBadge` render solid rectangular tags (not pale tinted pills) — Attending/Paid/DB → green-700 fill; Absent → redcard-700 fill (a literal red card); Waitlist/Payment due/OC → gold-500 fill with Ink text (a literal yellow card); Unconfirmed → Ink-outlined with no fill. Since this one file controls status coloring everywhere (roster table, race RSVPs, session attendance), keep new status UI going through it rather than hand-rolling colors.

Shape language: `rounded-full` is reserved for genuinely circular elements (the avatar, small side-indicator dots, circular RSVP buttons) — everything else uses a small, deliberate radius scale (`rounded-md` for panels, `rounded` for buttons/inputs/icon chips/tags). Barlow Condensed (loaded in `src/app/layout.tsx` as `--font-barlow-condensed`, exposed as `font-display`) is used for headings, panel titles, and numerals app-wide — keep leaning on it for anything condensed-caps/numeric. Body text uses **Barlow** (regular width, `--font-barlow`/`font-sans`), the same type family as the display face at a different optical width, loaded at medium/semibold/bold weights only (no light/regular 400 — thin weights are hard to read in bright glare).

Contrast is a hard constraint, not a nice-to-have: secondary/label text is never `slate-400`/`slate-500` on a light background (that's exactly what disappears in sunlight glare) — use `slate-600`/`slate-700` minimum. New UI should follow this: `font-display` uppercase-tracking-wide for headers/numbers, `focus-visible:ring-2 focus-visible:ring-green-500` on interactive elements, a solid `border-2 border-ink` (not a shadow) for panel definition, and green/gold/pitch/redcard (not arbitrary new hues, not stock Tailwind `emerald`/`amber`/`rose`) for anything semantically colored.

`prototype.html` is a **separate, static, single-file mockup** (its own inline Tailwind CDN config with its *own* teal/ember color tokens, its own hand-rolled JS state and hand-drawn SVG icons, no shared code with the Next.js app) that intentionally mirrors the real app's dashboard/command-center/lineup UI for demo purposes. It has no auth/role model. **It currently still has the old regatta-teal look and has not been updated to Kit Green & Gold** — that parity gap is deliberate (a separate follow-up pass), not an oversight; don't assume the two match visually right now. When making further visual changes to the Next.js app, still check whether `prototype.html` needs the equivalent change to stay in parity going forward — it won't happen automatically. It's deployed to GitHub Pages via `.github/workflows/deploy-pages.yml` on every push to `main` (copies `prototype.html` to `dist/index.html`; the Next.js app itself isn't statically exported and isn't deployed there).

### Database (`supabase/migrations/`)

`0001_init.sql`: enums (`discipline_type`, `paddle_side`, `boat_type`, `attendance_status`) plus `profiles`, `sessions`, `attendance`, `races`, `race_commitments`, `lineups`, all with `updated_at` triggers and RLS (an `is_coach()` SQL helper gates writes to coach-only tables; paddlers can only write their own attendance/race_commitments rows). `0002_handle_new_user.sql`: the `handle_new_user()` trigger that creates a `profiles` row on signup. `0003_profile_eligibility_age_steer.sql`: replaces the old `is_pr_or_citizen` boolean with an `eligibility` enum (`Citizen`/`PR`/`Other`), splits the single `is_steer` boolean into boat-specific `is_oc_steer`/`is_db_steer`, and adds an optional `age_range` enum (`Under 40`/`40-50`/`50-60`/`60+`) — best-effort-migrates existing boolean values before dropping the old columns. `0004_session_type_enum.sql`: converts `sessions.type` from free text to a `session_type` enum (`Training`/`Race Simulation`/`Race`), best-effort-mapping old free-text values (e.g. `'Race Prep'` → `'Race Simulation'`, anything unrecognized → `'Training'`) before the column type change.

Note the RLS gap: `profiles_update_own_or_coach` allows a user to update *any column* on their own row, including `is_coach` — there's no column-level restriction. The app compensates by simply never sending `is_coach` (or `benchmarks`, `coaching_feedback`) in any self-service `updateProfile` patch (see `src/app/(app)/profile/page.tsx`); don't add a form field for it without also fixing the RLS policy.

Apply migrations via `supabase db push` or paste them into the SQL editor after linking a project, then copy `.env.local.example` to `.env.local`.

### Boat layouts and the lineup generator

`src/lib/boat-config.ts` defines `BOAT_LAYOUTS` (seat lists) for `DB12`/`DB22`/`V6` and `getBalanceGroups()`, which decides what the telemetry widget compares: Left vs Right seats for dragon boats, Bow vs Stern (first half vs second half of paddling seats) for the single-file `V6`. `WEIGHT_IMBALANCE_WARNING_KG` (15) is the threshold used by `TelemetryBar`.

`Lineup.seating_configuration` is a flat `seatId -> paddlerId | null` map (see `SeatingConfiguration` in `src/types/index.ts`). Bench membership is **derived, not stored**: it's "attending paddlers for this session" minus "paddler IDs currently present as a value in the seating map." The drag-and-drop logic lives entirely in `src/components/lineup/LineupEditor.tsx`'s `handleDragEnd` — dragging onto an occupied seat swaps the two occupants if the dragged paddler had a previous seat, or bumps the occupant back to the bench if the dragged paddler came from the bench. dnd-kit draggable IDs are paddler IDs; droppable IDs are seat IDs (plus the sentinel `BENCH_DROPPABLE_ID`).

### Session creation

`SessionManager.tsx` (in Command Center) owns both browsing sessions and creating them: a "+ New Session" button in its `CardHeader` toggles an inline `NewSessionForm` that *replaces* the session-picker list while open (no modal component exists anywhere in this codebase — every "create" flow is an inline `Card` form, not a popup). `type` is a closed `SessionType` union (`"Training" | "Race Simulation" | "Race"`, `SESSION_TYPE_OPTIONS` in `src/types/index.ts`) backed by the `session_type` Postgres enum (`0004_session_type_enum.sql`) — unlike most other fields, this one used to be a free-text column and was tightened after the fact, so don't assume every string is a valid session type without checking this union first.

The "Repeat weekly" option is a thin client-side convenience, not a real recurrence feature: checking it just calls the `createSession` mutator (`src/hooks/app-data.tsx`) once per week in a loop (2–12 occurrences), each with `session_date` advanced by 7 days via `addDaysIso` (`src/lib/utils.ts`). `createSession` never throws — it updates local state and returns synchronously regardless of whether the background Supabase insert (when live) succeeds, so the loop can't detect partial failures and doesn't try to. Session IDs are `session-${Date.now()}-${crypto.randomUUID()}`; the timestamp alone isn't sufficient because synchronous loop iterations can share the same millisecond (this caused a real duplicate-React-key bug before the `randomUUID()` suffix was added — don't drop it if touching this code).

### Routes

All under `src/app/(app)/` (wrapped in `AppDataProvider` + `AppShell`, see above) unless noted:

- `/` — paddler dashboard (`page.tsx`); role-agnostic, works identically for coaches (who are also paddlers)
- `/command-center` — coach-only roster/session view; gated by `command-center/layout.tsx` → `RequireCoach`
- `/lineups` — session/boat picker + list of existing lineups; gated by `lineups/layout.tsx` → `RequireCoach` (covers `/lineups/[lineupId]` too via layout nesting)
- `/lineups/[lineupId]` — the drag-and-drop editor, an async server component that awaits `params` and renders the client `LineupEditor`
- `/profile` — self-service profile form (name, weight, discipline, preferred side, eligibility, age range, boat roles [pacer/drummer/OC steer/DB steer], crew tags); not role-gated, reachable via the avatar link in `AppShell`'s header
- `/login`, `/signup` — outside the `(app)` group, no `AppDataProvider`/`AppShell`, use server actions from `src/lib/auth-actions.ts`
