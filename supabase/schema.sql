-- finalstudy real web schema
-- Apply in Supabase SQL Editor.

create table if not exists notes (
  id uuid primary key,
  owner_id text not null default 'personal',
  title text not null,
  source_file_name text not null,
  note_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_owner_updated_idx
  on notes(owner_id, updated_at desc);

-- Future extension: lecture PDFs, audio references, transcripts, slide images.
-- Not used by the current app yet.
create table if not exists lecture_assets (
  id uuid primary key,
  owner_id text not null,
  note_id uuid references notes(id) on delete cascade,
  kind text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists lecture_assets_note_idx
  on lecture_assets(note_id);

create index if not exists lecture_assets_owner_idx
  on lecture_assets(owner_id);

-- Private bucket for temporary uploads and future lecture assets.
insert into storage.buckets (id, name, public)
values ('lecture-assets', 'lecture-assets', false)
on conflict (id) do nothing;
