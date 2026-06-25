// Vercel direct API upload has a small request body limit.
// Longer audio needs the future Supabase Storage + chunking flow.
export const MAX_AUDIO_MB = 4;
export const MAX_AUDIO_BYTES = MAX_AUDIO_MB * 1024 * 1024;

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg", // mp3
  "audio/mp3",
  "audio/mp4", // m4a 일부
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
];

export const ALLOWED_AUDIO_EXT = [".mp3", ".m4a", ".wav"];

export function isAllowedAudio(name: string, type: string): boolean {
  const lower = name.toLowerCase();
  const extOk = ALLOWED_AUDIO_EXT.some((e) => lower.endsWith(e));
  const typeOk = type ? ALLOWED_AUDIO_TYPES.includes(type) : false;
  return extOk || typeOk;
}
