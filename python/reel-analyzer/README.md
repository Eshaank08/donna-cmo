# Reel analyzer

Paste a reel link, get its transcript, caption, engagement numbers, and extracted frames — so you can see what actually made it work.

The app's Settings page runs this for you. To use it standalone:

```bash
pip install -r requirements.txt
# also needs, as system tools: yt-dlp, ffmpeg
python3 analyze_reel.py <reel_url> --output-dir=./out
```

## What needs which key

- **Nothing** for the core flow (download, frames, caption, engagement numbers) — it reads whatever's public on the post.
- **`GROQ_API_KEY`** — optional, adds an audio transcript. Skipped silently if not set.
- **`META_ACCESS_TOKEN`, `META_BUSINESS_ID`, `IG_BUSINESS_ACCOUNT_ID`** — only needed for `fetch_insights.py` / `top_reels.py` / `discover_ig_account.py`, which pull performance data from *your own* connected Instagram business account. Not required to analyze a public reel link.

## Files

- `analyze_reel.py` — the main flow: URL in, transcript + frames + summary.md out.
- `transcribe_groq.py`, `extract_frames.py` — steps `analyze_reel.py` calls.
- `download_public_reel.py` — just the download step, no analysis.
- `fetch_insights.py`, `top_reels.py` — read insights from your own connected IG business account.
- `discover_ig_account.py` — one-time helper to find your IG business account ID from a Meta access token.
