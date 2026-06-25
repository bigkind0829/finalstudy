import type { GoogleGenAI } from "@google/genai";
import { generateContentWithFallback } from "@/lib/gemini";
import { chunkText } from "@/lib/text-chunks";

const CHUNK_SUMMARY_PROMPT = `너는 긴 강의 대본의 일부를 압축 정리하는 도구다.
최종 노트 생성 전 중간 재료를 만든다.

규칙:
- 이 조각의 핵심 개념, 용어, 교수 강조/출제 힌트, 예시, 흐름을 빠짐없이 보존.
- 원어 용어는 원어 그대로.
- 표/순서도 후보가 있으면 명시.
- 불필요한 잡담/반복 제거.
- 최종 JSON 말고, 간결한 한국어 구조 텍스트로 출력.`;

export const MERGE_INSTRUCTION = `다음은 긴 강의 대본을 여러 조각으로 나눠 정리한 중간 요약들이다.
중복을 제거하고 하나의 완성된 강의 노트 JSON 으로 통합해라.
원래 강의 전체 흐름을 살리고, 같은 개념은 합쳐라.`;

async function generateChunkSummary(
  ai: GoogleGenAI,
  chunk: string,
  index: number,
  total: number
) {
  const res = await generateContentWithFallback(ai, {
    model: "gemini-2.5-flash",
    contents: `[${index + 1}/${total}]\n\n${chunk}`,
    config: {
      systemInstruction: CHUNK_SUMMARY_PROMPT,
      temperature: 0.2,
    },
  });

  return res.text ?? "";
}

export async function summarizeLongTranscript(ai: GoogleGenAI, transcript: string) {
  const chunks = chunkText(transcript);
  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i += 1) {
    summaries.push(await generateChunkSummary(ai, chunks[i], i, chunks.length));
  }

  return {
    chunkCount: chunks.length,
    mergedInput: `${MERGE_INSTRUCTION}\n\n${summaries
      .map((summary, index) => `## Chunk ${index + 1}\n${summary}`)
      .join("\n\n")}`,
  };
}
