import { NextRequest, NextResponse } from "next/server";
import { getOwnerOrUnauthorized, jsonError } from "@/lib/api-helpers";
import { deleteNote, getNote, renameNote } from "@/lib/note-store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  try {
    const note = await getNote(auth.ownerId, params.id);
    if (!note) {
      return NextResponse.json({ error: "노트 없음." }, { status: 404 });
    }
    return NextResponse.json({ note });
  } catch (e) {
    return jsonError("노트 조회 실패: " + (e as Error).message);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  let title = "";
  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "제목 필요." }, { status: 400 });
  }

  try {
    const note = await renameNote(auth.ownerId, params.id, title);
    return NextResponse.json({ note });
  } catch (e) {
    return jsonError("노트 수정 실패: " + (e as Error).message);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  try {
    await deleteNote(auth.ownerId, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError("노트 삭제 실패: " + (e as Error).message);
  }
}
