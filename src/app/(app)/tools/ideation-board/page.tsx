import { listCards } from "@/lib/ideation-board";
import { IdeationBoardPanel } from "./ideation-board-panel";

export default function IdeationBoardPage() {
  const cards = listCards();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Ideation board</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          A simple kanban for content ideas. Add a card, then move it forward
          as it goes from idea to posted — no drag-and-drop, just buttons.
        </p>
      </div>
      <IdeationBoardPanel cards={cards} />
    </div>
  );
}
