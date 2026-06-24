"use client";

import type { Note } from "@/lib/note";

export default function NoteLibrary({
  notes,
  currentId,
  onSelect,
  onDelete,
}: {
  notes: Note[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="no-print hidden w-52 shrink-0 sm:block">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
        내 노트 ({notes.length})
      </h2>
      <ul className="space-y-1">
        {notes.map((n) => (
          <li key={n.id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(n.id)}
              className={`flex-1 truncate rounded px-2 py-1.5 text-left text-sm ${
                n.id === currentId
                  ? "bg-gray-100 font-medium"
                  : "text-subtle hover:bg-gray-50"
              }`}
              title={n.title}
            >
              {n.title}
            </button>
            <button
              type="button"
              onClick={() => onDelete(n.id)}
              className="rounded px-1 text-xs text-subtle hover:text-red-600"
              title="삭제"
            >
              x
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="px-2 py-1.5 text-sm text-subtle">아직 없음</li>
        )}
      </ul>
    </aside>
  );
}
