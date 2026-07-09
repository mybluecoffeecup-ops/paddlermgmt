-- Race schema additions:
-- - race_categories (text[]) — which crew categories the race is open to,
--   reusing the same values as profiles.crew_tags
-- - competitiveness_level (enum) — whether this is a target race or a
--   participation/experience-only race

create type race_competitiveness_level as enum ('Target Race', 'Participation/Experience Race');

alter table races
  add column race_categories text[] not null default '{}',
  add column competitiveness_level race_competitiveness_level not null default 'Participation/Experience Race';
