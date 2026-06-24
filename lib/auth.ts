import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getAppPassword, getSessionSecret } from "@/lib/env";

export const SESSION_COOKIE = "finalstudy_session";
export const OWNER_ID = "personal";

const SESSION_VALUE = "authenticated";

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPassword(input: string) {
  return safeEqual(input, getAppPassword());
}

export function createSessionToken() {
  return `${SESSION_VALUE}.${sign(SESSION_VALUE)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [value, signature] = token.split(".");
  if (value !== SESSION_VALUE || !signature) return false;
  return safeEqual(signature, sign(value));
}

export function isAuthenticated() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

export function requireOwner() {
  if (!isAuthenticated()) {
    throw new Error("UNAUTHORIZED");
  }
  return OWNER_ID;
}
