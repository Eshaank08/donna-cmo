"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  ClapperboardIcon,
  KanbanIcon,
  KeyRoundIcon,
  MegaphoneIcon,
  Mic2Icon,
  MonitorIcon,
  RadarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ReelAnalyzerDemo } from "@/components/ui/reel-analyzer-demo";
import { RedditRadarDemo } from "@/components/ui/reddit-radar-demo";
import { Safari } from "@/components/ui/safari";
import { StatCard } from "@/components/ui/stat-card";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";

const NAV_LINKS = [
  { label: "Tools", href: "#tools" },
  { label: "Why", href: "#why" },
  { label: "Get started", href: "#get-started" },
  { label: "FAQ", href: "#faq" },
] as const;

const REPO_URL = "https://github.com/Eshaank08/donna-cmo";

const FEATURES = [
  {
    name: "Reel analyzer",
    tagline: "Learn from what's already working.",
    body: "You always look at how other people do it. The reel analyzer lets you understand the story, the hooks, and the concept behind every reel, so you can write the best scripts yourself, without copying anyone.",
    icon: ClapperboardIcon,
    tint: "peach",
  },
  {
    name: "Reddit radar",
    tagline: "Find the people already asking for you.",
    body: "Right now, somewhere, someone is describing the exact problem your product solves, in their own words. Reddit radar finds those posts for you, so you know exactly who to talk to and what to say when you do.",
    icon: RadarIcon,
    tint: "sky",
  },
  {
    name: "Idea gate",
    tagline: "Only make the ideas worth making.",
    body: "Not every idea deserves a script. Idea gate walks every idea through ten honest questions before you film a single second, so the only things you make are the ones only you could have made.",
    icon: ShieldCheckIcon,
    tint: "sage",
  },
  {
    name: "Ideation board",
    tagline: "Watch every idea move from spark to posted.",
    body: "A simple kanban for content: idea, scripting, ready to shoot, posted. A yes from idea gate can drop straight onto the board, so nothing good gets lost in a notes app.",
    icon: KanbanIcon,
    tint: "butter",
  },
  {
    name: "Voice",
    tagline: "Sound like you, not like an AI wrote it.",
    body: "Paste a few things you've actually written. It learns the patterns, the phrases, the rhythm, then rewrites generic drafts to match, so what you post still sounds like you.",
    icon: Mic2Icon,
    tint: "lavender",
  },
] as const;

const TINTS = {
  peach: "bg-[#fbe1d1] text-[#5d2a1a] dark:bg-[#3d2a1f] dark:text-[#f3d9c4]",
  sky: "bg-[#dbe6f0] text-[#1f425c] dark:bg-[#1c2a35] dark:text-[#bcd8ec]",
  sage: "bg-[#dfe9d8] text-[#31481f] dark:bg-[#24301e] dark:text-[#c9dcb8]",
  butter: "bg-[#f5e9c8] text-[#5c4a1a] dark:bg-[#3a3018] dark:text-[#f0dfa8]",
  lavender: "bg-[#e6dff0] text-[#3f2e5c] dark:bg-[#28203a] dark:text-[#d6c8ec]",
} as const;

const COMING_SOON = [
  {
    name: "Carousel",
    description: "Brandbook and topic in, finished carousel slides out, ready to post.",
  },
  {
    name: "Competitor ads",
    description: "See what ads any competitor is running: creative, copy, targeting, reach.",
  },
];

const GATE_ITEMS = [
  "Relevant right now",
  "Not overplayed",
  "You have a say",
  "Only you could write it",
];

const NOT_THIS = [
  "Writes the post for you",
  "Same voice as every other AI-written post",
  "You never see the actual research",
  "Your data lives on someone else's server",
];

const THIS_INSTEAD = [
  "Finds the research, drafts the direction",
  "You write the words, in your own voice",
  "Every source is one click away",
  "Runs on your machine, nothing locked in",
];

