-- Rename attendance_status values to match the app's RSVP wording
-- (Going/Maybe/Not Going) and drop the unused Waitlist value:
-- Unconfirmed -> Maybe, Attending -> Going, Absent -> Not Going,
-- Waitlist -> Maybe (best-effort, same as an unanswered RSVP).
-- attendance_status is shared by attendance.status and
-- race_commitments.status, so both columns are migrated.

create type attendance_status_new as enum ('Going', 'Maybe', 'Not Going');

alter table attendance
  alter column status drop default;
alter table attendance
  alter column status type attendance_status_new
  using (
    case status::text
      when 'Attending' then 'Going'
      when 'Absent' then 'Not Going'
      else 'Maybe'
    end
  )::attendance_status_new;
alter table attendance
  alter column status set default 'Maybe';

alter table race_commitments
  alter column status drop default;
alter table race_commitments
  alter column status type attendance_status_new
  using (
    case status::text
      when 'Attending' then 'Going'
      when 'Absent' then 'Not Going'
      else 'Maybe'
    end
  )::attendance_status_new;
alter table race_commitments
  alter column status set default 'Maybe';

drop type attendance_status;
alter type attendance_status_new rename to attendance_status;
