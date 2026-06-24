"use client";

import { useEffect, useMemo, useState } from "react";
import type { Note } from "@/lib/note";
import {
  deleteRemoteNote,
  listRemoteNotes,
  renameRemoteNote,
} from "@/lib/note-api";

export function useNoteLibrary() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTitleId, setSavingTitleId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const current = useMemo(
    () => notes.find((n) => n.id === currentId) ?? null,
    [currentId, notes]
  );

  async function refresh(selectId?: string | null) {
    setError(null);
    setLoading(true);
    try {
      const list = await listRemoteNotes();
      setNotes(list);
      if (selectId === undefined) {
        setCurrentId((cur) => cur ?? (list[0]?.id ?? null));
      } else {
        setCurrentId(selectId);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function save(note: Note) {
    setError(null);
    const remote = await listRemoteNotes();
    const list = remote.some((n) => n.id === note.id) ? remote : [note, ...remote];
    setNotes(list);
    setCurrentId(note.id);
  }

  async function rename(id: string, title: string) {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, title };
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    try {
      setSavingTitleId(id);
      await renameRemoteNote(id, title);
    } catch (e) {
      setError((e as Error).message);
      setNotes((prev) => prev.map((n) => (n.id === id ? target : n)));
    } finally {
      setSavingTitleId((cur) => (cur === id ? null : cur));
    }
  }

  async function remove(id: string) {
    setError(null);
    const before = notes;
    const next = before.filter((n) => n.id !== id);
    setNotes(next);
    setCurrentId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
    try {
      await deleteRemoteNote(id);
    } catch (e) {
      setError((e as Error).message);
      setNotes(before);
    }
  }

  return {
    notes,
    current,
    currentId,
    loading,
    error,
    savingTitleId,
    select: setCurrentId,
    refresh,
    save,
    rename,
    remove,
  };
}
