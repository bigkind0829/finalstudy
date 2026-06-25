"use client";

import { useCallback, useRef, useState } from "react";
import { MAX_AUDIO_BYTES, MAX_AUDIO_MB, isAllowedAudio } from "@/lib/audio";
import {
  generateNoteFromAudio,
  generateNoteFromTranscript,
} from "@/lib/note-api";
import { estimateChunkCount, shouldChunkText } from "@/lib/text-chunks";
import { useNoteLibrary } from "@/hooks/useNoteLibrary";
import NoteHeader from "@/components/NoteHeader";
import NoteLibrary from "@/components/NoteLibrary";
import NoteView from "@/components/NoteView";

type Mode = "audio" | "text";

export default function Studio() {
  const [mode, setMode] = useState<Mode>("audio");
  const [transcript, setTranscript] = useState("");
  const [phase, setPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const library = useNoteLibrary();

  const loading = phase !== null;
  const transcriptChunkCount = estimateChunkCount(transcript);

  function remove(id: string) {
    if (!confirm("이 노트 삭제?")) return;
    library.remove(id);
  }

  const renameCurrent = useCallback(
    (title: string) => {
      if (library.current) {
        library.rename(library.current.id, title);
      }
    },
    [library]
  );

  async function generateFromText() {
    setError(null);
    setPhase(
      shouldChunkText(transcript)
        ? `긴 대본 ${transcriptChunkCount}개 조각으로 정리 중...`
        : "구조화 중..."
    );
    try {
      await library.save(await generateNoteFromTranscript(transcript));
      setTranscript("");
    } catch (e) {
      setError("생성 오류: " + (e as Error).message);
    } finally {
      setPhase(null);
    }
  }

  async function generateFromAudio() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("파일 골라라.");
    if (file.size > MAX_AUDIO_BYTES) return setError(`파일 ${MAX_AUDIO_MB}MB 초과.`);
    if (!isAllowedAudio(file.name, file.type))
      return setError("mp3/m4a/wav 만 됨.");

    setError(null);
    setPhase("전사 + 구조화 중... (강의 길이만큼 걸림)");
    try {
      await library.save(await generateNoteFromAudio(file));
    } catch (e) {
      setError("생성 오류: " + (e as Error).message);
    } finally {
      setPhase(null);
    }
  }

  return (
    <div className="flex gap-6">
      <NoteLibrary
        notes={library.notes}
        currentId={library.currentId}
        onSelect={library.select}
        onDelete={remove}
      />

      <div className="min-w-0 flex-1">
        <div className="no-print mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              mode === "audio"
                ? "bg-ink text-white"
                : "border border-line text-subtle"
            }`}
          >
            오디오 업로드
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              mode === "text"
                ? "bg-ink text-white"
                : "border border-line text-subtle"
            }`}
          >
            대본 붙여넣기
          </button>
        </div>

        {mode === "audio" ? (
          <section className="no-print rounded-xl border border-line p-5">
            <label className="mb-2 block text-sm font-medium">
              강의 녹음 업로드
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".mp3,.m4a,.wav,audio/*"
              className="block w-full text-sm text-subtle file:mr-3 file:rounded-md file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-sm"
            />
            <p className="mt-2 text-xs text-subtle">
              mp3 / m4a / wav · 최대 {MAX_AUDIO_MB}MB
            </p>
            <button
              type="button"
              onClick={generateFromAudio}
              disabled={loading}
              className="mt-3 rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              {loading ? "처리 중..." : "노트 생성"}
            </button>
          </section>
        ) : (
          <section className="no-print rounded-xl border border-line p-5">
            <label className="mb-2 block text-sm font-medium">
              강의 대본 붙여넣기
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="강의 대본 텍스트를 여기에 붙여넣어라. 긴 대본은 자동 분할해서 정리."
              className="h-48 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ink"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={generateFromText}
                disabled={loading || transcript.trim().length < 10}
                className="rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                {loading ? "생성 중..." : "노트 생성"}
              </button>
              <span className="text-xs text-subtle">
                {transcript.trim().length}자
                {shouldChunkText(transcript)
                  ? ` · ${transcriptChunkCount}개 조각 자동 분할`
                  : ""}
              </span>
            </div>
          </section>
        )}

        {phase && (
          <p className="mt-3 rounded-md border border-line bg-gray-50 px-3 py-2 text-sm text-subtle">
            {phase}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {library.error && (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            노트 저장소 오류: {library.error}
          </p>
        )}
        {library.loading && (
          <p className="mt-3 text-sm text-subtle">노트 목록 불러오는 중...</p>
        )}

        {library.current && (
          <NoteHeader
            note={library.current}
            onRename={renameCurrent}
            onDelete={() => remove(library.current!.id)}
            saving={library.savingTitleId === library.current.id}
          />
        )}

        <NoteView note={library.current} />
      </div>
    </div>
  );
}
