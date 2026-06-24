import { z } from "zod";

// PRD 스키마 (Slice 3 개정). toggle = 재귀 컨테이너.
// 닫힘 = summary(흐름), 열림 = children(아무 블록 중첩, 깊이 2단계까지 by 프롬프트).
export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string; examHint?: boolean }
  | { type: "paragraph"; text: string; examHint?: boolean }
  | {
      type: "toggle";
      summary: string;
      recall?: boolean;
      children: Block[];
      examHint?: boolean;
    }
  | { type: "table"; headers: string[]; rows: string[][]; examHint?: boolean }
  | { type: "mermaid"; code: string; caption?: string; examHint?: boolean };

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("heading"),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      text: z.string(),
      examHint: z.boolean().optional(),
    }),
    z.object({
      type: z.literal("paragraph"),
      text: z.string(),
      examHint: z.boolean().optional(),
    }),
    z.object({
      type: z.literal("toggle"),
      summary: z.string(),
      recall: z.boolean().optional(),
      children: z.array(BlockSchema),
      examHint: z.boolean().optional(),
    }),
    z.object({
      type: z.literal("table"),
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      examHint: z.boolean().optional(),
    }),
    z.object({
      type: z.literal("mermaid"),
      code: z.string(),
      caption: z.string().optional(),
      examHint: z.boolean().optional(),
    }),
  ])
);

export const NoteDraftSchema = z.object({
  title: z.string(),
  blocks: z.array(BlockSchema),
});

export const NoteSchema = NoteDraftSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  sourceFileName: z.string(),
});

export type NoteDraft = z.infer<typeof NoteDraftSchema>;
export type Note = z.infer<typeof NoteSchema>;
