import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문." }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 틀림." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
