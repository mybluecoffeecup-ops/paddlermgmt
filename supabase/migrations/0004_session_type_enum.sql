-- Restrict sessions.type to a fixed set (Training / Race Simulation / Race)
-- instead of free text. Existing values are best-effort mapped onto the new
-- set before the column is converted, same approach as 0003's enum migration.

create type session_type as enum ('Training', 'Race Simulation', 'Race');

alter table sessions
  alter column type drop default;

alter table sessions
  alter column type type session_type
  using (
    case type
      when 'Race Prep' then 'Race Simulation'
      when 'Race Simulation' then 'Race Simulation'
      when 'Race' then 'Race'
      else 'Training'
    end
  )::session_type;

alter table sessions
  alter column type set default 'Training';
