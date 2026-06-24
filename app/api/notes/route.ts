import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createNote, listNotes } from "@/lib/note-store";
import { NoteSchema } from "@/lib/note";

export const runtime = "nodejs";

function getOwnerOrResponse() {
  try {
    return { ownerId: requireOwner() };
  } catch {
    return {
      response: NextResponse.json({ error: "인증 필요." }, { status: 401 }),
    };
  }
}

export async function GET() {
  const auth = getOwnerOrResponse();
  if (auth.response) return auth.response;

  try {
    const notes = await listNotes(auth.ownerId);
    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json(
      { error: "노트 목록 조회 실패: " + (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = getOwnerOrResponse();
  if (auth.response) return auth.response;

  let parsed: unknown;
  try {
    const body = await req.json();
    parsed = body.note;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문." }, { status: 400 });
  }

  const check = NoteSchema.safeParse(parsed);
  if (!check.success) {
    return NextResponse.json({ error: "노트 스키마 불일치." }, { status: 400 });
  }

  try {
    const note = await createNote(auth.ownerId, check.data);
    return NextResponse.json({ note });
  } catch (e) {
    return NextResponse.json(
      { error: "노트 저장 실패: " + (e as Error).message },
      { status: 500 }
    );
  }
}
