# Reddit radar

Scrapes subreddits and searches to find posts from people who have the problem your product solves. Outputs real posts with context. **You go message them yourself** — this never posts or comments on your behalf.

The app's Reddit radar page runs this for you, using the config you fill in there (subreddits, search terms, keyword weights — all driven by your brand profile / ICP). To use it standalone:

```bash
pip install -r requirements.txt
cp config.example.json config.json   # then fill in your own subreddits/keywords
python3 find_opportunities.py --config config.json --json
```

## About Reddit API access

**You need your own Reddit API app.** The code has a fallback path that reads Reddit's public JSON endpoints without credentials, but as of this writing Reddit returns a hard 403 on those — confirmed from both a cloud sandbox and a plain residential connection. This isn't a rate limit, it's a block. Treat `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` as required, not optional, until that changes.

To get them: as of November 2025, Reddit's "Responsible Builder Policy" ended self-service app creation at reddit.com/prefs/apps — new API app requests now require manual approval from Reddit and, by Reddit's own description, most are denied. **This is your own Reddit app, on your own account** — nothing shared, nothing we control, and we can't get it approved for you.

## Files

- `find_opportunities.py` — the scan logic: fetch, score against your config, produce drafts.
- `scan_cli.py` — thin JSON-out wrapper the app and MCP server call. For direct/manual use, call `find_opportunities.py` instead.
- `config.example.json` — template. The app manages your actual live config separately; for standalone CLI use, copy this to `config.json` and edit it.
