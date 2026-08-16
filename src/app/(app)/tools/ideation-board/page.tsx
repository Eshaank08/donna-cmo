import { listCards } from "@/lib/ideation-board";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";
import { IdeationBoardPanel } from "./ideation-board-panel";

const tool = TOOLS.find((t) => t.slug === "ideation-board")!;

export default function IdeationBoardPage() {
  const cards = listCards();

  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        title="Ideation board"
        description="A simple kanban for content ideas. Add a card, then move it forward as it goes from idea to posted — no drag-and-drop, just buttons."
      />
      <IdeationBoardPanel cards={cards} />
    </div>
  );
}
