"use server";

import { revalidatePath } from "next/cache";
import {
  getRedditRadarConfig,
  saveRedditRadarConfig,
  type RedditRadarConfig,
} from "@/lib/reddit-radar-config";
import {
  dismissRedditPost,
  scanRedditRadar,
  type ScanResult,
} from "@/lib/tools/reddit-radar";

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function linesToWeightMap(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const line of linesToArray(text)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const weight = Number(line.slice(idx + 1).trim());
    if (key && !Number.isNaN(weight)) out[key] = weight;
  }
  return out;
}

function linesToStringMap(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of linesToArray(text)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

export async function saveConfigAction(formData: FormData) {
  const current = getRedditRadarConfig();
  const field = (name: string) => formData.get(name)?.toString() ?? "";

  const config: RedditRadarConfig = {
    ...current,
    user_agent: field("user_agent") || current.user_agent,
    lookback_hours: Number(field("lookback_hours")) || current.lookback_hours,
    min_score: Number(field("min_score")) || current.min_score,
    optional_link: field("optional_link"),
    include_link_in_draft: formData.get("include_link_in_draft") === "on",
    intro_line: field("intro_line"),
    subreddits: linesToArray(field("subreddits")),
    search_queries: linesToArray(field("search_queries")),
    context_anchors: linesToArray(field("context_anchors")),
    negative_keywords: linesToArray(field("negative_keywords")),
    keyword_weights: linesToWeightMap(field("keyword_weights")),
    comment_angles: linesToStringMap(field("comment_angles")),
  };

  saveRedditRadarConfig(config);
  revalidatePath("/tools/reddit-radar");
}

export type ScanState = {
  result?: ScanResult;
  error?: string;
};

export async function scanAction(
  _prevState: ScanState,
  formData: FormData
): Promise<ScanState> {
  try {
    const { result } = await scanRedditRadar({
      hours: Number(formData.get("hours")) || undefined,
      minScore: Number(formData.get("minScore")) || undefined,
      markSeen: false,
    });
    revalidatePath("/output");
    revalidatePath("/dashboard");
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function dismissAction(id: string) {
  dismissRedditPost(id);
}
