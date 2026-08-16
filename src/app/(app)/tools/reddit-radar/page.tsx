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
        description="Finds people with the problem your product solves. You message them yourself — nothing here posts or comments on your behalf. Reddit currently blocks anonymous access to its public JSON endpoints, so this needs your own free Reddit API app (Settings) for OAuth to actually return results."
      />

      <RedditRadarPanel config={config} />
    </div>
  );
}
