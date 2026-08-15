"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { LinkIcon, Loader2Icon } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

const DEMO_URL = "instagram.com/reel/dpq3hookexample";

const STATUS_STEPS = [
  "Fetching reel...",
  "Extracting frames...",
  "Transcribing audio...",
  "Finding the hook...",
];

const TRANSCRIPT_LINES = [
  "“Nobody tells you this before you start...”",
  "“...three seconds in, before the logo even shows.”",
];

const FRAME_TINTS = ["#fbe1d1", "#dbe6f0", "#dfe9d8", "#fbe1d1", "#dbe6f0"];

const TYPE_MS = 32;
const TYPE_START_DELAY = 300;
const STATUS_STEP_MS = 650;
const REVEAL_DELAY = 1300;
const HOLD_MS = 3000;

type Phase = "typing" | "processing" | "revealing" | "holding";

export function ReelAnalyzerDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);

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

      for (let i = 0; i < DEMO_URL.length; i++) {
        after(TYPE_START_DELAY + i * TYPE_MS, () =>
          setTyped(DEMO_URL.slice(0, i + 1))
        );
      }

      const afterTyping = TYPE_START_DELAY + DEMO_URL.length * TYPE_MS + 400;
      after(afterTyping, () => setPhase("processing"));

      STATUS_STEPS.forEach((_, i) => {
        after(afterTyping + i * STATUS_STEP_MS, () => setStatusIndex(i));
      });

      const afterProcessing = afterTyping + STATUS_STEPS.length * STATUS_STEP_MS;
      after(afterProcessing, () => setPhase("revealing"));

      const holdAt = afterProcessing + REVEAL_DELAY;
      after(holdAt, () => setPhase("holding"));

      after(holdAt + HOLD_MS, run);
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isInView]);

  const isProcessing = phase === "processing";
  const isRevealed = phase === "revealing" || phase === "holding";

  return (
    <div ref={containerRef} className="mx-auto flex max-w-sm flex-col gap-3">
      <div
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5"
        style={{ boxShadow: "var(--shadow-floating)" }}
      >
        <LinkIcon className="size-3.5 shrink-0 text-[#a3a6af]" />
        <span className="truncate font-mono text-xs text-[#17191c]">
          {typed}
          <span className="ml-px inline-block h-3 w-px translate-y-px animate-pulse bg-[#17191c] align-middle" />
        </span>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-[#777b86]"
            style={{ boxShadow: "var(--shadow-floating)" }}
          >
            <Loader2Icon className="size-3.5 shrink-0 animate-spin text-[#5d2a1a]" />
            {STATUS_STEPS[statusIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-xl bg-white p-3"
          style={{ boxShadow: "var(--shadow-floating)" }}
        >
          <div className="flex gap-1.5">
            {FRAME_TINTS.map((tint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="aspect-[9/16] flex-1 rounded-md"
                style={{ background: `linear-gradient(160deg, ${tint}, transparent)` }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            {TRANSCRIPT_LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.35 }}
                className="text-xs leading-snug text-[#777b86] italic"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-[#ececec] pt-2.5">
            <DemoStat label="frames" value={5} />
            <DemoStat label="sec transcript" value={41} />
            <DemoStat label="hooks found" value={3} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function DemoStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <NumberTicker value={value} className="text-sm font-medium text-[#17191c]" />
      <span className="text-[10px] text-[#a3a6af]">{label}</span>
    </div>
  );
}
