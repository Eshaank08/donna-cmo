# Agent setup instructions

You are setting up Pocket CMO for a human who just cloned this repo. Read
`README.md` first if you haven't — it has the tool list, what each key
unlocks, and the project's ground rules. This file is instructions for
you, the agent, not something to show the user verbatim.

Work through the steps below in order. Do not skip the verification step
at the end — "I ran the install commands" is not the same as "the app
works," and you should not tell the user it's done until you've confirmed
the second one.

## 1. Install

Run these from the repo root. Report each command's outcome before moving
to the next one — don't silently swallow a failure and continue.

```bash
node --version   # confirm 18+; if it's missing or older, stop and tell the user
npm install
pip install -r python/reel-analyzer/requirements.txt
pip install -r python/reddit-radar/requirements.txt
```

The reel analyzer also needs two system tools, not Python packages:

```bash
brew install yt-dlp ffmpeg
```

That's macOS-specific (this repo assumes macOS). If the user is on Linux,
install `yt-dlp` and `ffmpeg` via their package manager instead — don't
guess a command, ask or check what's available.

If any install step fails, fix the actual problem (wrong Python on PATH,
missing Homebrew, permissions) — don't paper over it by skipping the
dependency. A tool with a missing dependency should fail loudly later, not
silently now.

## 2. Ask the user which tools they actually care about

Do not walk the user through every possible API key. Most people want
one or two tools, not all of them. Before touching the key-gathering
tutorial:

1. Tell them plainly: **Idea gate and Ideation board work right now, zero
   setup.** If that's all they want, skip straight to step 4 (starting the
   app) — there's nothing else to configure.
2. Ask which of the remaining tools they want: reel analyzer transcripts,
   Reddit radar, Voice. Don't assume "all of them."
3. Only walk through the setup for the tools they name.

## 3. Walk them through getting keys — don't re-derive this from scratch

The full, accurate, step-by-step tutorial for every key already exists at
`/docs` inside the running app (source: `src/app/(app)/docs/page.tsx`).
Once the app is running (step 4), tell the user to open
`http://localhost:PORT/docs` and walk through the section for the tool(s)
they picked — or read that file yourself and relay the steps
conversationally, in order, one tool at a time. Do not invent your own
instructions for where GROQ_API_KEY, REDDIT_CLIENT_ID, ANTHROPIC_API_KEY,
etc. come from — that page is the source of truth, keep it that way.

Short version, in case you need it before the server is up:

- **Reel analyzer transcript** — optional `GROQ_API_KEY` from
  console.groq.com, free.
- **Reddit radar OAuth** — effectively required. Reddit blocks anonymous
  requests to its public JSON endpoints outright, so without a free
  Reddit "script" app (reddit.com/prefs/apps → `REDDIT_CLIENT_ID` +
  `REDDIT_CLIENT_SECRET`) a scan runs but returns nothing.
- **Voice** — needs exactly one of: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
  a logged-in Claude Code CLI (`claude login`), or a local Ollama server.
  Tried in that order. Ask which one the user already has before making
  them set up something new — if they're running you inside Claude Code
  and already logged in, that's likely free.

All keys are entered in the running app's Settings page
(`/settings`), never in a `.env` file, never on the command line, and
never typed to you in chat. If the user pastes a key into the
conversation, do not write it into any file yourself — tell them to paste
it into the Settings page in the browser instead.

## 4. Start the app and prove it's running

```bash
npm run dev
```

Then open the app in a browser for the user (default `http://localhost:3000`
— if that port's taken, Next.js will print the port it actually picked;
use that one). Before saying anything is done, verify the app actually
loaded: check the dev server's stdout for a ready message and confirm the
page returns real content (a fetch/curl of the root path returning HTML,
or opening it in a browser tool if you have one) — not just that the
process started without immediately crashing.

If you set up specific tools in step 3, verify those specifically: load
that tool's page and confirm it renders (e.g. `/tools/reel-analyzer`,
`/tools/voice`), not just the dashboard.

## What not to do

- **Never invent, guess, or auto-generate an API key.** Every key comes
  from the user creating it themselves on the provider's own site and
  pasting it into Settings. If a key is missing, say so and stop — don't
  fabricate a placeholder value.
- **Never commit `.env` or anything under `local/`.** Both are already
  gitignored (see `.gitignore`). Don't add `-f`, don't edit `.gitignore`
  to un-ignore them, don't work around the ignore some other way.
- **Never claim a tool works without having verified it yourself.** "It
  should work now" is not a status report. Load the page, or run the
  underlying script, and look at the actual output before telling the
  user it's ready.
- **Never send, post, or publish anything on the user's behalf.** Nothing
  in this toolkit does that by design — don't be the exception while
  setting it up (e.g. don't test Reddit radar by actually commenting).
- **Don't set up keys for tools the user didn't ask for.** See step 2.
