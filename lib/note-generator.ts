import {
  GoogleGenAI,
  createPartFromUri,
  createUserContent,
} from "@google/genai";
import { generateContentWithFallback } from "@/lib/gemini";
import { summarizeLongTranscript } from "@/lib/long-transcript";
import { NoteDraftSchema, type Note } from "@/lib/note";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { shouldChunkText } from "@/lib/text-chunks";

const AUDIO_INSTRUCTION =
  "이 강의 오디오를 듣고 규칙대로 구조화 노트 JSON 을 만들어라.";

function parseDraft(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI 출력 JSON 파싱 실패.");
  }

  const check = NoteDraftSchema.safeParse(parsed);
  if (!check.success) {
    throw new Error("AI 출력 스키마 불일치.");
  }

  return check.data;
}

function toNote(draft: ReturnType<typeof parseDraft>, sourceFileName: string): Note {
  return {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sourceFileName,
  };
}

async function generateRaw(ai: GoogleGenAI, contents: Parameters<typeof generateContentWithFallback>[1]["contents"]) {
  const res = await generateContentWithFallback(ai, {
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  return res.text ?? "";
}

async function waitForFileReady(ai: GoogleGenAI, name: string) {
  const started = Date.now();
  let info = await ai.files.get({ name });

  while (info.state === "PROCESSING") {
    if (Date.now() - started > 120000) {
      throw new Error("오디오 처리 시간 초과.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    info = await ai.files.get({ name });
  }

  if (info.state === "FAILED") {
    throw new Error("오디오 처리 실패.");
  }

  return info;
}

export function createNoteGenerator(apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });

  async function fromAudioBlob(
    blob: Blob,
    sourceFileName: string,
    mimeType = "audio/mpeg"
  ) {
    const uploaded = await ai.files.upload({
      file: blob,
      config: { mimeType },
    });

    const ready = await waitForFileReady(ai, uploaded.name as string);
    const raw = await generateRaw(
      ai,
      createUserContent([
        createPartFromUri(ready.uri as string, ready.mimeType as string),
        AUDIO_INSTRUCTION,
      ])
    );

    return toNote(parseDraft(raw), sourceFileName);
  }

  return {
    async fromTranscript(transcript: string, sourceFileName: string) {
      if (shouldChunkText(transcript)) {
        const { mergedInput } = await summarizeLongTranscript(ai, transcript);
        const raw = await generateRaw(ai, mergedInput);
        return toNote(parseDraft(raw), sourceFileName);
      }

      const raw = await generateRaw(ai, transcript);
      return toNote(parseDraft(raw), sourceFileName);
    },

    fromAudioBlob,
  };
}
