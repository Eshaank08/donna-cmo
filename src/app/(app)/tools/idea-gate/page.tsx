import { getIdeaGateConfig, listIdeaChecks } from "@/lib/idea-gate";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";
import { IdeaGatePanel } from "./idea-gate-panel";

const tool = TOOLS.find((t) => t.slug === "idea-gate")!;

export default function IdeaGatePage() {
  const config = getIdeaGateConfig();
  const history = listIdeaChecks();

  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        title="Idea gate"
        description="A binary yes/no filter for content ideas — ten gates, no partial credit. Empty proof counts as a no. If an idea can't clear every gate, it doesn't get made — fix the idea or kill it."
      />
      <IdeaGatePanel config={config} history={history} />
    </div>
  );
}