const FAQ = [
  {
    q: "Does anything here see my data?",
    a: "No. It runs on localhost, your keys live in a local SQLite file, and nothing is sent anywhere by default.",
  },
  {
    q: "What if a tool needs an API key I don't have?",
    a: "Every tool tells you exactly which key it needs and why, right on its page. Idea gate needs none at all.",
  },
  {
    q: "Can I add my own tool?",
    a: "Yes. Each tool is a folder: a manifest, a run function, a UI panel. Drop one in and nothing else changes.",
  },
  {
    q: "Is this actually free?",
    a: "MIT licensed, no paid tier, forever. It costs nothing to run except whatever API usage you bring yourself.",
  },
];

function GateVisual() {
  return (
    <div className="mx-auto flex max-w-xs flex-col gap-2">
      {GATE_ITEMS.map((item, i) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: i * 0.15 }}
          className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.15 + 0.2, type: "spring", stiffness: 300 }}
            className={`flex size-5 shrink-0 items-center justify-center rounded-full ${TINTS.sage}`}
          >
            <CheckIcon className="size-3" />
          </motion.span>
          {item}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: GATE_ITEMS.length * 0.15 + 0.1, type: "spring", stiffness: 260, damping: 18 }}
        className="mt-1 self-center"
      >
        <Badge className="bg-[#17191c] px-4 py-1 text-sm text-white">YES</Badge>
      </motion.div>
    </div>
  );
}

const BOARD_COLUMNS = ["Idea", "Scripting", "Posted"];

function BoardVisual() {
  return (
    <div className="mx-auto flex max-w-sm justify-center gap-3">
      {BOARD_COLUMNS.map((col, i) => (
        <div key={col} className="flex w-24 flex-col gap-2">
          <span className="text-center text-xs text-muted-foreground">{col}</span>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.25, type: "spring", stiffness: 220, damping: 22 }}
            className={`h-14 rounded-lg ${i === 1 ? TINTS.butter : "bg-card"}`}
          />
        </div>
      ))}
    </div>
  );
}

function VoiceVisual() {
  return (
    <div className="mx-auto flex max-w-sm items-center justify-center gap-3">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="flex-1 rounded-xl bg-card p-4 text-xs text-muted-foreground"
      >
        &ldquo;We are excited to announce our new feature.&rdquo;
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260 }}
      >
        <ArrowRightIcon className="size-4 text-muted-foreground" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.35 }}
        className={`flex-1 rounded-xl p-4 text-xs ${TINTS.lavender}`}
      >
        &ldquo;Okay, this one&apos;s actually good, we shipped it.&rdquo;
      </motion.div>
    </div>
  );
}

