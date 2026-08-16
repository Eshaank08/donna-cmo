# Pocket CMO

*Renamed from "Donna CMO" 2026-08-16.*

An open-source marketing toolkit: the tools you actually need to do your own marketing, packaged so any coding agent can install them for you and run them on your own machine, with your own API keys.

> **Tools that help you do marketing. Not tools that do marketing for you.**
>
> Marketing can't be prompted. It has to be done.

## What this is

One local dashboard, several tools behind it:

| Tool | What it does | Status |
|---|---|---|
| Reel analyzer | Paste a reel link → transcript, hooks, structure, frames. | **Working** — no key needed for metadata, hooks, or frames; also runs as an MCP server, see below. |
| Reddit radar | Finds people who have the problem your product solves, on Reddit. Outputs real posts with context — you message them yourself. | **Working** — needs a free Reddit OAuth app; Reddit now blocks anonymous access to its public JSON endpoints outright. |
| Idea gate | Binary yes/no filter for content ideas — ten gates, no partial credit. | **Working** — no setup, no API keys. |
| Ideation board | Track post ideas, formats, and status. | **Working** — no setup, no API keys. |
| Voice | Paste writing samples → extracts your voice profile, rewrites drafts to match it. | **Working** — needs an Anthropic or OpenAI key, a logged-in Claude Code CLI, or [Ollama](https://ollama.com) running locally — the last two need no separate key. |
| Carousel | Brandbook + topic → finished carousel slides. | Coming soon |
| Competitor ads | See what ads any competitor is running, via Meta's public Ads Library. | Coming soon |
| Research OS | A place to collect inspiration, competitors, and research. | Planned |
| Brand / ICP questionnaire | Guided questions that produce the brand profile the other tools read. | Planned |

A shared **brand profile** — name, ICP, voice, colors, positioning — ties them together. Fill it out once; every tool reads from it. Everything is stored locally in a SQLite file under `local/` (gitignored) — nothing here is a hosted service.

## Run it with zero API keys

Every working tool above runs with no setup at all, or degrades gracefully instead of failing:

- **Idea gate** and **Ideation board** never need a key, period.
- **Reel analyzer** — paste a link and you get metadata, hooks, and frames with no key. Add a free `GROQ_API_KEY` (console.groq.com) only if you also want a transcript.
- **Reddit radar** — the public-JSON-endpoint path is still in the code, but Reddit currently 401/403s anonymous requests to it outright, so in practice this one needs a free Reddit "script" app (reddit.com/prefs/apps) for OAuth to return any results.
- **Voice** — needs an LLM, tried in this order: an Anthropic key, an OpenAI key, a logged-in Claude Code CLI (`claude login` — if you're using an agent to install this in the first place, you likely already have this), or [Ollama](https://ollama.com) running locally with any model pulled. The tool detects whichever's available automatically and never asks for a key unless none of the four are there.

The only two tools that need a paid/cloud dependency with no local fallback today are the Meta-Graph-API-based ones (own-account insights, competitor ads) — neither is required to use anything else here.

## Ground rules

1. **Nothing sends. Nothing posts. Nothing auto-publishes.** Every tool finds, analyses, or prepares. You always do the talking.
2. **Your own API keys.** Stored locally, on your machine. They never leave it.
3. **Free and open source.** MIT licensed, no paid tier.
4. **Agent-installable.** Point a coding agent (Claude Code, or any other) at this repo and it sets the whole thing up for you.

## Requirements

- Node.js 18+
- Python 3 + `pip` — the reel analyzer and Reddit radar shell out to Python scripts under `python/`
- For the reel analyzer specifically: [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) and `ffmpeg` as system tools (`brew install yt-dlp ffmpeg` on macOS)

## Install

Clone the repo and hand it to a coding agent:

```
git clone https://github.com/Eshaank08/donna-cmo.git
cd donna-cmo
```

Then tell your agent: *"set this up and run it locally."* It'll install the Node and Python dependencies, walk you through adding your API keys, and start the app — the exact steps it follows are in [`AGENT_SETUP.md`](./AGENT_SETUP.md).

Or by hand:

```bash
npm install
pip install -r python/reel-analyzer/requirements.txt
pip install -r python/reddit-radar/requirements.txt
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add API keys under Settings — each tool tells you which ones it actually needs.

## MCP server

The reel analyzer also runs as an MCP server (`mcp/reel-analyzer`), registered in this repo's `.mcp.json`. It reads the same local keys vault and job history as the web app — say "analyze this reel" in your agent's chat and it calls the exact same code the dashboard does.

Pickup differs by agent:
- **Claude Code** auto-discovers project-root `.mcp.json` on session start (it'll ask you to approve the server the first time).
- **Claude Desktop** does not auto-discover it — Desktop only reads its own global config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS), so you'd need to add this server there by hand.
- **Cursor** uses its own `.cursor/mcp.json`, not this file — same manual step.

## License

MIT — see [`LICENSE`](./LICENSE).
