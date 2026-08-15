import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR } from "@/lib/db";
import { getAllKeys } from "@/lib/keys";
import { appendJobLog, createJob, updateJob } from "@/lib/jobs";

const SCRIPT_DIR = path.join(process.cwd(), "python", "reel-analyzer");

export type ReelRecord = {
  id: string;
  url: string;
  caption: string | null;
  like_count: number | null;
  comment_count: number | null;
  view_count: number | null;
  duration_seconds: number | null;
  upload_date: string | null;
  uploader: string | null;
  video_path: string;
  frames_dir: string;
  transcript: string | null;
};

export async function runReelAnalyzer(
  url: string
): Promise<{ jobId: number; record: ReelRecord }> {
  const jobId = createJob("reel-analyzer", url);
  const outDir = path.join(OUTPUT_DIR, "reel-analyzer", String(jobId));
  fs.mkdirSync(outDir, { recursive: true });
  updateJob(jobId, { status: "running" });

  const env = { ...process.env, ...getAllKeys() };

  return new Promise((resolve, reject) => {
    const child = spawn(
      "python3",
      ["analyze_reel.py", url, `--output-dir=${outDir}`],
      { cwd: SCRIPT_DIR, env }
    );

    let stderr = "";
    child.stdout.on("data", (chunk) => appendJobLog(jobId, chunk.toString()));
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
        reject(new Error(stderr.trim() || `analyze_reel.py exited with code ${code}`));
        return;
      }
      try {
        const postId = fs
          .readdirSync(outDir, { withFileTypes: true })
          .find((entry) => entry.isDirectory())?.name;
        if (!postId) throw new Error("analyze_reel.py produced no output directory");
        const postDir = path.join(outDir, postId);
        const record = JSON.parse(
          fs.readFileSync(path.join(postDir, "meta.json"), "utf-8")
        ) as ReelRecord;
        updateJob(jobId, { status: "done", output_path: postDir });
        resolve({ jobId, record });
      } catch (err) {
        updateJob(jobId, { status: "failed" });
        reject(err);
      }
    });
  });
}
