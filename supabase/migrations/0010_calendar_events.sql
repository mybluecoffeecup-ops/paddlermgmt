-- Calendar: a broader club calendar (races, training blocks, socials, public
-- holidays, membership deadlines, meetings) separate from the `races` table.
-- `races` stays reserved for races the club is actually fielding a boat for
-- (RSVP + lineup-linked); calendar_events is lighter-weight, read-by-everyone,
-- coach-editable reference data shown alongside races in the Calendar view.

create type calendar_event_category as enum (
  'Race',
  'Training',
  'Social',
  'Meeting',
  'Holiday',
  'Deadline',
  'Other'
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date not null,
  category calendar_event_category not null default 'Other',
  discipline discipline_type,
  notes text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_date_range_check check (end_date >= start_date)
);

create index calendar_events_start_date_idx on calendar_events (start_date);

create trigger calendar_events_set_updated_at before update on calendar_events
  for each row execute function set_updated_at();

alter table calendar_events enable row level security;

-- calendar_events: readable by all, writable by coaches only (same pattern
-- as races/lineups).
create policy "calendar_events_select_authenticated" on calendar_events
  for select using (auth.role() = 'authenticated');
create policy "calendar_events_write_coach" on calendar_events
  for all using (is_coach()) with check (is_coach());
