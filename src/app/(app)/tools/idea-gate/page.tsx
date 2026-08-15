import { getIdeaGateConfig, listIdeaChecks } from "@/lib/idea-gate";
import { IdeaGatePanel } from "./idea-gate-panel";

export default function IdeaGatePage() {
  const config = getIdeaGateConfig();
  const history = listIdeaChecks();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Idea gate</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          A binary yes/no filter for content ideas — ten gates, no partial
          credit. Empty proof counts as a no. If an idea can&apos;t clear
          every gate, it doesn&apos;t get made — fix the idea or kill it.
        </p>
      </div>
      <IdeaGatePanel config={config} history={history} />
    </div>
  );
}
