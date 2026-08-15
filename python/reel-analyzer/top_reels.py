import json
import sys
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone, timedelta
from _env import load_env

GRAPH = "https://graph.facebook.com/v21.0"

def get(path, params):
    qs = urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(f"{GRAPH}/{path}?{qs}") as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": json.loads(e.read()).get("error", {})}

METRICS_BY_TYPE = {
    "IMAGE": "reach,saved,likes,comments,shares,total_interactions",
    "CAROUSEL_ALBUM": "reach,saved,likes,comments,shares,total_interactions",
    "VIDEO": "reach,saved,likes,comments,shares,total_interactions,views",
}

if __name__ == "__main__":
    months_back = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    cutoff = datetime.now(timezone.utc) - timedelta(days=30 * months_back)

    env = load_env()
    token = env["META_ACCESS_TOKEN"]
    ig_id = env["IG_BUSINESS_ACCOUNT_ID"]

    all_media = []
    params = {"fields": "id,caption,media_type,timestamp,permalink", "limit": 50, "access_token": token}
    path = f"{ig_id}/media"

    while True:
        resp = get(path, params)
        if "error" in resp:
            print("Error:", resp["error"])
            break
        batch = resp.get("data", [])
        all_media.extend(batch)
        if batch and datetime.fromisoformat(batch[-1]["timestamp"]) < cutoff:
            break
        next_url = resp.get("paging", {}).get("next")
        if not next_url:
            break
        parsed = urllib.parse.urlparse(next_url)
        params = dict(urllib.parse.parse_qsl(parsed.query))
        path = parsed.path.split("/")[-1]

    in_range = [m for m in all_media if datetime.fromisoformat(m["timestamp"]) >= cutoff]
    print(f"Found {len(in_range)} posts in the last {months_back} months (of {len(all_media)} fetched).\n")

    results = []
    for item in in_range:
        metrics = METRICS_BY_TYPE.get(item["media_type"], "reach,saved,likes,comments,shares,total_interactions")
        insights = get(f"{item['id']}/insights", {"metric": metrics, "access_token": token})
        if "data" not in insights:
            continue
        values = {m["name"]: m["values"][0]["value"] for m in insights["data"]}
        results.append({**item, **values})

    results.sort(key=lambda r: r.get("views", r.get("reach", 0)), reverse=True)

    for r in results:
        caption = (r.get("caption") or "").replace("\n", " ")[:60]
        print(f"{r['timestamp'][:10]} | {r['media_type']:14} | views={r.get('views','-'):>7} reach={r.get('reach','-'):>6} "
              f"saved={r.get('saved','-'):>4} shares={r.get('shares','-'):>4} likes={r.get('likes','-'):>5} | {caption}")
        print(f"  {r['permalink']}")
