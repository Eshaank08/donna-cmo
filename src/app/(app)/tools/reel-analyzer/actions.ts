"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { OUTPUT_DIR } from "@/lib/db";
import { runReelAnalyzer, type ReelRecord } from "@/lib/tools/reel-analyzer";

export type AnalyzeResult = Omit<ReelRecord, "video_path" | "frames_dir"> & {
  frameUrls: string[];
};

export type AnalyzeState = {
  result?: AnalyzeResult;
  error?: string;
};

export async function analyzeReelAction(
  _prevState: AnalyzeState,
  formData: FormData
): Promise<AnalyzeState> {
  const url = formData.get("url")?.toString().trim();
  if (!url) return { error: "Paste a reel URL first." };

  try {
    const { record } = await runReelAnalyzer(url);
    const frameFiles = fs.existsSync(record.frames_dir)
      ? fs
          .readdirSync(record.frames_dir)
          .filter((f) => f.toLowerCase().endsWith(".jpg"))
          .sort()
      : [];
    const frameUrls = frameFiles.map((f) => {
      const rel = path.relative(OUTPUT_DIR, path.join(record.frames_dir, f));
      return `/api/local-file?path=${encodeURIComponent(rel)}`;
    });

    revalidatePath("/tools/reel-analyzer");
    revalidatePath("/output");
    revalidatePath("/dashboard");
    return {
      result: {
        id: record.id,
        url: record.url,
        caption: record.caption,
        like_count: record.like_count,
        comment_count: record.comment_count,
        view_count: record.view_count,
        duration_seconds: record.duration_seconds,
        upload_date: record.upload_date,
        uploader: record.uploader,
        transcript: record.transcript,
        frameUrls,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
