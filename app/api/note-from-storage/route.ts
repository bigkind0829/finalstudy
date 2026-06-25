import { NextRequest, NextResponse } from "next/server";
import {
  downloadStoredAudio,
  parseStoredAudioRef,
  removeStoredAudio,
} from "@/lib/audio-storage";
import { getOwnerOrUnauthorized, jsonError, readJsonBody } from "@/lib/api-helpers";
import { getGeminiKey } from "@/lib/env";
import { createNoteGenerator } from "@/lib/note-generator";
import { createNote } from "@/lib/note-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  let path = "";
  try {
    const ref = await readJsonBody(req, parseStoredAudioRef);
    path = ref.path;
    const audio = await downloadStoredAudio(auth.ownerId, ref);

    const generated = await createNoteGenerator(getGeminiKey()).fromAudioBlob(
      audio.blob,
      audio.fileName,
      audio.mimeType
    );
    const note = await createNote(auth.ownerId, generated);
    return NextResponse.json({ note });
  } catch (e) {
    return jsonError("노트 생성/저장 실패: " + (e as Error).message, 502);
  } finally {
    if (path) await removeStoredAudio(path);
  }
}
