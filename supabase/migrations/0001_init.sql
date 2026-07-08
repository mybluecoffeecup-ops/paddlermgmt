-- Paddler Management App - initial schema
-- Enums, core tables, and RLS policies for profiles, sessions, attendance,
-- races, race_commitments, and lineups.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type discipline_type as enum ('DB', 'OC', 'Both');
create type paddle_side as enum ('Left', 'Right', 'Ambi');
create type boat_type as enum ('DB12', 'DB22', 'V6');
create type attendance_status as enum ('Unconfirmed', 'Attending', 'Absent', 'Waitlist');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  weight_kg numeric(5, 2),
  is_pr_or_citizen boolean not null default false,
  primary_discipline discipline_type not null default 'DB',
  preferred_side paddle_side not null default 'Ambi',
  is_coach boolean not null default false,
  is_stroke boolean not null default false,
  is_steer boolean not null default false,
  is_drummer boolean not null default false,
  benchmarks jsonb not null default '{}'::jsonb,
  coaching_feedback text,
  crew_tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------

create table sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  session_date date not null,
  start_time time not null,
  discipline discipline_type not null default 'DB',
  type text not null default 'Practice',
  capacity_limit int,
  workout_program text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sessions_session_date_idx on sessions (session_date);

-- ---------------------------------------------------------------------------
-- attendance
-- ---------------------------------------------------------------------------

create table attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  paddler_id uuid not null references profiles (id) on delete cascade,
  status attendance_status not null default 'Unconfirmed',
  paddler_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, paddler_id)
);

create index attendance_session_id_idx on attendance (session_id);
create index attendance_paddler_id_idx on attendance (paddler_id);

-- ---------------------------------------------------------------------------
-- races
-- ---------------------------------------------------------------------------

create table races (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  description text,
  discipline discipline_type not null default 'DB',
  race_date date not null,
  registration_deadline date,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index races_race_date_idx on races (race_date);

-- ---------------------------------------------------------------------------
-- race_commitments
-- ---------------------------------------------------------------------------

create table race_commitments (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references races (id) on delete cascade,
  paddler_id uuid not null references profiles (id) on delete cascade,
  status attendance_status not null default 'Unconfirmed',
  has_paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (race_id, paddler_id)
);

create index race_commitments_race_id_idx on race_commitments (race_id);
create index race_commitments_paddler_id_idx on race_commitments (paddler_id);

-- ---------------------------------------------------------------------------
-- lineups
-- ---------------------------------------------------------------------------

create table lineups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  title text not null,
  boat boat_type not null,
  -- seating_configuration captures the live drag-and-drop seat map, e.g.
  -- { "seats": { "1L": "<paddler_id>", "1R": "<paddler_id>", ... } }
  seating_configuration jsonb not null default '{}'::jsonb,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lineups_session_id_idx on lineups (session_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger sessions_set_updated_at before update on sessions
  for each row execute function set_updated_at();
create trigger attendance_set_updated_at before update on attendance
  for each row execute function set_updated_at();
create trigger races_set_updated_at before update on races
  for each row execute function set_updated_at();
create trigger race_commitments_set_updated_at before update on race_commitments
  for each row execute function set_updated_at();
create trigger lineups_set_updated_at before update on lineups
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table sessions enable row level security;
alter table attendance enable row level security;
alter table races enable row level security;
alter table race_commitments enable row level security;
alter table lineups enable row level security;

-- Helper: is the current user a coach?
create or replace function is_coach()
returns boolean as $$
  select coalesce(
    (select is_coach from profiles where id = auth.uid()),
    false
  );
$$ language sql stable security definer set search_path = public;

-- profiles: everyone signed in can read the roster; users manage their own
-- row, coaches can manage any row.
create policy "profiles_select_authenticated" on profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_own_or_coach" on profiles
  for update using (auth.uid() = id or is_coach());
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- sessions: readable by all authenticated users, writable by coaches only.
create policy "sessions_select_authenticated" on sessions
  for select using (auth.role() = 'authenticated');
create policy "sessions_write_coach" on sessions
  for all using (is_coach()) with check (is_coach());

-- attendance: paddlers manage their own RSVP, coaches manage all.
create policy "attendance_select_authenticated" on attendance
  for select using (auth.role() = 'authenticated');
create policy "attendance_upsert_own_or_coach" on attendance
  for insert with check (auth.uid() = paddler_id or is_coach());
create policy "attendance_update_own_or_coach" on attendance
  for update using (auth.uid() = paddler_id or is_coach());
create policy "attendance_delete_coach" on attendance
  for delete using (is_coach());

-- races: readable by all, writable by coaches only.
create policy "races_select_authenticated" on races
  for select using (auth.role() = 'authenticated');
create policy "races_write_coach" on races
  for all using (is_coach()) with check (is_coach());

-- race_commitments: paddlers manage their own commitment, coaches manage all.
create policy "race_commitments_select_authenticated" on race_commitments
  for select using (auth.role() = 'authenticated');
create policy "race_commitments_upsert_own_or_coach" on race_commitments
  for insert with check (auth.uid() = paddler_id or is_coach());
create policy "race_commitments_update_own_or_coach" on race_commitments
  for update using (auth.uid() = paddler_id or is_coach());
create policy "race_commitments_delete_coach" on race_commitments
  for delete using (is_coach());

-- lineups: readable by all, writable by coaches only.
create policy "lineups_select_authenticated" on lineups
  for select using (auth.role() = 'authenticated');
create policy "lineups_write_coach" on lineups
  for all using (is_coach()) with check (is_coach());
