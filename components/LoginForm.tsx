"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인 실패.");
        return;
      }
      window.location.reload();
    } catch (e) {
      setError("로그인 오류: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm rounded-xl border border-line p-5">
      <h2 className="text-base font-medium">비밀번호 입력</h2>
      <p className="mt-1 text-sm text-subtle">개인용 finalstudy 앱 보호.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && password) login();
        }}
        className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        placeholder="APP_PASSWORD"
      />
      <button
        type="button"
        onClick={login}
        disabled={loading || !password}
        className="mt-3 w-full rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {loading ? "확인 중..." : "들어가기"}
      </button>
      {error && (
        <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
