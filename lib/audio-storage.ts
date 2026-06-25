import "server-only";

import { MAX_AUDIO_BYTES, MAX_AUDIO_MB, isAllowedAudio } from "@/lib/audio";
import { getAudioBucket } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type AudioUploadRequest = {
  fileName: string;
  mimeType: string;
  size: number;
};

export type StoredAudioRef = {
  bucket: string;
  path: string;
  fileName: string;
  mimeType: string;
};

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function parseAudioUploadRequest(body: unknown): AudioUploadRequest {
  const source = body as Record<string, unknown>;
  return {
    fileName: String(source.fileName ?? ""),
    mimeType: String(source.mimeType ?? ""),
    size: Number(source.size ?? 0),
  };
}

export function validateAudioUpload(input: AudioUploadRequest) {
  if (!input.fileName || !isAllowedAudio(input.fileName, input.mimeType)) {
    throw new Error("지원 안 하는 형식. mp3/m4a/wav 만.");
  }
  if (!input.size || input.size > MAX_AUDIO_BYTES) {
    throw new Error(`파일 ${MAX_AUDIO_MB}MB 초과.`);
  }
}

export function parseStoredAudioRef(body: unknown): Omit<StoredAudioRef, "bucket"> {
  const source = body as Record<string, unknown>;
  return {
    path: String(source.path ?? ""),
    fileName: String(source.fileName ?? ""),
    mimeType: String(source.mimeType ?? "audio/mpeg"),
  };
}

export function validateStoredAudioRef(
  ownerId: string,
  ref: Omit<StoredAudioRef, "bucket">
) {
  if (!ref.path.startsWith(`tmp/${ownerId}/`)) {
    throw new Error("잘못된 파일 경로.");
  }
  if (!ref.fileName || !isAllowedAudio(ref.fileName, ref.mimeType)) {
    throw new Error("지원 안 하는 형식. mp3/m4a/wav 만.");
  }
}

export async function createSignedAudioUpload(ownerId: string, input: AudioUploadRequest) {
  validateAudioUpload(input);

  const bucket = getAudioBucket();
  const path = `tmp/${ownerId}/${crypto.randomUUID()}-${safeName(input.fileName)}`;
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) throw new Error(error.message);
  return { bucket, path, token: data.token };
}

export async function downloadStoredAudio(
  ownerId: string,
  ref: Omit<StoredAudioRef, "bucket">
) {
  validateStoredAudioRef(ownerId, ref);

  const bucket = getAudioBucket();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).download(ref.path);
  if (error) throw new Error(error.message);

  return {
    blob: data,
    bucket,
    path: ref.path,
    fileName: ref.fileName,
    mimeType: ref.mimeType,
  };
}

export async function removeStoredAudio(path: string) {
  await createSupabaseAdmin().storage.from(getAudioBucket()).remove([path]);
}
