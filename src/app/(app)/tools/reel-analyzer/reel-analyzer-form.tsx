"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analyzeReelAction, type AnalyzeState } from "./actions";

const initialState: AnalyzeState = {};

export function ReelAnalyzerForm() {
  const [state, formAction, isPending] = useActionState(
    analyzeReelAction,
    initialState
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex gap-2 max-w-xl">
        <Input
          name="url"
          placeholder="https://www.instagram.com/reel/..."
          required
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Analyzing..." : "Analyze"}
        </Button>
      </form>

      {state.error && (
        <p className="text-destructive text-sm max-w-xl whitespace-pre-wrap">
          {state.error}
        </p>
      )}

      {state.result && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{state.result.uploader ?? "Reel"}</CardTitle>
            <CardDescription>{state.result.url}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{state.result.duration_seconds}s</span>
              <span>{state.result.like_count ?? "—"} likes</span>
              <span>{state.result.comment_count ?? "—"} comments</span>
              <span>{state.result.view_count ?? "—"} views</span>
            </div>

            {state.result.caption && (
              <div>
                <h3 className="text-sm font-medium mb-1">Caption</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {state.result.caption}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-1">Transcript</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {state.result.transcript ?? "(no transcript — set GROQ_API_KEY in Settings to enable)"}
              </p>
            </div>

            {state.result.frameUrls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Frames ({state.result.frameUrls.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {state.result.frameUrls.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element -- local filesystem image served via /api/local-file, not optimizable by next/image
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="rounded border aspect-[9/16] object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
