"use client";

import { useEffect, useRef, useState } from "react";

let initialized = false;
let counter = 0;

// 대괄호 노드 라벨에 따옴표 없으면 자동 추가 (괄호/슬래시 등 깨짐 방지).
function sanitize(code: string): string {
  return code.replace(/\[(?!")([^\]\n]+?)(?<!")\]/g, (_m, label) => {
    const safe = String(label).replace(/"/g, "");
    return `["${safe}"]`;
  });
}

// 메커니즘/프로세스 순서도. 렌더 실패 시 코드 + 에러 폴백.
export default function MermaidBlock({
  code,
  caption,
}: {
  code: string;
  caption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!initialized) {
          mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
          initialized = true;
        }
        // 매 렌더 유니크 id (StrictMode 중복 호출 충돌 방지)
        const id = `mmd-${Date.now()}-${counter++}`;
        const { svg } = await mermaid.render(id, sanitize(code));
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) setErr((e as Error).message || "렌더 실패");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <figure className="mt-3 overflow-x-auto rounded-lg border border-line p-4">
      <div ref={ref} className="flex justify-center" hidden={!!err} />
      {err && (
        <div>
          <p className="mb-2 text-xs text-red-600">순서도 렌더 실패: {err}</p>
          <pre className="whitespace-pre-wrap text-xs text-subtle">{code}</pre>
        </div>
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
