-- Regroup the crew_tags / race_categories taxonomy into Gender (Men's,
-- Women's, Mixed) and Age Range (Opens, Masters, Masters 50/60/70) groups,
-- plus an ungrouped Other bucket (Premier Mixed, Novice). Youth is removed.
-- Both columns remain free-form text[] (no enum) — see CrewTag in
-- src/types/index.ts for the authoritative value list.

update profiles set crew_tags = array_replace(crew_tags, 'Women', 'Women''s');
update profiles set crew_tags = array_replace(crew_tags, 'Men', 'Men''s');
update profiles set crew_tags = array_remove(crew_tags, 'Youth');

update races set race_categories = array_replace(race_categories, 'Women', 'Women''s');
update races set race_categories = array_replace(race_categories, 'Men', 'Men''s');
update races set race_categories = array_remove(race_categories, 'Youth');

comment on column profiles.crew_tags is 'Free-form tags; valid values are the Gender group (Men''s/Women''s/Mixed), Age Range group (Opens/Masters/Masters 50/Masters 60/Masters 70), or Other (Premier Mixed/Novice) — see CrewTag in src/types/index.ts.';
comment on column races.race_categories is 'Same taxonomy as profiles.crew_tags — see CrewTag in src/types/index.ts.';
