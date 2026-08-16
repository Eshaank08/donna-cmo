import Link from "next/link";
import { getAllKeys, KEY_REGISTRY } from "@/lib/keys";
import { listJobs } from "@/lib/jobs";
import { listIdeaChecks } from "@/lib/idea-gate";
import { listCards } from "@/lib/ideation-board";
import { getVoiceProfile } from "@/lib/voice";
import { isLlmAvailable } from "@/lib/llm";
import { TOOLS } from "@/lib/tool-visuals";
import { ToolIcon, StatusDot } from "@/components/tool-icon";

function relativeTime(sqliteDatetime: string): string {
  const then = new Date(`${sqliteDatetime.replace(" ", "T")}Z`).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const keys = getAllKeys();
  const keysSet = KEY_REGISTRY.filter((k) => keys[k.name]).length;
  const jobs = listJobs();
  const liveTools = TOOLS.filter((t) => !t.comingSoon);

  const reelJobs = listJobs("reel-analyzer");
  const ideaChecks = listIdeaChecks();
  const cards = listCards();
  const voiceProfile = getVoiceProfile();
  const hasLlm = await isLlmAvailable();
  const hasRedditKeys = Boolean(keys.REDDIT_CLIENT_ID && keys.REDDIT_CLIENT_SECRET);

  function noteFor(slug: string): string {
    switch (slug) {
      case "reel-analyzer":
        return reelJobs.length
          ? `${reelJobs.length} run${reelJobs.length === 1 ? "" : "s"} · ${relativeTime(reelJobs[0].created_at)}`
          : "no runs yet";
      case "reddit-radar":
        return hasRedditKeys ? "Reddit key set (OAuth)" : "needs Reddit OAuth key — Reddit blocks anonymous access";
      case "idea-gate":
        return ideaChecks.length
          ? `${ideaChecks.length} idea${ideaChecks.length === 1 ? "" : "s"} checked`
          : "no ideas checked yet";
      case "ideation-board":
        return cards.length ? `${cards.length} card${cards.length === 1 ? "" : "s"}` : "no cards yet";
      case "voice":
        if (!hasLlm) return "needs a key, Claude Code, or Ollama";
        return voiceProfile ? "profile saved" : "no profile yet";
      default:
        return "coming soon";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Everything here runs locally and saves to this machine as you go —
          close it, come back later, it&apos;s still here.
        </p>
      </div>

      <div className="flex gap-8 pb-5 border-b">
        <div>
          <p className="font-heading text-[1.15rem] font-semibold tabular-nums">
            {keysSet}/{KEY_REGISTRY.length}
          </p>
          <p className="text-xs text-muted-foreground">keys set</p>
        </div>
        <div>
          <p className="font-heading text-[1.15rem] font-semibold tabular-nums">
            {jobs.length}
          </p>
          <p className="text-xs text-muted-foreground">jobs run</p>
        </div>
        <div>
          <p className="font-heading text-[1.15rem] font-semibold tabular-nums">
            {liveTools.length}/{TOOLS.length}
          </p>
          <p className="text-xs text-muted-foreground">tools live</p>
        </div>
      </div>

      {keysSet === 0 && (
        <div className="bg-callout text-callout-foreground rounded-2xl px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span>No API keys set yet — Idea gate, Ideation board, and the Reel analyzer&apos;s metadata/hooks/frames all still run. Reddit radar needs a free Reddit OAuth key (Reddit blocks anonymous access). The Voice tool needs an LLM too, but a logged-in Claude Code CLI or local Ollama both work with no key.</span>
          <Link href="/settings" className="underline underline-offset-2 shrink-0 font-medium">
            Add them in Settings
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const live = !tool.comingSoon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex flex-col gap-2 rounded-lg border p-3.5 hover:border-foreground/25 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ToolIcon icon={tool.icon} live={live} size="sm" />
                <span className="text-sm font-semibold">{tool.name}</span>
                <span className="ml-auto">
                  <StatusDot live={live} />
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool.tagline}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {noteFor(tool.slug)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
