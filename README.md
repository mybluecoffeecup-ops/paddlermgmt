# PADDLES UP — Paddle Sports Crew Management

A team management app for dragon boat and outrigger crews — RSVPs, attendance, race commitments, and drag-and-drop boat lineups — built with Next.js App Router, TypeScript, Tailwind v4, and Supabase/Postgres.

The visual identity — a sporty, high-contrast "Kit Green & Gold" palette (inspired by national-team kit colors), soft-shadow/rounded mobile-app styling, and Barlow/Barlow Condensed display type with condensed numerals throughout — is grounded in dragon boat racing itself rather than generic UI defaults. A manual light/dark toggle (floating button, bottom-right of every screen) lets you flip the whole app between themes; it remembers your choice. The app mark is a crossed dragon-boat paddle and outrigger paddle (`src/components/ui/PaddlesIcon.tsx`), used in the header, login/signup, and as the browser-tab/PWA icon.

**Live prototype:** https://mybluecoffeecup-ops.github.io/paddlermgmt/

The live link above serves [`prototype.html`](prototype.html), a standalone, single-file interactive mockup (mock data, no backend) with three tabs — Paddler Home, Coach/Captain Command Center, and a Lineup Tool — that runs entirely in the browser. **Note:** `prototype.html` is a known, deliberate gap, not an oversight — it still uses the old "Paddler Management" branding, the older teal/ember look, and the pre-restructure three-tab layout; it hasn't been updated to match the Next.js app's current Kit Green & Gold redesign, PADDLES UP rebrand, or six-page navigation yet. The full Next.js application described below is the real app and currently runs locally.

## Features

- **Home dashboard** (`/`; mirrored in the "Paddler Home" tab in `prototype.html`) — a profile summary card (weight, preferred side for DB/Both paddlers, Pacer/OC Steer/DB Steer/Drummer role badges), quick Going/Not Going RSVP to a scrollable list of upcoming sessions, a scrollable Race Tracking card with live per-race countdowns, RSVP/payment status, and a lime-highlighted "going" count of attending crewmates, a "This Week's Program" card showing the coach-broadcast land training/gym plan, and a private "Coaching Feedback Corner" for cues from coaching staff. Works identically for coaches, since a coach is also a full paddler in the data model
- **Session & race detail pages** (`/sessions/[sessionId]`, `/races/[raceId]`) — tap any session or race row anywhere in the app to open its full detail view: date/time, location, linked lineups, and a comment thread open to any signed-in paddler. Coaches get an inline "Edit" toggle to update the details and save; saving fires an in-app notification to the whole crew, surfaced via a bell icon (with unread badge) in the header
- **Profile page** (`/profile`) — self-service editing of name, weight, discipline, preferred side, eligibility (Citizen/PR/Other), age range, boat roles (Pacer, Drummer, OC Steer, DB Steer), and crew categories (grouped into Gender, Age Range, and Other), reachable via the header avatar
- **Session Mgmt** (`/sessions`) — a session manager for browsing/creating sessions (including a "repeat weekly" option), with each session row tapping through to its detail page while still driving the metrics/roster panels below; a metrics summary (headcount vs. boat capacity, total attending weight, response rate, discipline); a collapsible Segment Roster filter (discipline plus Gender/Age Range/Other category tags) paired with the roster table; and a standalone Weekly Workout Program panel (land training/gym, not tied to any session) for broadcasting markdown training plans to the crew. Restricted to coaches client-side
- **Calendar** (`/calendar`) — an Outlook-style calendar: a sidebar shows one month at a time (compact dot-grid with prev/next chevrons) plus a scrollable "Upcoming" list of the next 10 items, and whichever month is selected there is shown "blown up" as a full day-by-day grid in the main panel — clicking any day opens a Day Detail panel with that day's full event list. Merges two sources: real races (from the same race-management panel as before — date, location, discipline, competitiveness level, category tags — each row still tapping through to its `/races/[raceId]` detail page for RSVP) and a broader set of `calendar_events` (training blocks, socials, public holidays, membership deadlines, club meetings) that coaches can add inline. On mobile the full grid is replaced by the same compact sidebar month view pinned at top (tap a day for its detail below; the Upcoming list collapses to save space, tap to expand). Viewable by everyone; only coaches see the add-race/add-event forms. Seeded with the club's real 2026 calendar
- **Lineup builder** (`/lineups`, `/lineups/[lineupId]`; standalone "Lineup Tool" tab in `prototype.html`) — drag-and-drop seat assignment across boat layouts (DB12, DB22, V6), including dedicated Drummer/Steer seats on dragon boats (centered between the Left/Right columns), a color key for the side-preference/mismatch indicators and Pacer/Steer/Drummer role icons, and a live left/right (or odd/even, for the single-file V6) weight-balance telemetry bar. Click any bench paddler to auto-assign them to their best-fit open seat, or drag-and-drop for manual control. Lineups can be built against a session (bench sourced from session attendance) or a race (bench sourced from race commitments) via a Session/Race toggle on lineup creation, and a lineup's boat type (DB12/DB22/V6) can be switched after creation from inside the editor. Restricted to coaches client-side
- **Info** (`/info`) — work-in-progress placeholder for team information and a reference document library
- **Orders** (`/orders`) — work-in-progress placeholder for team gear/apparel ordering
- **Auth** — real Supabase Auth (email/password) once a Supabase project is configured: `/login` and `/signup`, route protection via `src/proxy.ts`, and a `profiles` row auto-created per signup. Paddler vs. Coach view is derived from `profiles.is_coach`; Session Mgmt and Lineups are fully coach-gated client-side via `RequireCoach`, while Calendar is open to both roles (coach-only race/event management, crew-wide viewing) since a coach is also a paddler — `/`, `/profile`, `/calendar`, `/info`, and `/orders` stay open to both roles. Without Supabase configured, the app falls back to a Paddler/Coach UI toggle over mock data (no login required) for local development

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

