-- Extend notifications with a third target (order_id) and an `audience`
-- concept, so an order-submitted notification can be coach-only without
-- touching the existing session/race broadcast behavior (SessionDetail,
-- RaceDetail, WorkoutProgramPanel), which stays global ('all').

create type notification_audience as enum ('all', 'coach');

alter table notifications
  add column order_id uuid references shop_orders (id) on delete cascade,
  add column audience notification_audience not null default 'all';

-- Replace "exactly one of session_id/race_id" with "at most one of
-- session_id/race_id/order_id". This also fixes a pre-existing bug:
-- WorkoutProgramPanel.tsx already calls notifyAll(..., {}) with no target,
-- which the old "exactly one" check silently rejected (masked only by the
-- fire-and-forget .catch(console.error) in notifyAll) — it now succeeds.
alter table notifications drop constraint notifications_session_or_race_check;
alter table notifications add constraint notifications_target_check
  check (
    (session_id is not null)::int
    + (race_id is not null)::int
    + (order_id is not null)::int
    <= 1
  );

-- select: everyone sees 'all' notifications; 'coach' notifications are
-- coach-only. Replaces the old blanket "any authenticated user" policy.
drop policy "notifications_select_authenticated" on notifications;
create policy "notifications_select_scoped" on notifications
  for select using (audience = 'all' or is_coach());

-- insert: notifications_insert_coach (coaches, any audience) is untouched.
-- New: a paddler may insert a 'coach'-audience notification tied to THEIR
-- OWN order — nothing else. They can't forge a broadcast or notify about
-- someone else's order.
create policy "notifications_insert_paddler_order" on notifications
  for insert with check (
    audience = 'coach' and order_id is not null
    and exists (select 1 from shop_orders o
      where o.id = order_id and o.paddler_id = auth.uid())
  );

-- update: tighten to match select scoping — previously ANY authenticated
-- user could blind-UPDATE (e.g. toggle read_by on) any notification row by
-- id, even one they can't SELECT. Scoping this closes that gap now that
-- 'coach' rows carry real information a paddler shouldn't touch.
drop policy "notifications_update_authenticated" on notifications;
create policy "notifications_update_scoped" on notifications
  for update using (audience = 'all' or is_coach());
