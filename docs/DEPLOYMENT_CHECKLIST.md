# Deployment Checklist — finalstudy

## Local Environment

Create `.env.local` from `.env.example`.

Required values:

- `GEMINI_API_KEY`
- `APP_PASSWORD`
- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Notes:

- `APP_PASSWORD` is the single password for the personal app.
- `SESSION_SECRET` should be a long random string.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client components.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Apply `supabase/schema.sql`.

The core table is:

```sql
create table notes (
  id uuid primary key,
  owner_id text not null default 'personal',
  title text not null,
  source_file_name text not null,
  note_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_owner_updated_idx on notes(owner_id, updated_at desc);
```

Future extension schema:

```sql
create table lecture_assets (
  id uuid primary key,
  owner_id text not null,
  note_id uuid references notes(id) on delete cascade,
  kind text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## Vercel Setup

1. Import the GitHub repository into Vercel.
2. Framework preset: Next.js.
3. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `APP_PASSWORD`
   - `SESSION_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## Vercel Hobby Limits

The current app sends audio files directly to a Next.js API route.

This is fine for local development, but Vercel Hobby has request body and
function execution limits. Large audio files can fail even if the app allows
up to 50MB locally.

For the first deployed personal version:

- Text input should work reliably.
- Small audio files should work.
- Long lecture audio may fail on Vercel Hobby.

Future stable long-audio support needs a different upload path:

1. Browser uploads audio to temporary Supabase Storage.
2. Server processes the stored file.
3. Server deletes the temporary file after note generation.
4. For very long lectures, add chunking/job queue.

## Smoke Test

After deployment:

- Open Vercel URL.
- Login with `APP_PASSWORD`.
- Generate note from pasted text.
- Generate note from a small audio file first.
- Confirm generated note appears in the note list.
- Rename note and refresh page. Title should persist.
- Delete note and refresh page. Deleted note should stay gone.
- Save as PDF. All toggles should be expanded in the PDF preview.

If audio fails only on Vercel but works locally, treat it as a deployment
limit issue, not a Gemini prompt issue.

## Current Scope

Included:

- Text/audio input
- Gemini note generation
- Structured blocks: heading, paragraph, toggle, table, mermaid
- Exam hint badges
- PDF export
- Personal password gate
- Supabase note persistence

Not included yet:

- Multi-user signup/login
- Supabase Auth
- Lecture PDF/PPT/image upload
- Slide image extraction
- Original audio/transcript storage
- Payments or quotas
