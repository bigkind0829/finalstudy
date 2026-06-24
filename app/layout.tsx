import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "finalstudy — AI 강의 노트",
  description: "강의 녹음을 구조화된 능동 암기 노트로",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased text-ink bg-paper">
        <div className="mx-auto w-full max-w-[var(--max-content)] px-5 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
