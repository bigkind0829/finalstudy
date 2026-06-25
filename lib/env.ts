// Server-only env access. Throws clear error when key missing.
export function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY 누락. .env.local 에 키 설정 후 서버 재시작."
    );
  }
  return key;
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getAppPassword(): string {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error(
      "APP_PASSWORD 누락. .env.local 에 앱 비밀번호 설정 후 서버 재시작."
    );
  }
  return password;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET 누락. .env.local 에 긴 랜덤 문자열 설정 후 서버 재시작."
    );
  }
  return secret;
}

export function hasAuthEnv(): boolean {
  return Boolean(process.env.APP_PASSWORD && process.env.SESSION_SECRET);
}

export function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error("SUPABASE_URL 누락. .env.local 또는 Vercel env에 설정.");
  }
  return url;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 누락. 서버 전용 Supabase service role key 설정."
    );
  }
  return key;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasPublicSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getAudioBucket(): string {
  return process.env.SUPABASE_AUDIO_BUCKET || "lecture-assets";
}
