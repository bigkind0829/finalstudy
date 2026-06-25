import "server-only";

import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";

export function getOwnerOrUnauthorized():
  | { ownerId: string; response?: never }
  | { ownerId?: never; response: NextResponse } {
  try {
    return { ownerId: requireOwner() };
  } catch {
    return {
      response: NextResponse.json({ error: "인증 필요." }, { status: 401 }),
    };
  }
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJsonBody<T>(
  req: Request,
  parse: (body: unknown) => T
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new Error("잘못된 요청 본문.");
  }
  return parse(body);
}
