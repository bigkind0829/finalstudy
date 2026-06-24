# Vercel Deploy Guide

## 1. Prepare Supabase

1. Create Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Prepare Local Env

`.env.local` needs:

```env
GEMINI_API_KEY=...
APP_PASSWORD=...
SESSION_SECRET=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SESSION_SECRET` should be long and random.

## 3. Verify Locally

```bash
npm install
npm run build
npm run dev
```

Test:

- Login
- Text note generation
- Small audio note generation
- Rename note
- Delete note
- PDF save

## 4. Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Framework: Next.js.
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `APP_PASSWORD`
   - `SESSION_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy.

## 5. Production Smoke Test

Use the deployed URL:

1. Login with `APP_PASSWORD`.
2. Generate note from text.
3. Refresh page. Note list should persist.
4. Rename note. Refresh. Title should persist.
5. Delete note. Refresh. Deleted note should stay gone.
6. Save PDF. Toggle content should be expanded.
7. Test a small audio file.

## Known Limit

Large audio upload on Vercel Hobby may fail due to request/function limits.
This app is prepared for personal deployment, but long-audio production support
should use temporary Supabase Storage + chunking later.