By default the app runs entirely on mock data from `src/lib/mock-data.ts` (a 30-paddler roster) — no environment setup required, and `/login`/`/signup` are bypassed. To connect a real Supabase project, copy `.env.local.example` to `.env.local`, fill in your project's URL and anon key (plus `NEXT_PUBLIC_SITE_URL` for email-confirmation redirects), and apply the migrations in `supabase/migrations/` in order (`0001_init.sql` through `0011_calendar_events_seed.sql`). To switch an already-configured project back to mock mode for local UI work, comment out the two Supabase env vars in `.env.local` and restart the dev server.

## Project structure

```
src/
  app/
    (app)/                # routes wrapped in AppDataProvider + AppShell: /, /profile, /sessions, /calendar,
                           # /lineups, /lineups/[lineupId], /sessions/[sessionId], /races/[raceId], /info, /orders
    login/, signup/       # auth pages (server actions, no AppShell chrome)
    auth/callback/        # exchanges Supabase email-confirmation code for a session
    icon.svg              # App Router favicon convention (crossed dragon-boat/outrigger paddle mark)
  components/
    auth/                 # RequireCoach client-side route guard
    dashboard/            # paddler home dashboard widgets, incl. WeeklyProgramCard
    command-center/        # roster, filters, session manager, race manager, WorkoutProgramPanel
                           # (shared by the /sessions and /calendar pages)
    calendar/              # CalendarMiniMonth (sidebar month nav), CalendarMonthGrid (full day grid),
                           # CalendarDayDetail, CalendarUpcomingList, CalendarEventManager (coach form)
    sessions/, races/     # SessionDetail / RaceDetail — tap-through detail views with coach editing
    shared/                # CommentsSection, LineupsSection — reused by both detail views
    lineup/               # drag-and-drop boat editor, telemetry, seat/bench UI, color key (session- or race-linked)
    nav/                  # AppShell (role badge/sign-out or demo toggle, navigation), BrandMark, NotificationBell
    ui/                   # shared primitives, incl. PaddlesIcon, WorkInProgress, and calendar category badges
  hooks/app-data.tsx      # single data-fetching context consumed by all routes
  lib/
    api/                  # Supabase CRUD calls per table (incl. comments, notifications, workout_program)
    auth-actions.ts       # login/signup/logout server actions
    auto-assign-seat.ts   # click-to-add best-fit seat logic for the lineup builder
    boat-config.ts        # seat layouts + balance-group logic for DB12/DB22/V6
    calendar-utils.ts     # merges races + calendar_events into one list, month/day grouping for the Calendar page
    paddle-side-colors.ts # shared color map for side-preference indicators + the lineup color key
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
