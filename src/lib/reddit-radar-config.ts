import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "local", "reddit-radar");
export const CONFIG_PATH = path.join(DATA_DIR, "config.json");
export const SEEN_PATH = path.join(DATA_DIR, "seen.json");
const TEMPLATE_PATH = path.join(
  process.cwd(),
  "python",
  "reddit-radar",
  "config.example.json"
);

export type RedditRadarConfig = {
  user_agent: string;
  lookback_hours: number;
  min_score: number;
  max_results: number;
  per_sub_limit: number;
  request_pause_sec: number;
  optional_link: string;
  include_link_in_draft: boolean;
  intro_line: string;
  subreddits: string[];
  search_queries: string[];
  context_anchors: string[];
  keyword_weights: Record<string, number>;
  negative_keywords: string[];
  comment_angles: Record<string, string>;
};

export function getRedditRadarConfig(): RedditRadarConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(TEMPLATE_PATH, CONFIG_PATH);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

export function saveRedditRadarConfig(config: RedditRadarConfig) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
