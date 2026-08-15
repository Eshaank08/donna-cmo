"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRightIcon,
  KeyRoundIcon,
  MegaphoneIcon,
  MonitorIcon,
  SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Safari } from "@/components/ui/safari";

const REPO_URL = "https://github.com/Eshaank08/donna-cmo";

const TOOLS = [
  {
    name: "Reel analyzer",
    description:
      "Paste a reel link, get the transcript, caption, engagement numbers, and every frame. Learn what actually made it work.",
    status: "Working",
  },
  {
    name: "Reddit radar",
    description:
      "Finds people on Reddit who have the problem your product solves. Outputs real posts with context — you message them yourself.",
    status: "Working",
  },
  {
    name: "Idea gate",
    description:
      "A binary yes/no filter for content ideas — ten gates, no partial credit. If an idea can't clear every gate, it doesn't get made.",
    status: "Working",
  },
  {
    name: "Carousel",
    description:
      "Brandbook + topic → finished carousel slides, ready to post.",
    status: "Coming soon",
  },
  {
    name: "Competitor ads",
    description:
      "See what ads any competitor is running — creative, copy, targeting, reach — via Meta's public Ads Library.",
    status: "Coming soon",
  },
];

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MegaphoneIcon className="size-4" />
            </div>
            <span className="text-base font-medium">Donna CMO</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="#tools" className="hover:text-foreground">
              Tools
            </Link>
            <Link href="#get-started" className="hover:text-foreground">
              Get started
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedThemeToggler
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              onThemeChange={setTheme}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            />
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
            <h1 className="font-heading text-4xl leading-[1.15] tracking-tight sm:text-6xl">
              Tools that help you do marketing.
              <br />
              <span className="italic">Not tools that do it for you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Marketing can&apos;t be prompted. It has to be done. An
              open-source toolkit that finds, analyses, and prepares — you
              always do the talking. Runs on your own machine, your own API
              keys, nothing hosted by us.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" />
                }
              >
                Clone on GitHub
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="#tools" />}
              >
                See the tools
              </Button>
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
          </div>
        </BlurFade>
      </section>

      {/* Editorial callout */}
      <BlurFade delay={0.05}>
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-2xl bg-callout px-8 py-12 text-callout-foreground sm:px-16">
            <p className="font-heading text-2xl leading-snug sm:text-3xl">
              Every AI marketing tool on the market promises to do the work
              for you, and produces slop. This is the opposite bet: the tool
              does the tedious, searchable, repeatable part. You do the part
              that needs judgement.
            </p>
          </div>
        </section>
      </BlurFade>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-6xl px-6 pb-24">
        <BlurFade delay={0.05}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl sm:text-4xl">The tools</h2>
            <p className="mt-3 text-muted-foreground">
              One shared brand profile ties them together — fill it out once,
              every tool reads from it.
            </p>
          </div>
        </BlurFade>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <BlurFade key={tool.name} delay={0.05 + i * 0.05}>
              <MagicCard className="rounded-2xl bg-card">
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{tool.name}</h3>
                    <Badge
                      variant={tool.status === "Working" ? "default" : "outline"}
                    >
                      {tool.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Get started */}
      <section id="get-started" className="mx-auto max-w-6xl px-6 pb-28">
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
            <div className="rounded-2xl bg-card p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                <SparklesIcon className="size-4" />
              </div>
              <h3 className="font-medium">Claude-built</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Clone the repo, open it in Claude Code (or any coding agent),
                and say &ldquo;set this up and run it locally.&rdquo; It
                installs everything and walks you through your API keys.
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={0.15}>
            <div className="rounded-2xl bg-card p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                <MonitorIcon className="size-4" />
              </div>
              <h3 className="font-medium">Self-built</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <code className="text-xs">npm install</code>,{" "}
                <code className="text-xs">pip install -r requirements.txt</code>{" "}
                in the tool folders that need it, then{" "}
                <code className="text-xs">npm run dev</code>. Full steps in
                the README.
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div className="rounded-2xl bg-card p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-background">
                <KeyRoundIcon className="size-4" />
              </div>
              <h3 className="font-medium">Self-hosted, always</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There is no hosted version. It runs on localhost, your keys
                live in a local SQLite file, and nothing here sends or posts
                without you.
              </p>
            </div>
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
