# Lecture Assets Extension Design

This document reserves the future path for combining lecture files and professor audio.

## Current Version

Not implemented yet:

- Lecture PDF/PPT/image upload
- Slide image extraction
- OCR
- Image insertion into notes
- Original audio/transcript storage

Current app stores only generated notes in `notes`.

## Future Goal

Input:

- Lecture file: PDF, PPT, image, or text
- Professor audio recording

Output:

- Structured note using lecture file as canonical source
- Audio used for explanation, examples, and exam hints
- Terms corrected using the lecture file
- Optional relevant images inserted near matching concepts

## Data Model

`lecture_assets` connects future source materials to a note.

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

`kind` values:

- `lecture_file`
- `audio`
- `transcript`
- `slide_image`

## Metadata Examples

Lecture file:

```json
{
  "fileName": "week-03-cancer.pdf",
  "mimeType": "application/pdf",
  "pageCount": 42,
  "storagePath": "personal/lecture-files/week-03-cancer.pdf"
}
```

Slide image:

```json
{
  "page": 12,
  "caption": "RAS signaling pathway",
  "storagePath": "personal/slide-images/week-03/page-12.png",
  "matchedConcepts": ["RAS", "MAPK", "PI3K/AKT/mTOR"]
}
```

Transcript:

```json
{
  "source": "gemini",
  "language": "ko",
  "durationSec": 3610
}
```

## Future Note JSON Extension

If images are inserted into notes later, add an `image` block:

```ts
type ImageBlock = {
  type: "image";
  assetId: string;
  alt: string;
  caption?: string;
  examHint?: boolean;
};
```

The renderer can resolve `assetId` through a server API that returns a signed storage URL.

## Implementation Order Later

1. Upload lecture file to Supabase Storage.
2. Extract text and slide/page images.
3. Store assets in `lecture_assets`.
4. Generate notes using both lecture file content and audio.
5. Match image assets to note concepts.
6. Add `image` block renderer and PDF print support.
