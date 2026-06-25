import { NextRequest, NextResponse } from "next/server";
import {
  createSignedAudioUpload,
  parseAudioUploadRequest,
} from "@/lib/audio-storage";
import { getOwnerOrUnauthorized, jsonError, readJsonBody } from "@/lib/api-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = getOwnerOrUnauthorized();
  if (auth.response) return auth.response;

  try {
    const input = await readJsonBody(req, parseAudioUploadRequest);
    return NextResponse.json(await createSignedAudioUpload(auth.ownerId, input));
  } catch (e) {
    return jsonError("업로드 URL 생성 실패: " + (e as Error).message, 400);
  }
}
