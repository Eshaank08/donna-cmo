import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getAllKeys } from "@/lib/keys";
import { appendJobLog, createJob, updateJob } from "@/lib/jobs";
import { CONFIG_PATH, SEEN_PATH } from "@/lib/reddit-radar-config";

const SCRIPT_DIR = path.join(process.cwd(), "python", "reddit-radar");
const SEEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type RedditPost = {
  id: string;
  subreddit: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  age_hours: number;
  relevance: number;
  why: string;
  angle: string;
  excerpt: string;
  draft: string;
  reddit_url: string;
};

export type ScanResult = {
  generated_at: string;
  count: number;
  auth: "public" | "oauth" | "public_fallback";
  has_credentials: boolean;
  lookback_hours: number;
  min_score: number;
  posts: RedditPost[];
  /** True when every request this scan made was refused (401/403) — Reddit
   * blocking anonymous access, not a genuine "no matches" result. */
  blocked: boolean;
  fetch_attempts: number;
  fetch_errors: number;
};

export async function scanRedditRadar(opts: {
  hours?: number;
  minScore?: number;
  markSeen?: boolean;
}): Promise<{ jobId: number; result: ScanResult }> {
  const jobId = createJob(
    "reddit-radar",
    JSON.stringify({ hours: opts.hours, minScore: opts.minScore })
  );
  updateJob(jobId, { status: "running" });

  const env = { ...process.env, ...getAllKeys() };
  const args = [
    "scan_cli.py",
    "--config",
    CONFIG_PATH,
    "--seen-path",
    SEEN_PATH,
  ];
  if (opts.hours !== undefined) args.push("--hours", String(opts.hours));
  if (opts.minScore !== undefined)
    args.push("--min-score", String(opts.minScore));
  if (opts.markSeen) args.push("--mark-seen");

  return new Promise((resolve, reject) => {
    const child = spawn("python3", args, { cwd: SCRIPT_DIR, env });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      appendJobLog(jobId, chunk.toString());
    });

    child.on("error", (err) => {
      updateJob(jobId, { status: "failed" });
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        updateJob(jobId, { status: "failed" });
        reject(new Error(stderr.trim() || `scan_cli.py exited with code ${code}`));
        return;
      }
      try {
        const result = JSON.parse(stdout) as ScanResult;
        updateJob(jobId, { status: "done" });
        resolve({ jobId, result });
      } catch (err) {
        updateJob(jobId, { status: "failed" });
        reject(err);
      }
    });
  });
}

type SeenFile = { ids: Record<string, number> };

function loadSeen(): SeenFile {
  if (!fs.existsSync(SEEN_PATH)) return { ids: {} };
  return JSON.parse(fs.readFileSync(SEEN_PATH, "utf-8"));
}

function saveSeen(seen: SeenFile) {
  const cutoff = Date.now() - SEEN_MAX_AGE_MS;
  const pruned = Object.fromEntries(
    Object.entries(seen.ids).filter(([, ts]) => ts * 1000 >= cutoff)
  );
  fs.mkdirSync(path.dirname(SEEN_PATH), { recursive: true });
  fs.writeFileSync(SEEN_PATH, JSON.stringify({ ids: pruned }, null, 2));
}

export function dismissRedditPost(id: string) {
  const seen = loadSeen();
  seen.ids[id] = Date.now() / 1000;
  saveSeen(seen);
}
