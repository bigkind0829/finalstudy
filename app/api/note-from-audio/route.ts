import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { getGeminiKey } from "@/lib/env";
import { createNoteGenerator } from "@/lib/note-generator";
import { createNote } from "@/lib/note-store";
import { MAX_AUDIO_BYTES, MAX_AUDIO_MB, isAllowedAudio } from "@/lib/audio";

export const runtime = "nodejs";
// Vercel Hobby is much stricter than local dev. Larger audio needs a future
// temp-storage/chunking flow instead of direct API upload.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let ownerId: string;
  try {
    ownerId = requireOwner();
  } catch {
    return NextResponse.json({ error: "인증 필요." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("audio");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "잘못된 업로드 폼." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "오디오 파일 없음." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: `파일 ${MAX_AUDIO_MB}MB 초과. 더 짧은 강의 올려라.` },
      { status: 413 }
    );
  }
  if (!isAllowedAudio(file.name, file.type)) {
    return NextResponse.json(
      { error: "지원 안 하는 형식. mp3/m4a/wav 만." },
      { status: 415 }
    );
  }

  let key: string;
  try {
    key = getGeminiKey();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  try {
    const generated = await createNoteGenerator(key).fromAudio(file);
    const note = await createNote(ownerId, generated);
    return NextResponse.json({ note });
  } catch (e) {
    return NextResponse.json(
      { error: "노트 생성/저장 실패: " + (e as Error).message },
      { status: 502 }
    );
  }
}
