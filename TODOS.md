# TODOs — Pocket CMO toolkit

## Cleanup

- **Orphaned git worktree** at `.claude/worktrees/tool-dashboard/` — its `.git` file
  points at `/Users/eshaan/Main/Products/donna-cmo/.git/worktrees/tool-dashboard`,
  a path from before this repo moved under `pocket-cmo/`. It's dead. Before
  deleting, check whether anything uncommitted lives in that folder that's worth
  recovering first.

## Roadmap (already known, not started)

- **Carousel** tool — brandbook + topic → finished carousel slides. Marked
  "coming soon" everywhere already.
- **Competitor ads** tool — Meta Ads Library lookup. Same status.
- **Research OS** — a place to collect inspiration/competitors/research. Marked
  "planned" in the README table, no code yet.
- **Brand / ICP questionnaire** — guided setup that fills the shared brand
  profile other tools read from. "Planned," no code yet.

## Ideas worth considering later (not committed to)

- A one-command health check (`npm run doctor` or similar) that verifies
  yt-dlp/ffmpeg/python are actually on PATH before a user hits a confusing
  failure inside the reel analyzer — AGENT_SETUP.md already tells the *agent*
  to check this by hand; a script would make it self-serve for a human running
  the manual install path too.
- Once Carousel and Competitor ads ship, the README's "Run it with zero API
  keys" section and the dashboard's zero-key banner both need a pass — they
  currently only describe the five tools that exist today.
