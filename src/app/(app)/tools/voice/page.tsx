import Link from "next/link";
import { getVoiceProfile, listHumanizeHistory } from "@/lib/voice";
import { hasLlmKeyConfigured } from "@/lib/llm";
import { VoicePanel } from "./voice-panel";

export default function VoicePage() {
  const profile = getVoiceProfile();
  const history = listHumanizeHistory();
  const hasKey = hasLlmKeyConfigured();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Voice</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Build a profile from your own past writing, then use it to rewrite
          AI-sounding drafts in your voice. Nothing here posts anywhere —
          copy the result and take it wherever you were going to post it.
        </p>
      </div>

      {!hasKey && (
        <p className="text-sm text-muted-foreground border rounded-md p-3 max-w-2xl">
          No LLM key configured. Add an Anthropic or OpenAI key in{" "}
          <Link href="/settings" className="underline">
            Settings
          </Link>{" "}
          to use this tool.
        </p>
      )}

      <VoicePanel profile={profile} history={history} />
    </div>
  );
}
