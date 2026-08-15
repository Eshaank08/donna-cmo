# Reel analyzer — MCP server

Exposes the reel analyzer as an MCP tool (`analyze_reel`) so any MCP-compatible agent — Claude Code, Claude Desktop, Cursor — can call it directly, not just through the web app.

It's already wired up: this repo's `.mcp.json` registers it, so cloning the repo and opening it in an MCP-aware agent picks it up automatically.

Reads keys and writes jobs/output through the same `local/db.sqlite` and `local/output/` the web app uses — configure API keys once in the app's Settings page, and both surfaces see them.

Run it standalone to test:

```bash
npx tsx mcp/reel-analyzer/index.ts
```
