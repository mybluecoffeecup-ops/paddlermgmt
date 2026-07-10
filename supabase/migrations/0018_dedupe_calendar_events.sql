-- calendar_events had no uniqueness constraint beyond `id`, so re-applying
-- the 0011 seed insert (e.g. pasting it into the SQL editor twice) silently
-- clones every row with a fresh random id. This migration removes exact
-- content duplicates (same title/start_date/end_date/category/discipline,
-- keeping the earliest-created row of each group) and then adds a unique
-- index so it can't happen again.
--
-- discipline is nullable, and unique indexes treat NULL <> NULL, so the
-- index is built on coalesce(discipline::text, '') rather than the raw
-- column.

delete from calendar_events
using (
  select
    id,
    row_number() over (
      partition by title, start_date, end_date, category, discipline
      order by created_at, id
    ) as rn
  from calendar_events
) dupes
where calendar_events.id = dupes.id
  and dupes.rn > 1;

create unique index calendar_events_dedupe_idx on calendar_events (
  title,
  start_date,
  end_date,
  category,
  coalesce(discipline::text, '')
);

-- Residual risk: 0011_calendar_events_seed.sql itself is a plain insert with
-- no `on conflict do nothing`, so re-running it as-is will now fail loudly
-- (good — no more silent duplication) rather than being swallowed. Making
-- that seed migration idempotent is a separate follow-up, not done here.
