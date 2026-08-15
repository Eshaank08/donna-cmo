"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowUpIcon, CheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROMPT = "Founders who can't find their first customers";

const STATUS_STEPS = [
  "Scanning r/SaaS...",
  "Scanning r/startups...",
  "Scoring relevance...",
];

const RESULTS = [
  {
    id: "1",
    subreddit: "SaaS",
    relevance: 8.7,
    snippet:
      "“Two months since launch and still zero paying customers. I don't even know where to look for people with this problem.”",
    reply:
      "Following this too. What worked for us was searching for the exact words people use to describe the problem, not the product category.",
  },
  {
    id: "2",
    subreddit: "startups",
    relevance: 7.9,
    snippet:
      "“Built the thing, nobody's buying. Cold outreach feels like shouting into a void. How did you find your first ten?”",
    reply:
      "Our first ten came from people already complaining about this in public, not from an outreach list. Worth searching before building the next feature.",
  },
  {
    id: "3",
    subreddit: "Entrepreneur",
    relevance: 7.2,
    snippet:
      "“Anyone else stuck at the 'nobody knows we exist' stage? Feels different from every growth thread I've read.”",
    reply:
      "It is different. The fix is finding the handful of people already describing this exact stuck point, then replying to them directly.",
  },
];

const TYPE_MS = 26;
const TYPE_START_DELAY = 300;
const STATUS_STEP_MS = 700;
const RESULT_STAGGER_MS = 450;
const HOLD_MS = 3400;

type Phase = "typing" | "processing" | "revealing" | "holding";

export function RedditRadarDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, ms)
      );
    };

    function run() {
      setTyped("");
      setStatusIndex(0);
      setPhase("typing");

      for (let i = 0; i < PROMPT.length; i++) {
        after(TYPE_START_DELAY + i * TYPE_MS, () => setTyped(PROMPT.slice(0, i + 1)));
      }

      const afterTyping = TYPE_START_DELAY + PROMPT.length * TYPE_MS + 450;
      after(afterTyping, () => setPhase("processing"));

      STATUS_STEPS.forEach((_, i) => {
        after(afterTyping + i * STATUS_STEP_MS, () => setStatusIndex(i));
      });

      const afterProcessing = afterTyping + STATUS_STEPS.length * STATUS_STEP_MS;
      after(afterProcessing, () => setPhase("revealing"));

      const holdAt = afterProcessing + RESULTS.length * RESULT_STAGGER_MS + 400;
      after(holdAt, () => setPhase("holding"));

      after(holdAt + HOLD_MS, run);
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isInView]);

  const isBusy = phase === "processing";
  const isRevealed = phase === "revealing" || phase === "holding";

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      // clipboard unavailable in this context - purely decorative, no-op
    }
  }

  return (
    <div ref={containerRef} className="mx-auto flex max-w-sm flex-col gap-2">
      <div
        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
        style={{ boxShadow: "var(--shadow-floating)" }}
      >
        <span className="min-w-0 flex-1 truncate text-sm text-[#17191c]">
          {typed.length === 0 ? (
            <span className="text-[#a3a6af]">Ask anything...</span>
          ) : (
            typed
          )}
          <span className="ml-px inline-block h-3.5 w-px translate-y-px animate-pulse bg-[#17191c] align-middle" />
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#17191c] text-white">
          {isBusy ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <ArrowUpIcon className="size-3.5" />
          )}
        </span>
      </div>

      <AnimatePresence>
        {isBusy && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-[#777b86]"
            style={{ boxShadow: "var(--shadow-floating)" }}
          >
            <Loader2Icon className="size-3.5 shrink-0 animate-spin text-[#5d2a1a]" />
            {STATUS_STEPS[statusIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        {isRevealed &&
          RESULTS.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i * RESULT_STAGGER_MS) / 1000 }}
              className="flex flex-col gap-2 rounded-xl bg-white p-3"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[#ececec] text-[#777b86]">
                  r/{result.subreddit}
                </Badge>
                <span className="text-xs font-medium text-[#1f425c]">
                  {result.relevance.toFixed(1)}
                </span>
              </div>
              <p className="text-xs leading-snug text-[#17191c] italic">{result.snippet}</p>
              <div className="flex items-start justify-between gap-2 rounded-lg bg-[#f2f2f3] p-2">
                <p className="text-xs leading-snug text-[#5d2a1a]">{result.reply}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(result.id, result.reply)}
                  className="shrink-0 text-[#a3a6af] hover:text-[#17191c]"
                  aria-label="Copy example reply"
                >
                  {copiedId === result.id ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
