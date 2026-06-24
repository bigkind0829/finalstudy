import type { Note } from "@/lib/note";
import BlockList from "@/components/blocks/Blocks";

export default function NoteView({ note }: { note: Note | null }) {
  if (!note) {
    return (
      <section className="mt-8">
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-subtle">
          아직 노트 없음. 대본/오디오 넣고 생성하면 여기 표시.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4">
      <BlockList blocks={note.blocks} />
    </section>
  );
}
