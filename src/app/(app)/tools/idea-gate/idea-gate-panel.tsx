"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
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
import { GATES } from "@/lib/idea-gate-gates";
import type { IdeaCheck, IdeaGateConfig } from "@/lib/idea-gate";
import {
  checkIdeaAction,
  saveIdeaGateConfigAction,
  sendIdeaToBoardAction,
  type CheckState,
} from "./actions";

const initialState: CheckState = {};

function SendToBoardButton({ ideaText }: { ideaText: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="text-muted-foreground text-sm">
        Added to the ideation board.{" "}
        <Link href="/tools/ideation-board" className="underline">
          View board
        </Link>
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={sending}
      onClick={async () => {
        setSending(true);
        await sendIdeaToBoardAction(ideaText);
        setSending(false);
        setSent(true);
      }}
    >
      {sending ? "Adding..." : "Send to ideation board"}
    </Button>
  );
}

export function IdeaGatePanel({
  config,
  history,
}: {
  config: IdeaGateConfig;
  history: IdeaCheck[];
}) {
  const [state, runCheck, isChecking] = useActionState(
    checkIdeaAction,
    initialState
  );

  return (
    <Tabs defaultValue="check" className="max-w-3xl">
      <TabsList>
        <TabsTrigger value="check">Check an idea</TabsTrigger>
        <TabsTrigger value="config">Configure</TabsTrigger>
      </TabsList>

      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your boundaries and fingerprint</CardTitle>
            <CardDescription>
              The gates below are fixed — these two are yours to define.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              key={JSON.stringify(config)}
              action={saveIdeaGateConfigAction}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hard_boundaries">
                  Hard boundaries (one per line) — any match is an automatic
                  NO, before the gates even run
                </Label>
                <Textarea
                  id="hard_boundaries"
                  name="hard_boundaries"
                  rows={4}
                  defaultValue={config.hard_boundaries.join("\n")}
                  placeholder={
                    "e.g. specific past relationships\nfamily on camera\npolitics / legal advice"
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fingerprint_description">
                  What makes something recognizably you (optional — used as a
                  reminder on the fingerprint gate)
                </Label>
                <Textarea
                  id="fingerprint_description"
                  name="fingerprint_description"
                  rows={3}
                  defaultValue={config.fingerprint_description}
                />
              </div>
              <Button type="submit" className="self-start">
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="check">
        <form action={runCheck} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="idea_text">The idea</Label>
            <Textarea
              id="idea_text"
              name="idea_text"
              rows={2}
              placeholder="What's the content idea?"
              required
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="hard_boundary_hit" className="mt-1" />
            <span>
              This hits one of my hard boundaries — automatic NO, skip the
              gates below
            </span>
          </label>

          <div className="flex flex-col gap-3">
            {GATES.map((gate, i) => (
              <Card key={gate.key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {i + 1}. {gate.title}
                    </CardTitle>
                    <label className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                      <input
                        type="checkbox"
                        name={`gate_${gate.key}_pass`}
                      />
                      Pass
                    </label>
                  </div>
                  <CardDescription className="text-xs">
                    {gate.question}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Input
                    name={`gate_${gate.key}_proof`}
                    placeholder="One-line proof — empty proof counts as NO"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" disabled={isChecking} className="self-start">
            {isChecking ? "Checking..." : "Get verdict"}
          </Button>
        </form>

        {state.error && (
          <p className="text-destructive text-sm mt-4">{state.error}</p>
        )}

        {state.result && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Verdict</CardTitle>
                <Badge variant={state.result.verdict === "YES" ? "default" : "destructive"}>
                  {state.result.verdict}
                </Badge>
              </div>
              <CardDescription>{state.result.idea_text}</CardDescription>
            </CardHeader>
            {state.result.verdict === "YES" && (
              <CardContent className="pt-0">
                <SendToBoardButton
                  key={state.result.id}
                  ideaText={state.result.idea_text}
                />
              </CardContent>
            )}
          </Card>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Past checks</h2>
            <ul className="text-sm text-muted-foreground flex flex-col gap-1">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-2">
                  <Badge
                    variant={h.verdict === "YES" ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {h.verdict}
                  </Badge>
                  <span className="truncate">{h.idea_text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
