-- Session location (races already have one) and race-linked lineups:
-- a lineup can now belong to either a session or a race, not just a
-- session, so LineupEditor can source its paddler pool from race
-- commitments when building a lineup for a race.

alter table sessions add column location text;

alter table lineups
  alter column session_id drop not null,
  add column race_id uuid references races (id) on delete cascade;

alter table lineups
  add constraint lineups_session_or_race_check
  check ((session_id is not null)::int + (race_id is not null)::int = 1);

create index lineups_race_id_idx on lineups (race_id);
