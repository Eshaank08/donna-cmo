#!/usr/bin/env python3
"""
Reddit radar (standalone, read-only).

Finds Reddit posts where people have the problem your product solves,
based on subreddits/keywords you configure from your brand profile.
You comment manually. Does NOT post.

Usage:
  python3 find_opportunities.py
  python3 find_opportunities.py --hours 24 --out /tmp/reddit.md
  python3 find_opportunities.py --json

Auth: effectively required. Reddit blocks unauthenticated requests to its
public JSON endpoints (confirmed from both a cloud sandbox and a residential
connection - not just a rate limit, a hard 403). The public-JSON code path
below is kept for when/if that changes, but don't expect it to work today.
  export REDDIT_CLIENT_ID=...
  export REDDIT_CLIENT_SECRET=...
"""

from __future__ import annotations

import argparse
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.example.json"
SEEN_PATH = ROOT / "data" / "seen.json"
DEFAULT_OUT = ROOT / "data" / "latest.md"


def _ssl_context() -> ssl.SSLContext:
    """macOS python.org builds often lack CA bundle; prefer certifi."""
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


_SSL = _ssl_context()


def _urlopen(req: urllib.request.Request, timeout: float = 30):
    return urllib.request.urlopen(req, timeout=timeout, context=_SSL)


@dataclass
class Post:
    id: str
    subreddit: str
    title: str
    selftext: str
    author: str
    url: str
    permalink: str
    created_utc: float
    score: int
    num_comments: int
    flair: str | None
    relevance: float = 0.0
    matched: list[str] = field(default_factory=list)
    angle: str = ""
    why: str = ""

    @property
    def age_hours(self) -> float:
        now = datetime.now(timezone.utc).timestamp()
        return max(0.0, (now - self.created_utc) / 3600.0)

    @property
    def reddit_url(self) -> str:
        return f"https://www.reddit.com{self.permalink}"


