import { existsSync, statSync } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { OUTPUT_DIR } from "@/lib/db";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".md": "text/markdown",
  ".json": "application/json",
};

// Serves files strictly under local/output/ — the only place tool jobs write
// artifacts to. Every request re-resolves and re-checks the path so a request
// can never escape that directory, no matter what's passed in.
export async function GET(request: NextRequest) {
  const rel = request.nextUrl.searchParams.get("path");
  if (!rel) return new Response("Missing path", { status: 400 });

  const resolved = path.resolve(OUTPUT_DIR, rel);
  if (!resolved.startsWith(OUTPUT_DIR + path.sep)) {
    return new Response("Invalid path", { status: 400 });
  }
  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const stream = createReadStream(resolved);
  return new Response(stream as unknown as ReadableStream, {
    headers: { "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream" },
  });
}
