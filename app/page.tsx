import LoginForm from "@/components/LoginForm";
import LogoutButton from "@/components/LogoutButton";
import Studio from "@/components/Studio";
import { isAuthenticated } from "@/lib/auth";
import { hasAuthEnv, hasGeminiKey, hasPublicSupabaseEnv } from "@/lib/env";

export default function Home() {
  const keyReady = hasGeminiKey();
  const authReady = hasAuthEnv();
  const publicSupabaseReady = hasPublicSupabaseEnv();
  const authed = authReady && isAuthenticated();

  return (
    <main>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">finalstudy</h1>
          <p className="mt-1 text-sm text-subtle">
            강의 녹음 → 구조화 능동 암기 노트
          </p>
        </div>
        {authed && <LogoutButton />}
      </header>

      {!authReady && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          APP_PASSWORD 또는 SESSION_SECRET 미설정. <code>.env.local</code>에
          값 넣고 서버 재시작.
        </div>
      )}

      {!keyReady && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          GEMINI_API_KEY 미설정. <code>.env.local</code> 에 키 넣고 서버 재시작.
          (노트 생성하려면 필요)
        </div>
      )}

      {!publicSupabaseReady && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          미설정. 50MB 오디오 업로드에 필요.
        </div>
      )}

      {authed ? <Studio /> : <LoginForm />}
    </main>
  );
}
