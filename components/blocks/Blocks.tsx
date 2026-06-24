"use client";

import { useEffect, useState } from "react";
import type { Block } from "@/lib/note";
import MermaidBlock from "@/components/blocks/MermaidBlock";

// 인라인 **굵게** 렌더 (핵심어 강조).
function RichText({ text }: { text: string }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// 출제유력 배지 (교수 출제 힌트).
function ExamBadge() {
  return (
    <span className="ml-2 inline-block rounded bg-rose-100 px-1.5 py-0.5 align-middle text-[11px] font-medium text-rose-700">
      출제유력
    </span>
  );
}

// 표/순서도처럼 인라인 배지 못 넣는 블록용 래퍼 (위에 배지).
function BadgedBlock({
  examHint,
  children,
}: {
  examHint?: boolean;
  children: React.ReactNode;
}) {
  if (!examHint) return <>{children}</>;
  return (
    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/30 p-2">
      <div className="mb-1 px-1">
        <ExamBadge />
      </div>
      {children}
    </div>
  );
}

// 재귀 렌더러. toggle 컨테이너가 children 을 다시 BlockList 로 그림.
// 한 모듈 안에 둬서 순환 import 회피.

function HeadingBlock({
  level,
  text,
  examHint,
}: {
  level: 1 | 2 | 3;
  text: string;
  examHint?: boolean;
}) {
  const cls =
    level === 1
      ? "mt-8 text-xl font-semibold"
      : level === 2
        ? "mt-6 text-lg font-medium"
        : "mt-4 text-base font-medium";
  return (
    <h3 className={cls}>
      <RichText text={text} />
      {examHint && <ExamBadge />}
    </h3>
  );
}

function TableBlock({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="bg-gray-50">
            {safeHeaders.map((h, i) => (
              <th
                key={i}
                className="border-b border-line px-3 py-2 text-left font-medium"
              >
                <RichText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 align-top text-ink">
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToggleBlock({
  summary,
  recall,
  items,
  examHint,
}: {
  summary: string;
  recall?: boolean;
  items: Block[];
  examHint?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const expanded = open || printing;

  useEffect(() => {
    const before = () => setPrinting(true);
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  return (
    <div className="mt-3 rounded-lg border border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[15px] font-medium"
        aria-expanded={expanded}
      >
        <span
          className={`inline-block text-subtle transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
        <span>
          <RichText text={summary} />
        </span>
        {examHint && <ExamBadge />}
        {recall && (
          <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
            암기
          </span>
        )}
      </button>
      <div
        className={`print-force-open border-t border-line px-4 pb-3 pt-1 ${
          expanded ? "block" : "hidden"
        }`}
      >
        <BlockList blocks={items} />
      </div>
      {!expanded && recall && (
        <div className="no-print px-4 pb-3 text-xs text-subtle">
          클릭해서 답 확인 (먼저 스스로 떠올려라)
        </div>
      )}
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <HeadingBlock
          level={block.level}
          text={block.text}
          examHint={block.examHint}
        />
      );
    case "paragraph":
      return (
        <p className="mt-2 text-[15px] leading-7 text-ink">
          <RichText text={block.text} />
          {block.examHint && <ExamBadge />}
        </p>
      );
    case "toggle":
      return (
        <ToggleBlock
          summary={block.summary}
          recall={block.recall}
          items={block.children ?? []}
          examHint={block.examHint}
        />
      );
    case "mermaid":
      return (
        <BadgedBlock examHint={block.examHint}>
          <MermaidBlock code={block.code} caption={block.caption} />
        </BadgedBlock>
      );
    case "table":
      return (
        <BadgedBlock examHint={block.examHint}>
          <TableBlock headers={block.headers} rows={block.rows} />
        </BadgedBlock>
      );
    default:
      return null;
  }
}

export default function BlockList({ blocks }: { blocks: Block[] }) {
  const safe = Array.isArray(blocks) ? blocks : [];
  return (
    <>
      {safe.map((b, i) => (
        <BlockItem key={i} block={b} />
      ))}
    </>
  );
}
