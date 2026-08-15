# Donna CMO

*Working name — subject to change before launch.*

An open-source marketing toolkit: the tools you actually need to do your own marketing, packaged so any coding agent can install them for you and run them on your own machine, with your own API keys.

> **Tools that help you do marketing. Not tools that do marketing for you.**
>
> Marketing can't be prompted. It has to be done.

## What this is

Six small tools behind one shared app:

| Tool | What it does | Status |
|---|---|---|
| Reel analyzer | Paste a reel link → transcript, hooks, structure, frames. | In progress |
| Reddit radar | Scrapes subreddits to find people who have the problem your product solves. Outputs real posts with context — you message them yourself. | In progress |
| Carousel tool | Brandbook + topic → finished carousel slides, ready to post. | In progress |
| Research OS | A place to collect inspiration, competitors, and research. | Planned |
| Ideation board | Track post ideas, formats, and status. | Planned |
| Brand / ICP questionnaire | Guided questions that produce the brand profile the other tools read. | Planned |

A shared **brand profile** — name, ICP, voice, colors, positioning — ties them together. Fill it out once; every tool reads from it.

## Ground rules

1. **Nothing sends. Nothing posts. Nothing auto-publishes.** Every tool finds, analyses, or prepares. You always do the talking.
2. **Your own API keys.** Stored locally, on your machine. They never leave it.
3. **Free and open source.** MIT licensed, no paid tier.
4. **Agent-installable.** Point a coding agent (Claude Code, or any other) at this repo and it sets the whole thing up for you.

## Install

Clone the repo and hand it to a coding agent:

```
git clone https://github.com/Eshaank08/donna-cmo.git
cd donna-cmo
```

Then tell your agent: *"set this up and run it locally."* It'll install dependencies, walk you through adding your API keys, and start the app.

Or by hand:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Full spec

See [`PROJECT.md`](./PROJECT.md) for the complete architecture, tool contract, and build order.

## License

MIT — see [`LICENSE`](./LICENSE).
