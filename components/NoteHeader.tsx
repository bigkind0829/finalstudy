"use client";

import { useEffect, useRef, useState } from "react";
import type { Note } from "@/lib/note";

export default function NoteHeader({
  note,
  onRename,
  onDelete,
  saving,
}: {
  note: Note;
  onRename: (title: string) => void;
  onDelete: () => void;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState(note.title);
  const onRenameRef = useRef(onRename);

  useEffect(() => {
    onRenameRef.current = onRename;
  }, [onRename]);

  useEffect(() => {
    setDraft(note.title);
  }, [note.id, note.title]);

  useEffect(() => {
    const title = draft.trim();
    if (!title || title === note.title) return;
    const timer = window.setTimeout(() => onRenameRef.current(title), 600);
    return () => window.clearTimeout(timer);
  }, [draft, note.title]);

  function printPdf() {
    window.setTimeout(() => window.print(), 100);
  }

  return (
    <div className="print-area mt-8 border-b border-line pb-2">
      <div className="flex items-center gap-2">
        <span className="no-print rounded bg-gray-100 px-1.5 py-0.5 text-xs text-subtle">
          수정
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const title = draft.trim();
            if (title && title !== note.title) onRenameRef.current(title);
          }}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight outline-none hover:bg-gray-50 focus:border-ink focus:bg-white"
          placeholder="제목 입력 (클릭해 수정)"
          title="클릭해서 제목 수정"
        />
        <span className="no-print text-xs text-subtle">
          {saving ? "저장 중..." : "자동 저장"}
        </span>
        <button
          type="button"
          onClick={printPdf}
          className="no-print shrink-0 rounded-md border border-line px-2 py-1 text-xs text-subtle hover:border-ink hover:text-ink"
        >
          PDF 저장
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="no-print shrink-0 rounded-md border border-line px-2 py-1 text-xs text-subtle hover:border-red-300 hover:text-red-600"
        >
          삭제
        </button>
      </div>
      <p className="mt-1 truncate px-2 text-xs text-subtle">
        {note.sourceFileName}
      </p>
    </div>
  );
}
