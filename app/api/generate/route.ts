import { NextRequest, NextResponse } from "next/server";
import {
  getOwnerOrUnauthorized,
  jsonError,
  readJsonBody,
} from "@/lib/api-helpers";
import { getGeminiKey } from "@/lib/env";
import { createNoteGenerator } from "@/lib/note-generator";
import { createNote } from "@/lib/note-store";

export const runtime = "nodejs";
export const maxDuration = 300;

function parseGenerateRequest(body: unknown) {
  const source = body as Record<string, unknown>;
  return {
    transcript: String(source.transcript ?? "").trim(),
    sourceFileName: String(source.sourceFileName ?? "대본 입력"),
  };
}

export async function POST(req: NextRequest) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  try {
    const { transcript, sourceFileName } = await readJsonBody(
      req,
      parseGenerateRequest
    );
    if (transcript.length < 10) {
      return NextResponse.json({ error: "대본이 너무 짧음." }, { status: 400 });
    }
    const generated = await createNoteGenerator(getGeminiKey()).fromTranscript(
      transcript,
      sourceFileName
    );
    const note = await createNote(auth.ownerId, generated);
    return NextResponse.json({ note });
  } catch (e) {
    return jsonError("노트 생성/저장 실패: " + (e as Error).message, 502);
  }
}
