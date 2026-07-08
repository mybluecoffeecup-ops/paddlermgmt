-- Paddler details schema changes:
-- - is_pr_or_citizen (boolean) -> eligibility ('Citizen' | 'PR' | 'Other')
-- - is_steer (boolean) -> is_oc_steer + is_db_steer (boat-specific steer qualification)
-- - new optional age_range field

create type eligibility_status as enum ('Citizen', 'PR', 'Other');
create type age_range as enum ('Under 40', '40-50', '50-60', '60+');

alter table profiles
  add column eligibility eligibility_status not null default 'Other',
  add column age_range age_range,
  add column is_oc_steer boolean not null default false,
  add column is_db_steer boolean not null default false;

update profiles set eligibility = 'Citizen' where is_pr_or_citizen;
update profiles set is_oc_steer = is_steer, is_db_steer = is_steer;

alter table profiles
  drop column is_pr_or_citizen,
  drop column is_steer;
