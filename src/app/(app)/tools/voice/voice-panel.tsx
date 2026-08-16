"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { HumanizeRecord, VoiceProfile } from "@/lib/voice";
import {
  buildProfileAction,
  buildStatisticalProfileAction,
  humanizeAction,
  type BuildProfileState,
  type HumanizeState,
} from "./actions";

const initialBuildState: BuildProfileState = {};
const initialHumanizeState: HumanizeState = {};

export function VoicePanel({
  profile,
  history,
  hasLlm,
}: {
  profile: VoiceProfile | null;
  history: HumanizeRecord[];
  hasLlm: boolean;
}) {
  const [buildState, runBuild, isBuilding] = useActionState(
    buildProfileAction,
    initialBuildState
  );
  const [statsState, runStats, isBuildingStats] = useActionState(
    buildStatisticalProfileAction,
    initialBuildState
  );

  const [latestProfile, setLatestProfile] = useState(profile);
  const [syncedBuild, setSyncedBuild] = useState(buildState.profile);
  if (buildState.profile !== syncedBuild) {
    setSyncedBuild(buildState.profile);
    if (buildState.profile) setLatestProfile(buildState.profile);
  }
  const [syncedStats, setSyncedStats] = useState(statsState.profile);
  if (statsState.profile !== syncedStats) {
    setSyncedStats(statsState.profile);
    if (statsState.profile) setLatestProfile(statsState.profile);
  }
  const currentProfile = latestProfile;

  const [sampleIds, setSampleIds] = useState<number[]>([0, 1, 2]);
  const nextSampleId = useRef(3);

  function addSample() {
    setSampleIds((prev) => [...prev, nextSampleId.current++]);
  }
  function removeSample(id: number) {
    setSampleIds((prev) => (prev.length > 1 ? prev.filter((x) => x !== id) : prev));
  }

  const [humanizeState, runHumanize, isHumanizing] = useActionState(
    humanizeAction,
    initialHumanizeState
  );
  const [historyList, setHistoryList] = useState(history);
  const [syncedResult, setSyncedResult] = useState(humanizeState.result);
  if (humanizeState.result !== syncedResult) {
    setSyncedResult(humanizeState.result);
    if (humanizeState.result) {
      const result = humanizeState.result;
      setHistoryList((prev) => [result, ...prev]);
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <Tabs defaultValue={profile ? "humanize" : "profile"} className="max-w-3xl">
      <TabsList>
        <TabsTrigger value="profile">Build profile</TabsTrigger>
        <TabsTrigger value="humanize">Humanize a draft</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        {currentProfile && (
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Current profile</CardTitle>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckIcon className="size-3.5" />
                  Saved locally
                </span>
              </div>
              <CardDescription>
                Built from {currentProfile.samples.length} sample
                {currentProfile.samples.length === 1 ? "" : "s"} · last
                updated {currentProfile.updated_at}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <p className="font-medium">Tone</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentProfile.tone || "—"}
                </p>
              </div>
              <div>
                <p className="font-medium">Sentence patterns</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentProfile.sentence_patterns || "—"}
                </p>
              </div>
              <div>
                <p className="font-medium">Recurring phrases</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentProfile.recurring_phrases || "—"}
                </p>
              </div>
              <div>
                <p className="font-medium">Avoid</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentProfile.avoid || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form action={runBuild} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Paste a few samples of your own past writing — captions,
            scripts, posts. The more samples, the more specific the profile.
          </p>

          <div className="flex flex-col gap-3">
            {sampleIds.map((id, i) => (
              <div key={id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`sample-${id}`}>Sample {i + 1}</Label>
                  {sampleIds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSample(id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Textarea
                  id={`sample-${id}`}
                  name="sample"
                  rows={4}
                  placeholder="Paste a caption, script, or post you actually wrote..."
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={addSample}>
              Add another sample
            </Button>
            <Button
              type="submit"
              formAction={runBuild}
              disabled={isBuilding || !hasLlm}
              title={hasLlm ? undefined : "Needs an LLM key or local Ollama"}
            >
              {isBuilding
                ? "Analyzing..."
                : currentProfile
                ? "Rebuild with AI"
                : "Build with AI"}
            </Button>
            <Button
              type="submit"
              formAction={runStats}
              variant="secondary"
              disabled={isBuildingStats}
            >
              {isBuildingStats ? "Computing..." : "Build without AI"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            &quot;Without AI&quot; computes real sentence-length, punctuation,
            and repeated-phrase patterns straight from the samples — no key,
            no network. Cruder than the AI read (it can&apos;t judge tone),
            but zero setup.
          </p>
        </form>

        {(buildState.error || statsState.error) && (
          <p className="text-destructive text-sm mt-4 whitespace-pre-wrap">
            {buildState.error || statsState.error}
          </p>
        )}
      </TabsContent>

      <TabsContent value="humanize">
        <form action={runHumanize} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft_text">Draft to rewrite</Label>
            <Textarea
              id="draft_text"
              name="draft_text"
              rows={6}
              placeholder="Paste the generic/AI-sounding draft here..."
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isHumanizing || !hasLlm}
            className="self-start"
            title={hasLlm ? undefined : "Needs an LLM key or local Ollama"}
          >
            {isHumanizing ? "Rewriting..." : "Humanize"}
          </Button>
          {!hasLlm && (
            <p className="text-xs text-muted-foreground">
              Rewriting a draft always needs an LLM — there&apos;s no honest
              rule-based version of this one. Add a key in Settings, or run
              Ollama locally for free.
            </p>
          )}
        </form>

        {humanizeState.error && (
          <p className="text-destructive text-sm mt-4 whitespace-pre-wrap">
            {humanizeState.error}
          </p>
        )}

        {humanizeState.result && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Rewritten</CardTitle>
              <CardDescription>
                Review before you post it anywhere — this doesn&apos;t post
                for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm whitespace-pre-wrap bg-muted rounded p-3">
                {humanizeState.result.output_text}
              </p>
              <Button
                variant="outline"
                className="self-start"
                onClick={() => handleCopy(humanizeState.result!.output_text)}
              >
                Copy
              </Button>
            </CardContent>
          </Card>
        )}

        {historyList.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Past rewrites</h2>
            <div className="flex flex-col gap-3">
              {historyList.map((h) => (
                <Card key={h.id}>
                  <CardContent className="flex flex-col gap-2 pt-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-muted-foreground line-clamp-2">
                        {h.input_text}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {h.created_at}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{h.output_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
