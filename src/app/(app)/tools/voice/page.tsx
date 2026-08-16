import Link from "next/link";
import { getVoiceProfile, listHumanizeHistory } from "@/lib/voice";
import { isLlmAvailable } from "@/lib/llm";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";
import { VoicePanel } from "./voice-panel";

const tool = TOOLS.find((t) => t.slug === "voice")!;

export default async function VoicePage() {
  const profile = getVoiceProfile();
  const history = listHumanizeHistory();
  const hasLlm = await isLlmAvailable();

  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        title="Voice"
        description="Build a profile from your own past writing, then use it to rewrite AI-sounding drafts in your voice. Nothing here posts anywhere — copy the result and take it wherever you were going to post it."
      />

      {!hasLlm && (
        <p className="text-sm text-muted-foreground border rounded-md p-3 max-w-2xl">
          No LLM available — add an Anthropic or OpenAI key in{" "}
          <Link href="/settings" className="underline">
            Settings
          </Link>
          , log into the Claude Code CLI (<code className="text-xs">claude login</code>) if it&apos;s installed, or run{" "}
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ollama
          </a>{" "}
          locally with any model — no separate key needed for either of the
          last two. Rewriting a draft always needs one of these. Building a
          profile doesn&apos;t — use the no-AI option below for real computed
          patterns instead.
        </p>
      )}

      <VoicePanel profile={profile} history={history} hasLlm={hasLlm} />
    </div>
  );
}
