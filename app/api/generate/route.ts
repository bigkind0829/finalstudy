import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { getGeminiKey } from "@/lib/env";
import { createNoteGenerator } from "@/lib/note-generator";
import { createNote } from "@/lib/note-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let ownerId: string;
  try {
    ownerId = requireOwner();
  } catch {
    return NextResponse.json({ error: "인증 필요." }, { status: 401 });
  }

  let transcript: string;
  let sourceFileName: string;

  try {
    const body = await req.json();
    transcript = String(body.transcript ?? "").trim();
    sourceFileName = String(body.sourceFileName ?? "대본 입력");
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문." }, { status: 400 });
  }

  if (transcript.length < 10) {
    return NextResponse.json({ error: "대본이 너무 짧음." }, { status: 400 });
  }

  let key: string;
  try {
    key = getGeminiKey();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  try {
    const generated = await createNoteGenerator(key).fromTranscript(
      transcript,
      sourceFileName
    );
    const note = await createNote(ownerId, generated);
    return NextResponse.json({ note });
  } catch (e) {
    return NextResponse.json(
      { error: "노트 생성/저장 실패: " + (e as Error).message },
      { status: 502 }
    );
  }
}
