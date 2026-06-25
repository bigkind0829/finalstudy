# Long Text Notes

The app supports long pasted lecture transcripts by chunking text on the server.

## Flow

1. User pastes long transcript.
2. Server splits text into chunks around paragraph/sentence boundaries.
3. Gemini summarizes each chunk into structured intermediate notes.
4. Gemini merges chunk summaries into one final Note JSON.
5. Final note is saved to Supabase.

## Current Limits

- Chunk size: about 12,000 characters.
- Chunk overlap: about 800 characters.
- Very long transcripts can still hit Vercel function time limits.
- If a 2-hour transcript fails, split it manually into parts or move this flow to a background job later.

## Why This Exists

Audio processing is constrained by upload and function time limits. Many users can already produce transcripts with external tools, so long text support gives a more reliable path for long lectures.

## Future Upgrade

For production-grade 2+ hour transcripts:

- Background job table
- Progress tracking
- Incremental chunk persistence
- Resume failed chunk
- Final merge after all chunks complete
