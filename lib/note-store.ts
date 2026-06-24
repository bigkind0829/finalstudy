import "server-only";

import type { Note } from "@/lib/note";
import { NoteSchema } from "@/lib/note";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type NoteRow = {
  id: string;
  owner_id: string;
  title: string;
  source_file_name: string;
  note_json: unknown;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: NoteRow): Note {
  const parsed = NoteSchema.safeParse(row.note_json);
  if (parsed.success) {
    return {
      ...parsed.data,
      id: row.id,
      title: row.title,
      sourceFileName: row.source_file_name,
      createdAt: row.created_at,
    };
  }

  throw new Error(`저장된 노트 JSON 스키마 불일치: ${row.id}`);
}

function noteToInsert(ownerId: string, note: Note) {
  return {
    id: note.id,
    owner_id: ownerId,
    title: note.title,
    source_file_name: note.sourceFileName,
    note_json: note,
    created_at: note.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export async function listNotes(ownerId: string): Promise<Note[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as NoteRow[]).map(rowToNote);
}

export async function getNote(ownerId: string, id: string): Promise<Note | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToNote(data as NoteRow) : null;
}

export async function createNote(ownerId: string, note: Note): Promise<Note> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .insert(noteToInsert(ownerId, note))
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToNote(data as NoteRow);
}

export async function renameNote(
  ownerId: string,
  id: string,
  title: string
): Promise<Note> {
  const current = await getNote(ownerId, id);
  if (!current) throw new Error("노트 없음.");

  const updatedNote = { ...current, title };
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .update({
      title,
      note_json: updatedNote,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToNote(data as NoteRow);
}

export async function deleteNote(ownerId: string, id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}
