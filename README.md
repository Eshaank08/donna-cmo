# Donna CMO

*Working name — subject to change before launch.*

An open-source marketing toolkit: the tools you actually need to do your own marketing, packaged so any coding agent can install them for you and run them on your own machine, with your own API keys.

> **Tools that help you do marketing. Not tools that do marketing for you.**
>
> Marketing can't be prompted. It has to be done.

## What this is

One local dashboard, several tools behind it:

| Tool | What it does | Status |
|---|---|---|
| Reel analyzer | Paste a reel link → transcript, hooks, structure, frames. | **Working** — also runs as an MCP server, see below. |
| Reddit radar | Finds people who have the problem your product solves, on Reddit. Outputs real posts with context — you message them yourself. | **Working** — needs your own Reddit API app; Reddit blocks unauthenticated access. |
| Idea gate | Binary yes/no filter for content ideas — ten gates, no partial credit. | **Working** — no setup, no API keys. |
| Carousel | Brandbook + topic → finished carousel slides. | Coming soon |
| Competitor ads | See what ads any competitor is running, via Meta's public Ads Library. | Coming soon |
| Research OS | A place to collect inspiration, competitors, and research. | Planned |
| Ideation board | Track post ideas, formats, and status. | Planned |
| Brand / ICP questionnaire | Guided questions that produce the brand profile the other tools read. | Planned |

A shared **brand profile** — name, ICP, voice, colors, positioning — ties them together. Fill it out once; every tool reads from it. Everything is stored locally in a SQLite file under `local/` (gitignored) — nothing here is a hosted service.

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

Then tell your agent: *"set this up and run it locally."* It'll install the Node and Python dependencies, walk you through adding your API keys, and start the app.

Or by hand:

```bash
npm install
pip install -r python/reel-analyzer/requirements.txt
pip install -r python/reddit-radar/requirements.txt
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add API keys under Settings — each tool tells you which ones it actually needs.

## MCP server

The reel analyzer also runs as an MCP server (`mcp/reel-analyzer`), registered in this repo's `.mcp.json` — any MCP-compatible agent (Claude Code, Claude Desktop, Cursor) picks it up automatically when you open this repo, no separate setup. It reads the same local keys vault and job history as the web app.

## License

MIT — see [`LICENSE`](./LICENSE).
