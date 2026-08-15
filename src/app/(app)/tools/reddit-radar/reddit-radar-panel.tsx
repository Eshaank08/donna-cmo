"use client";

import { useActionState, useState } from "react";
import posthog from "posthog-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { RedditRadarConfig } from "@/lib/reddit-radar-config";
import { stringMapToLines, weightMapToLines } from "@/lib/reddit-radar-format";
import type { RedditPost } from "@/lib/tools/reddit-radar";
import { dismissAction, saveConfigAction, scanAction, type ScanState } from "./actions";

const initialScanState: ScanState = {};

export function RedditRadarPanel({ config }: { config: RedditRadarConfig }) {
  const [scanState, runScan, isScanning] = useActionState(
    scanAction,
    initialScanState
  );
  const [posts, setPosts] = useState<RedditPost[] | null>(
    scanState.result?.posts ?? null
  );
  const [syncedResult, setSyncedResult] = useState(scanState.result);
  if (scanState.result !== syncedResult) {
    setSyncedResult(scanState.result);
    if (scanState.result) setPosts(scanState.result.posts);
  }

  function handleDismiss(id: string) {
    posthog.capture("reddit_post_dismissed");
    setPosts((prev) => (prev ?? []).filter((p) => p.id !== id));
    dismissAction(id);
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    posthog.capture("reddit_draft_copied");
  }

  function handleConfigSave(formData: FormData) {
    posthog.capture("reddit_radar_config_saved");
    saveConfigAction(formData);
  }

  function handleScan(formData: FormData) {
    posthog.capture("reddit_radar_scan_requested");
    runScan(formData);
  }

  return (
    <Tabs defaultValue="scan" className="max-w-3xl">
      <TabsList>
        <TabsTrigger value="scan">Scan</TabsTrigger>
        <TabsTrigger value="config">Configure</TabsTrigger>
      </TabsList>

      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where and what to look for</CardTitle>
            <CardDescription>
              Drives the search directly from your niche — one line per item
              unless noted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              key={JSON.stringify(config)}
              action={handleConfigSave}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lookback_hours">Lookback hours</Label>
                  <Input
                    id="lookback_hours"
                    name="lookback_hours"
                    type="number"
                    defaultValue={config.lookback_hours}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="min_score">Min relevance score</Label>
                  <Input
                    id="min_score"
                    name="min_score"
                    type="number"
                    defaultValue={config.min_score}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subreddits">Subreddits (one per line)</Label>
                <Textarea
                  id="subreddits"
                  name="subreddits"
                  rows={4}
                  defaultValue={config.subreddits.join("\n")}
                  placeholder={"SaaS\nstartups\nEntrepreneur"}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search_queries">Search queries (one per line)</Label>
                <Textarea
                  id="search_queries"
                  name="search_queries"
                  rows={3}
                  defaultValue={config.search_queries.join("\n")}
                  placeholder={"looking for an alternative to\nany recommendations for"}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="context_anchors">
                  Context anchors (one per line — posts outside your listed
                  subreddits need one of these to count)
                </Label>
                <Textarea
                  id="context_anchors"
                  name="context_anchors"
                  rows={3}
                  defaultValue={config.context_anchors.join("\n")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="keyword_weights">
                  Keyword weights — one per line, <code className="text-xs">keyword: weight</code>
                </Label>
                <Textarea
                  id="keyword_weights"
                  name="keyword_weights"
                  rows={5}
                  defaultValue={weightMapToLines(config.keyword_weights)}
                  placeholder={"struggling with: 4\nany alternative: 5"}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="negative_keywords">
                  Negative keywords — filters posts out entirely
                </Label>
                <Textarea
                  id="negative_keywords"
                  name="negative_keywords"
                  rows={3}
                  defaultValue={config.negative_keywords.join("\n")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="comment_angles">
                  Comment angles — one per line,{" "}
                  <code className="text-xs">keyword: what to say</code>. Always
                  include a <code className="text-xs">general:</code> fallback.
                </Label>
                <Textarea
                  id="comment_angles"
                  name="comment_angles"
                  rows={4}
                  defaultValue={stringMapToLines(config.comment_angles)}
                  placeholder={"general: concrete first step, not generic advice."}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="intro_line">
                  Draft intro line (optional, goes at the start of every draft)
                </Label>
                <Input
                  id="intro_line"
                  name="intro_line"
                  defaultValue={config.intro_line}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="optional_link">
                  Optional link to include in drafts
                </Label>
                <Input
                  id="optional_link"
                  name="optional_link"
                  defaultValue={config.optional_link}
                  placeholder="https://yourproduct.com"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <input
                    type="checkbox"
                    name="include_link_in_draft"
                    defaultChecked={config.include_link_in_draft}
                  />
                  Include it in generated drafts
                </label>
              </div>

              <input
                type="hidden"
                name="user_agent"
                value={config.user_agent}
              />

              <Button type="submit" className="self-start">
                Save config
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scan">
        <form action={handleScan} className="flex gap-2 mb-4">
          <Input
            name="hours"
            type="number"
            defaultValue={config.lookback_hours}
            className="max-w-32"
            aria-label="Lookback hours"
          />
          <Input
            name="minScore"
            type="number"
            defaultValue={config.min_score}
            className="max-w-32"
            aria-label="Min score"
          />
          <Button type="submit" disabled={isScanning}>
            {isScanning ? "Scanning..." : "Scan Reddit"}
          </Button>
        </form>

        {scanState.error && (
          <p className="text-destructive text-sm whitespace-pre-wrap mb-4">
            {scanState.error}
          </p>
        )}

        {scanState.result && (
          <p className="text-muted-foreground text-sm mb-4">
            {scanState.result.count} posts · auth: {scanState.result.auth} ·{" "}
            {scanState.result.generated_at}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {(posts ?? []).length === 0 && scanState.result && (
            <p className="text-muted-foreground text-sm">
              No posts cleared the bar. Widen the lookback or lower min score
              in Configure.
            </p>
          )}
          {(posts ?? []).map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">r/{post.subreddit}</Badge>
                  <Badge>{post.relevance.toFixed(1)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.age_hours}h · {post.num_comments} comments ·{" "}
                    {post.score} upvotes · u/{post.author}
                  </span>
                </div>
                <CardTitle className="text-base">{post.title}</CardTitle>
                <CardDescription>{post.angle}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground bg-muted rounded p-3 whitespace-pre-wrap max-h-32 overflow-auto">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`draft-${post.id}`} className="text-xs">
                    Draft (edit before posting)
                  </Label>
                  <Textarea
                    id={`draft-${post.id}`}
                    defaultValue={post.draft}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    nativeButton={false}
                    render={
                      <a
                        href={post.reddit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    Open on Reddit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById(
                        `draft-${post.id}`
                      ) as HTMLTextAreaElement | null;
                      if (el) handleCopy(el.value);
                    }}
                  >
                    Copy draft
                  </Button>
                  <Button variant="ghost" onClick={() => handleDismiss(post.id)}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
