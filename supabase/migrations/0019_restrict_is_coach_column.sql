-- profiles_update_own_or_coach (0001_init.sql) allows a user to update
-- any column on their own row, including is_coach, with no column-level
-- restriction. The app has so far compensated purely by convention: the
-- self-service profile form (src/app/(app)/profile/page.tsx) never sends
-- is_coach in its patch. Now that a real coach-initiated "promote/demote
-- paddler" feature exists (RosterTable.tsx), enforce the same restriction
-- at the database level instead of relying only on client omission.
--
-- is_coach() (0001_init.sql) is security definer and looks up the acting
-- user's own row via auth.uid(), not the row being written, so this
-- correctly allows a coach to change is_coach on any profile (their own
-- or someone else's) while blocking a non-coach from ever changing it,
-- including on their own row.

create or replace function enforce_is_coach_change()
returns trigger as $$
begin
  if new.is_coach is distinct from old.is_coach and not is_coach() then
    raise exception 'Only coaches can change is_coach';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger profiles_guard_is_coach
  before update on profiles
  for each row
  execute function enforce_is_coach_change();
