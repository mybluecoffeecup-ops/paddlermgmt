-- workout_program was originally modeled as a per-session field, but it was
-- never actually session-specific: it's one standalone land-training/gym
-- plan for the whole team, updated weekly, decoupled from any session or
-- race. Split it into its own singleton table.
alter table sessions drop column workout_program;

create table workout_program (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  content text not null default '',
  updated_by uuid references profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint workout_program_singleton check (id = '00000000-0000-0000-0000-000000000001'::uuid)
);
insert into workout_program (id) values ('00000000-0000-0000-0000-000000000001');

alter table workout_program enable row level security;

create policy "workout_program_select_authenticated" on workout_program
  for select using (auth.role() = 'authenticated');
create policy "workout_program_update_coach" on workout_program
  for update using (is_coach());

create trigger workout_program_set_updated_at before update on workout_program
  for each row execute function set_updated_at();

-- Team-wide notifications (e.g. the weekly workout program broadcast) have
-- no linked session or race, so the previous "exactly one" check is relaxed
-- to "at most one."
alter table notifications drop constraint notifications_session_or_race_check;
alter table notifications add constraint notifications_session_or_race_check
  check ((session_id is not null)::int + (race_id is not null)::int <= 1);
