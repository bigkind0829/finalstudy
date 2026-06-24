export const LECTURE_ASSET_KINDS = [
  "lecture_file",
  "audio",
  "transcript",
  "slide_image",
] as const;

export type LectureAssetKind = (typeof LECTURE_ASSET_KINDS)[number];

export type LectureAsset = {
  id: string;
  ownerId: string;
  noteId: string;
  kind: LectureAssetKind;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// Current app does not create lecture assets yet.
// This type reserves the future bridge between notes and lecture materials:
// PDF/PPT source files, extracted slide images, audio references, transcripts.
