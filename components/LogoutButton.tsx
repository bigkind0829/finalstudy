"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="no-print rounded-md border border-line px-2 py-1 text-xs text-subtle hover:border-ink hover:text-ink"
    >
      로그아웃
    </button>
  );
}
