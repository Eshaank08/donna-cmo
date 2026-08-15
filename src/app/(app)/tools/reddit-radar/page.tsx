import { getRedditRadarConfig } from "@/lib/reddit-radar-config";
import { RedditRadarPanel } from "./reddit-radar-panel";

export default function RedditRadarPage() {
  const config = getRedditRadarConfig();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Reddit radar</h1>
        <p className="text-muted-foreground text-sm">
          Finds people with the problem your product solves. You message
          them yourself — nothing here posts or comments on your behalf.
          Needs your own Reddit API app (Settings) — Reddit blocks
          unauthenticated access now.
        </p>
      </div>

      <RedditRadarPanel config={config} />
    </div>
  );
}
