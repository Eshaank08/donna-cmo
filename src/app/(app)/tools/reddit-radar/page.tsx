import { getRedditRadarConfig } from "@/lib/reddit-radar-config";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";
import { RedditRadarPanel } from "./reddit-radar-panel";

const tool = TOOLS.find((t) => t.slug === "reddit-radar")!;

export default function RedditRadarPage() {
  const config = getRedditRadarConfig();

  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        title="Reddit radar"
        description="Finds people with the problem your product solves. You message them yourself — nothing here posts or comments on your behalf. Needs your own Reddit API app (Settings) — Reddit blocks unauthenticated access now."
      />

      <RedditRadarPanel config={config} />
    </div>
  );
}
