import type { GoogleGenAI } from "@google/genai";

type GenerateParams = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function isRetryable(error: unknown) {
  const msg = (error as Error).message ?? "";
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini 과부하(503/429) 흡수: 재시도 + fallback 모델.
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: GenerateParams
) {
  let lastError: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (e) {
        lastError = e;
        if (!isRetryable(e)) throw e;
        await sleep(1000 * 2 ** attempt);
      }
    }
  }

  throw lastError;
}
