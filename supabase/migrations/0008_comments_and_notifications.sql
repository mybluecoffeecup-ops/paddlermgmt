-- Comments (any paddler can comment on a session or race) and
-- notifications (a coach broadcasts one row per save; read_by tracks
-- which paddlers have seen it, mirroring the crew_tags/race_categories
-- array-column pattern rather than fanning out a row per recipient).

create table comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete cascade,
  race_id uuid references races (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_session_or_race_check
    check ((session_id is not null)::int + (race_id is not null)::int = 1)
);

create index comments_session_id_idx on comments (session_id);
create index comments_race_id_idx on comments (race_id);

alter table comments enable row level security;

create policy "comments_select_authenticated" on comments
  for select using (auth.role() = 'authenticated');
create policy "comments_insert_own" on comments
  for insert with check (auth.uid() = author_id);
create policy "comments_delete_own_or_coach" on comments
  for delete using (auth.uid() = author_id or is_coach());

create table notifications (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete cascade,
  race_id uuid references races (id) on delete cascade,
  title text not null,
  body text not null,
  read_by uuid[] not null default '{}',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint notifications_session_or_race_check
    check ((session_id is not null)::int + (race_id is not null)::int = 1)
);

create index notifications_session_id_idx on notifications (session_id);
create index notifications_race_id_idx on notifications (race_id);

alter table notifications enable row level security;

create policy "notifications_select_authenticated" on notifications
  for select using (auth.role() = 'authenticated');
create policy "notifications_insert_coach" on notifications
  for insert with check (is_coach());
-- No column-level RLS for read_by (same gap/compensation pattern already
-- documented for profiles.is_coach in CLAUDE.md): any authenticated user
-- can technically update any column, but the app only ever PATCHes
-- { read_by } when marking a notification read.
create policy "notifications_update_authenticated" on notifications
  for update using (auth.role() = 'authenticated');
