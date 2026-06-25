"use client";

import type { Note } from "@/lib/note";

async function readJsonOrError(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    if (res.status === 413 || text.includes("Request Entity")) {
      throw new Error(
        "오디오 파일이 배포 서버 업로드 한도를 초과함. 더 짧게 자르거나 압축 필요."
      );
    }
    throw new Error(text || `요청 실패 (${res.status})`);
  }
}

async function readNoteResponse(res: Response): Promise<Note> {
  const data = await readJsonOrError(res);
  if (!res.ok) {
    throw new Error(data.error ?? "생성 실패.");
  }
  return data.note as Note;
}

async function readNotesResponse(res: Response): Promise<Note[]> {
  const data = await readJsonOrError(res);
  if (!res.ok) {
    throw new Error(data.error ?? "노트 목록 조회 실패.");
  }
  return data.notes as Note[];
}

export async function generateNoteFromTranscript(transcript: string) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, sourceFileName: "대본 입력" }),
  });
  return readNoteResponse(res);
}

export async function generateNoteFromAudio(file: File) {
  const form = new FormData();
  form.append("audio", file);
  const res = await fetch("/api/note-from-audio", {
    method: "POST",
    body: form,
  });
  return readNoteResponse(res);
}

export async function listRemoteNotes() {
  return readNotesResponse(await fetch("/api/notes", { cache: "no-store" }));
}

export async function renameRemoteNote(id: string, title: string) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return readNoteResponse(res);
}

export async function deleteRemoteNote(id: string) {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  const data = await readJsonOrError(res);
  if (!res.ok) {
    throw new Error(data.error ?? "노트 삭제 실패.");
  }
}
