export const TEXT_CHUNK_SIZE = 12000;
export const TEXT_CHUNK_OVERLAP = 800;

export function shouldChunkText(text: string) {
  return text.trim().length > TEXT_CHUNK_SIZE;
}

export function estimateChunkCount(text: string, size = TEXT_CHUNK_SIZE) {
  if (!shouldChunkText(text)) return 1;
  const effectiveSize = Math.max(1, size - TEXT_CHUNK_OVERLAP);
  return Math.ceil(text.trim().length / effectiveSize);
}

export function chunkText(text: string, size = TEXT_CHUNK_SIZE) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (normalized.length <= size) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const targetEnd = Math.min(start + size, normalized.length);
    let end = targetEnd;

    // Prefer paragraph/sentence boundaries so concepts do not split mid-flow.
    const paragraphBreak = normalized.lastIndexOf("\n\n", targetEnd);
    const sentenceBreak = normalized.lastIndexOf(". ", targetEnd);
    const koreanSentenceBreak = normalized.lastIndexOf("。", targetEnd);
    const candidates = [paragraphBreak, sentenceBreak, koreanSentenceBreak].filter(
      (v) => v > start + size * 0.6
    );

    if (candidates.length) end = Math.max(...candidates) + 1;

    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(0, end - TEXT_CHUNK_OVERLAP);
  }

  return chunks.filter(Boolean);
}