const VISUALS = {
  "Reel analyzer": ReelAnalyzerDemo,
  "Reddit radar": RedditRadarDemo,
  "Idea gate": GateVisual,
  "Ideation board": BoardVisual,
  Voice: VoiceVisual,
} as const;

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-2 justify-self-start">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MegaphoneIcon className="size-4" />
            </div>
            <span className="text-base font-medium">Donna CMO</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-self-end">
            <AnimatedThemeToggler
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              onThemeChange={setTheme}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              GitHub
            </a>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" />
              }
            >
              Clone the repo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
          style={{
            background:
              "radial-gradient(700px 340px at 20% 0%, var(--callout) 0%, transparent 60%), radial-gradient(600px 300px at 85% 10%, var(--callout) 0%, transparent 55%)",
          }}
        />
        <BlurFade duration={0.6}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl leading-[1.15] tracking-[-0.02em] sm:text-6xl">
              Tools that help you do marketing.
              <br />
              <span className="italic">Not tools that do it for you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
              Marketing can&apos;t be prompted. It has to be done. An
              open-source toolkit that finds, analyses, and prepares. You
              always do the talking. Runs on your own machine, your own API
              keys, nothing hosted by us.
            </p>
            <div className="mt-8 flex items-center justify-center gap-5">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" />
                }
              >
                Clone on GitHub
              </Button>
              <Link
                href="#tools"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                See the tools
              </Link>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.15} duration={0.6}>
          <div className="relative mx-auto mt-16 max-w-4xl">
            <Safari
              url="localhost:3000/dashboard"
              imageSrc="/hero-dashboard.png"
              className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
            />

            <div
              className="absolute -left-4 -top-6 hidden w-48 rounded-[20px] bg-white p-4 text-[#17191c] sm:block"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <span className="text-xs text-[#777b86]">Reddit radar</span>
              <div className="mt-1 flex items-baseline gap-1">
                <NumberTicker
                  value={38}
                  className="text-2xl font-medium text-[#17191c]"
                />
                <span className="text-xs text-[#777b86]">posts found</span>
              </div>
              <div className="mt-2 flex gap-1">
                <span className="rounded-full border border-[#ececec] px-2 py-0.5 text-[10px] text-[#777b86]">
                  r/SaaS
                </span>
                <span className="rounded-full border border-[#ececec] px-2 py-0.5 text-[10px] text-[#777b86]">
                  r/startups
                </span>
              </div>
            </div>

            <div
              className="absolute -right-4 -top-6 hidden w-52 rounded-[20px] bg-white p-4 text-[#17191c] sm:block"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <span className="text-xs text-[#777b86]">Reel analyzer</span>
              <div className="mt-1 flex items-baseline gap-1">
                <NumberTicker
                  value={19365417}
                  className="text-2xl font-medium text-[#17191c]"
                />
                <span className="text-xs text-[#777b86]">likes</span>
              </div>
            </div>

            <div
              className="absolute -left-6 -bottom-8 hidden w-56 rounded-[20px] bg-white p-4 text-[#17191c] sm:block"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-[#17191c] text-white">YES</Badge>
                <span className="text-xs text-[#777b86]">Idea gate</span>
              </div>
              <p className="text-sm leading-snug">
                &ldquo;Show the exact 403 I hit building Reddit radar.&rdquo;
              </p>
            </div>

            <div
              className="absolute -bottom-10 left-1/2 hidden w-64 -translate-x-1/2 rounded-2xl bg-white px-4 py-3 sm:block"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm text-[#a3a6af]">
                  Ask anything...
                </span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#17191c] text-white">
                  <ArrowUpIcon className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Honest stats, no fake traction */}
      <BlurFade delay={0.05}>
        <section className="bg-muted px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <Tag className="mb-6 block text-center uppercase tracking-wide">
              The toolkit, honestly
            </Tag>
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Tools working today" value={5} />
              <StatCard label="Gates in the idea filter" value={10} />
              <StatCard label="Keys idea gate needs" value={0} />
              <StatCard label="Cost to run this" value={0} suffix="USD" />
            </div>
          </div>
        </section>
      </BlurFade>

      {/* Quote, no box, just the palette - deliberate call, not the reference's filled card */}
      <BlurFade delay={0.05}>
        <section className="mx-auto max-w-4xl px-6 py-20">
          <blockquote className="border-l-4 border-[#fbe1d1] pl-6 sm:pl-8">
            <p className="font-heading text-2xl leading-snug italic text-[#5d2a1a] dark:text-[#f3d9c4] sm:text-3xl">
              &ldquo;Every AI marketing tool on the market promises to do the
              work for you, and produces slop. This is the opposite bet: the
              tool does the tedious, searchable, repeatable part. You do the
              part that needs judgement.&rdquo;
            </p>
          </blockquote>
        </section>
      </BlurFade>

      {/* Features, one by one */}
      <section id="tools" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <BlurFade delay={0.05}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl sm:text-4xl">
                How each tool actually helps
              </h2>
              <p className="mt-3 text-muted-foreground">
                One shared brand profile ties them together. Fill it out once
                and every tool reads from it.
              </p>
            </div>
          </BlurFade>

          <div className="mt-16 flex flex-col gap-24">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const Visual = VISUALS[feature.name];
              const reversed = i % 2 === 1;
              return (
                <BlurFade key={feature.name} delay={0.1}>
                  <div
                    className={`grid items-center gap-10 sm:grid-cols-2 ${
                      reversed ? "sm:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div>
                      <div
                        className={`mb-4 flex size-11 items-center justify-center rounded-full ${TINTS[feature.tint]}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline" className="mb-3 bg-card">
                        {feature.name}
                      </Badge>
                      <h3 className="font-heading text-2xl leading-snug sm:text-3xl">
                        {feature.tagline}
                      </h3>
                      <p className="mt-4 text-muted-foreground">{feature.body}</p>
                    </div>
                    <div className="rounded-3xl bg-card p-8">
                      <Visual />
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>

          <BlurFade delay={0.1}>
            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              {COMING_SOON.map((tool) => (
                <div key={tool.name} className="rounded-2xl bg-card p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-medium">{tool.name}</h3>
                    <Badge variant="outline">Coming soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Why this, not another AI marketing tool */}
      <section id="why" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <BlurFade delay={0.05}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl sm:text-4xl">
                Why not just use an AI marketing tool
              </h2>
              <p className="mt-3 text-muted-foreground">
                Because most of them are solving a different problem than
                you actually have.
              </p>
            </div>
          </BlurFade>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <BlurFade delay={0.1}>
              <div className="h-full rounded-2xl bg-card p-8">
                <Tag className="mb-4 block">Most AI marketing tools</Tag>
                <ul className="flex flex-col gap-3">
                  {NOT_THIS.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm">
                      <XIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
            <BlurFade delay={0.15}>
              <div className="h-full rounded-2xl bg-card p-8">
                <Tag className="mb-4 block text-[#5d2a1a] dark:text-[#f3d9c4]">
                  This toolkit
                </Tag>
                <ul className="flex flex-col gap-3">
                  {THIS_INSTEAD.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#5d2a1a] dark:text-[#f3d9c4]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Get started */}
      <section id="get-started" className="bg-muted px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <BlurFade delay={0.05}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl sm:text-4xl">
                Three ways to run it
              </h2>
              <p className="mt-3 text-muted-foreground">
                Always self-hosted. Always your own keys. We never see your
                data, because it never leaves your machine.
              </p>
            </div>
          </BlurFade>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <BlurFade delay={0.1}>
              <MagicCard className="h-full rounded-2xl bg-card">
                <div className="p-6">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                    <SparklesIcon className="size-4" />
                  </div>
                  <h3 className="font-medium">Claude-built</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Clone the repo, open it in Claude Code (or any coding
                    agent), and say &ldquo;set this up and run it
                    locally.&rdquo; It installs everything and walks you
                    through your API keys.
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
            <BlurFade delay={0.15}>
              <MagicCard className="h-full rounded-2xl bg-card">
                <div className="p-6">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                    <MonitorIcon className="size-4" />
                  </div>
                  <h3 className="font-medium">Self-built</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <code className="text-xs">npm install</code>,{" "}
                    <code className="text-xs">
                      pip install -r requirements.txt
                    </code>{" "}
                    in the tool folders that need it, then{" "}
                    <code className="text-xs">npm run dev</code>. Full steps
                    in the README.
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
            <BlurFade delay={0.2}>
              <MagicCard className="h-full rounded-2xl bg-card">
                <div className="p-6">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                    <KeyRoundIcon className="size-4" />
                  </div>
                  <h3 className="font-medium">Self-hosted, always</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There is no hosted version. It runs on localhost, your
                    keys live in a local SQLite file, and nothing here sends
                    or posts without you.
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" />
              }
            >
              Clone on GitHub
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <BlurFade delay={0.05}>
            <h2 className="font-heading text-center text-3xl sm:text-4xl">
              Questions people actually ask
            </h2>
          </BlurFade>
          <div className="mt-12 flex flex-col gap-6">
            {FAQ.map((item, i) => (
              <BlurFade key={item.q} delay={0.05 + i * 0.05}>
                <div className="rounded-2xl bg-card p-6">
                  <h3 className="font-medium">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
          <BlurFade delay={0.3}>
            <div className="mt-8 text-center">
              <TextLink
                href={`${REPO_URL}#readme`}
                target="_blank"
                rel="noopener noreferrer"
                className="justify-center text-muted-foreground"
              >
                Everything else is in the README
              </TextLink>
            </div>
          </BlurFade>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>MIT licensed. Free, forever.</span>
          <div className="flex items-center gap-6">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={`${REPO_URL}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