def load_config(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def load_seen(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"ids": {}}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def save_seen(path: Path, seen: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # prune ids older than 30 days
    cutoff = datetime.now(timezone.utc).timestamp() - 30 * 86400
    seen["ids"] = {
        k: v for k, v in seen.get("ids", {}).items() if float(v) >= cutoff
    }
    with path.open("w", encoding="utf-8") as f:
        json.dump(seen, f, indent=2)


def oauth_token(client_id: str, client_secret: str, user_agent: str) -> str | None:
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://www.reddit.com/api/v1/access_token",
        data=data,
        method="POST",
        headers={
            "User-Agent": user_agent,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    credentials = f"{client_id}:{client_secret}"
    import base64

    req.add_header(
        "Authorization",
        "Basic " + base64.b64encode(credentials.encode()).decode(),
    )
    try:
        with _urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
            return payload.get("access_token")
    except urllib.error.HTTPError as e:
        print(f"oauth failed: {e.code} {e.read()[:200]!r}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"oauth failed: {e}", file=sys.stderr)
        return None


def http_get_json(
    url: str,
    user_agent: str,
    token: str | None = None,
    pause: float = 1.0,
) -> dict[str, Any] | None:
    headers = {"User-Agent": user_agent}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        # oauth host
        url = url.replace("https://www.reddit.com", "https://oauth.reddit.com")
        if url.endswith(".json"):
            url = url[:-5]

    req = urllib.request.Request(url, headers=headers)
    try:
        with _urlopen(req, timeout=30) as resp:
            body = resp.read().decode()
            time.sleep(pause)
            return json.loads(body)
    except urllib.error.HTTPError as e:
        err_body = e.read()[:300]
        print(f"GET {url} -> {e.code}: {err_body!r}", file=sys.stderr)
        time.sleep(pause * 2)
        return None
    except Exception as e:
        print(f"GET {url} failed: {e}", file=sys.stderr)
        time.sleep(pause)
        return None


def listing_to_posts(payload: dict[str, Any] | None) -> list[Post]:
    if not payload:
        return []
    children = payload.get("data", {}).get("children", [])
    out: list[Post] = []
    for child in children:
        if child.get("kind") != "t3":
            continue
        d = child.get("data", {})
        out.append(
            Post(
                id=d.get("id") or "",
                subreddit=d.get("subreddit") or "",
                title=(d.get("title") or "").strip(),
                selftext=(d.get("selftext") or "").strip(),
                author=d.get("author") or "[deleted]",
                url=d.get("url") or "",
                permalink=d.get("permalink") or "",
                created_utc=float(d.get("created_utc") or 0),
                score=int(d.get("score") or 0),
                num_comments=int(d.get("num_comments") or 0),
                flair=d.get("link_flair_text"),
            )
        )
    return out


def fetch_subreddit_new(
    sub: str,
    limit: int,
    user_agent: str,
    token: str | None,
    pause: float,
) -> list[Post]:
    q = urllib.parse.urlencode({"limit": str(limit), "raw_json": "1"})
    url = f"https://www.reddit.com/r/{sub}/new.json?{q}"
    return listing_to_posts(http_get_json(url, user_agent, token, pause))


def fetch_search(
    query: str,
    limit: int,
    user_agent: str,
    token: str | None,
    pause: float,
    subreddit: str | None = None,
) -> list[Post]:
    params: dict[str, str] = {
        "q": query,
        "sort": "new",
        "t": "day",
        "limit": str(limit),
        "raw_json": "1",
        "type": "link",
    }
    if subreddit:
        params["restrict_sr"] = "1"
        base = f"https://www.reddit.com/r/{subreddit}/search.json"
    else:
        base = "https://www.reddit.com/search.json"
    url = f"{base}?{urllib.parse.urlencode(params)}"
    return listing_to_posts(http_get_json(url, user_agent, token, pause))


def normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower()).strip()


def score_post(post: Post, cfg: dict[str, Any]) -> Post:
    text = normalize_text(f"{post.title}\n{post.selftext}")
    weights: dict[str, int] = cfg.get("keyword_weights", {})
    negatives: list[str] = cfg.get("negative_keywords", [])
    angles: dict[str, str] = cfg.get("comment_angles", {})
    anchors: list[str] = [a.lower() for a in cfg.get("context_anchors", [])]
    known_subs = {s.lower() for s in cfg.get("subreddits", [])}

    for bad in negatives:
        if bad.lower() in text:
            post.relevance = -999
            post.why = f"filtered: {bad}"
            return post

    # Must match the configured context (product/niche) unless already in a known target sub
    in_known = post.subreddit.lower() in known_subs
    has_anchor = any(a in text for a in anchors) if anchors else True
    # user-profile / random sub posts from global search need anchors
    if not in_known and not has_anchor:
        post.relevance = -999
        post.why = "filtered: no context anchor matched"
        return post
    if post.subreddit.lower().startswith("u_"):
        post.relevance = -999
        post.why = "filtered: user profile post"
        return post

    total = 0.0
    matched: list[str] = []
    for kw, w in weights.items():
        if kw.lower() in text:
            total += float(w)
            matched.append(kw)

    if not matched and not in_known:
        post.relevance = -999
        post.why = "filtered: no topic keywords"
        return post

    # engagement / freshness soft boosts
    if post.num_comments == 0 and post.age_hours < 12:
        total += 1.5  # unanswered and fresh = good to help
    if post.num_comments and post.num_comments < 5:
        total += 0.5
    if post.age_hours < 6:
        total += 1.0
    elif post.age_hours < 24:
        total += 0.5

    # question shape
    if "?" in post.title or text.startswith(("how ", "what ", "where ", "help")):
        total += 1.0

    # boost known target subs
    if in_known:
        total += 1.5

    post.relevance = total
    post.matched = matched

    # pick angle: first configured angle key whose name appears in the matched
    # keywords or post text, falling back to "general"
    angle_key = "general"
    for key in angles:
        if key == "general":
            continue
        if key in matched or key in text:
            angle_key = key
            break
    post.angle = angles.get(angle_key, angles.get("general", ""))
    post.why = (
        f"keywords=[{', '.join(matched[:8])}] age={post.age_hours:.1f}h "
        f"comments={post.num_comments} up={post.score}"
    )
    return post


def draft_comment_stub(post: Post, cfg: dict[str, Any]) -> str:
    """Short skeleton — rewrite in your voice before posting."""
    intro = cfg.get("intro_line") or ""
    mid = post.angle or "worth a real answer, not a generic one."
    body = (intro + " " + mid).strip() if intro else mid
    if cfg.get("include_link_in_draft") and cfg.get("optional_link"):
        body += f" More detail here if useful: {cfg['optional_link']}"
    return body


def render_markdown(posts: list[Post], cfg: dict[str, Any], generated_at: str) -> str:
    lines = [
        f"# Reddit radar — {generated_at}",
        "",
        f"Found **{len(posts)}** posts matching your configured subreddits/keywords "
        f"(min score {cfg['min_score']}, lookback {cfg['lookback_hours']}h).",
        "",
        "Open the URL → help with their actual problem → optional one soft link. "
        "Edit the draft. Never paste the same comment twice.",
        "",
        "---",
        "",
    ]
    for i, p in enumerate(posts, 1):
        lines.extend(
            [
                f"## {i}. [{p.subreddit}] {p.title}",
                "",
                f"- **URL:** {p.reddit_url}",
                f"- **Relevance:** {p.relevance:.1f} — {p.why}",
                f"- **Author:** u/{p.author} · {p.age_hours:.1f}h ago · "
                f"{p.num_comments} comments · {p.score} upvotes",
                f"- **Angle:** {p.angle}",
                "",
                "### Post excerpt",
                "",
                "```",
                (p.selftext[:700] + ("…" if len(p.selftext) > 700 else ""))
                or "(link/image post — open URL)",
                "```",
                "",
                "### Draft (edit heavily)",
                "",
                draft_comment_stub(p, cfg),
                "",
                "---",
                "",
            ]
        )
    if not posts:
        lines.append("_No posts cleared the bar. Widen keywords or lookback._")
        lines.append("")
    return "\n".join(lines)


def collect(cfg: dict[str, Any], token: str | None) -> list[Post]:
    ua = cfg["user_agent"]
    pause = float(cfg.get("request_pause_sec", 1.2))
    limit = int(cfg.get("per_sub_limit", 40))
    by_id: dict[str, Post] = {}

    for sub in cfg.get("subreddits", []):
        print(f"fetch r/{sub}/new …", file=sys.stderr)
        for p in fetch_subreddit_new(sub, limit, ua, token, pause):
            if p.id:
                by_id[p.id] = p

    for q in cfg.get("search_queries", []):
        print(f"search: {q!r} …", file=sys.stderr)
        for p in fetch_search(q, 40, ua, token, pause):
            if p.id:
                by_id.setdefault(p.id, p)

    return list(by_id.values())


def main() -> int:
    parser = argparse.ArgumentParser(description="Reddit radar (standalone)")
    parser.add_argument("--config", type=Path, default=CONFIG_PATH)
    parser.add_argument("--hours", type=float, default=None, help="override lookback hours")
    parser.add_argument("--min-score", type=float, default=None)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--json", action="store_true", help="also write JSON next to md")
    parser.add_argument("--no-seen", action="store_true", help="do not filter/update seen ids")
    parser.add_argument("--dry-config", action="store_true", help="print config and exit")
    args = parser.parse_args()

    cfg = load_config(args.config)
    if args.hours is not None:
        cfg["lookback_hours"] = args.hours
    if args.min_score is not None:
        cfg["min_score"] = args.min_score

    if args.dry_config:
        print(json.dumps(cfg, indent=2))
        return 0

    client_id = os.environ.get("REDDIT_CLIENT_ID", "").strip()
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET", "").strip()
    token = None
    if client_id and client_secret:
        print("requesting oauth token…", file=sys.stderr)
        token = oauth_token(client_id, client_secret, cfg["user_agent"])
        if token:
            print("oauth ok", file=sys.stderr)
        else:
            print("oauth failed — falling back to public JSON", file=sys.stderr)

    raw = collect(cfg, token)
    lookback = float(cfg["lookback_hours"])
    min_score = float(cfg["min_score"])
    max_results = int(cfg.get("max_results", 25))

    seen = load_seen(SEEN_PATH) if not args.no_seen else {"ids": {}}
    seen_ids = set(seen.get("ids", {}))

    scored: list[Post] = []
    for p in raw:
        if not p.id or not p.title:
            continue
        if p.age_hours > lookback:
            continue
        if p.id in seen_ids:
            continue
        score_post(p, cfg)
        if p.relevance >= min_score:
            scored.append(p)

    scored.sort(key=lambda x: (-x.relevance, x.age_hours))
    scored = scored[:max_results]

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    md = render_markdown(scored, cfg, generated_at)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(md, encoding="utf-8")
    print(f"wrote {args.out} ({len(scored)} posts)", file=sys.stderr)

    if args.json:
        jpath = args.out.with_suffix(".json")
        payload = {
            "generated_at": generated_at,
            "count": len(scored),
            "posts": [asdict(p) for p in scored],
        }
        jpath.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"wrote {jpath}", file=sys.stderr)

    if not args.no_seen:
        now = datetime.now(timezone.utc).timestamp()
        for p in scored:
            seen.setdefault("ids", {})[p.id] = now
        # also mark low-signal visited ids from this run? skip — only mark surfaced
        save_seen(SEEN_PATH, seen)

    # stdout = digest for cron delivery
    sys.stdout.write(md)
    if not md.endswith("\n"):
        sys.stdout.write("\n")
    return 0


def resolve_credentials(
    client_id: str | None = None,
    client_secret: str | None = None,
) -> tuple[str, str]:
    """Env wins, then explicit args, then data/secrets.json (standalone CLI use)."""
    cid = (client_id or os.environ.get("REDDIT_CLIENT_ID") or "").strip()
    csec = (client_secret or os.environ.get("REDDIT_CLIENT_SECRET") or "").strip()
    secrets_path = ROOT / "data" / "secrets.json"
    if (not cid or not csec) and secrets_path.exists():
        try:
            raw = json.loads(secrets_path.read_text(encoding="utf-8"))
            cid = cid or str(raw.get("client_id") or "").strip()
            csec = csec or str(raw.get("client_secret") or "").strip()
        except Exception:
            pass
    return cid, csec


def run_scan(
    *,
    config_path: Path = CONFIG_PATH,
    seen_path: Path = SEEN_PATH,
    hours: float | None = None,
    min_score: float | None = None,
    mark_seen: bool = False,
    client_id: str | None = None,
    client_secret: str | None = None,
    include_seen: bool = False,
) -> dict[str, Any]:
    """
    Programmatic scan for the web UI / MCP server.
    Returns {generated_at, count, auth, posts, error?}.
    """
    cfg = load_config(config_path)
    if hours is not None:
        cfg["lookback_hours"] = hours
    if min_score is not None:
        cfg["min_score"] = min_score

    cid, csec = resolve_credentials(client_id, client_secret)
    token = None
    auth = "public"
    if cid and csec:
        token = oauth_token(cid, csec, cfg["user_agent"])
        auth = "oauth" if token else "public_fallback"

    raw = collect(cfg, token)
    lookback = float(cfg["lookback_hours"])
    threshold = float(cfg["min_score"])
    max_results = int(cfg.get("max_results", 25))

    seen = load_seen(seen_path)
    seen_ids = set(seen.get("ids", {})) if not include_seen else set()

    scored: list[Post] = []
    for p in raw:
        if not p.id or not p.title:
            continue
        if p.age_hours > lookback:
            continue
        if p.id in seen_ids:
            continue
        score_post(p, cfg)
        if p.relevance >= threshold:
            scored.append(p)

    scored.sort(key=lambda x: (-x.relevance, x.age_hours))
    scored = scored[:max_results]

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    posts_out = []
    for p in scored:
        d = asdict(p)
        d["age_hours"] = round(p.age_hours, 1)
        d["reddit_url"] = p.reddit_url
        d["draft"] = draft_comment_stub(p, cfg)
        d["excerpt"] = (p.selftext[:500] + ("…" if len(p.selftext) > 500 else "")) or ""
        posts_out.append(d)

    if mark_seen:
        now = datetime.now(timezone.utc).timestamp()
        for p in scored:
            seen.setdefault("ids", {})[p.id] = now
        save_seen(seen_path, seen)

    return {
        "generated_at": generated_at,
        "count": len(posts_out),
        "auth": auth,
        "has_credentials": bool(cid and csec),
        "lookback_hours": lookback,
        "min_score": threshold,
        "posts": posts_out,
    }


if __name__ == "__main__":
    raise SystemExit(main())
