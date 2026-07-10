-- Team Info document library: links to external web documents (Google
-- Docs/Slides/Forms/Sheets, or any other URL) surfaced in the Info page's
-- "Team Info" panel. Link-only by design — no file storage/upload — so this
-- is just a title/url/description, readable by everyone and writable by
-- coaches only (same pattern as calendar_events).

create table team_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_documents_created_at_idx on team_documents (created_at);

create trigger team_documents_set_updated_at before update on team_documents
  for each row execute function set_updated_at();

alter table team_documents enable row level security;

-- team_documents: readable by all, writable by coaches only.
create policy "team_documents_select_authenticated" on team_documents
  for select using (auth.role() = 'authenticated');
create policy "team_documents_write_coach" on team_documents
  for all using (is_coach()) with check (is_coach());
