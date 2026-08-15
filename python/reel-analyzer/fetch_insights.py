import json
import urllib.request
import urllib.parse
import urllib.error
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
    "REELS": "reach,saved,likes,comments,shares,total_interactions,views,ig_reels_avg_watch_time",
}

if __name__ == "__main__":
    env = load_env()
    token = env["META_ACCESS_TOKEN"]
    ig_id = env.get("IG_BUSINESS_ACCOUNT_ID")

    if not ig_id:
        print("IG_BUSINESS_ACCOUNT_ID is empty — run discover_ig_account.py first.")
        raise SystemExit(1)

    account = get(ig_id, {
        "fields": "followers_count,media_count,username",
        "access_token": token,
    })
    print("Account:", json.dumps(account, indent=2))

    media = get(f"{ig_id}/media", {
        "fields": "id,caption,media_type,timestamp,permalink",
        "limit": 10,
        "access_token": token,
    })

    for item in media.get("data", []):
        metrics = METRICS_BY_TYPE.get(item["media_type"], "reach,saved,likes,comments,shares,total_interactions")
        insights = get(f"{item['id']}/insights", {
            "metric": metrics,
            "access_token": token,
        })
        print(f"\n{item.get('timestamp')} — {item.get('media_type')} — {item.get('permalink')}")
        if "data" in insights:
            values = {m["name"]: m["values"][0]["value"] for m in insights["data"]}
            print(" ", values)
        else:
            print("  error:", insights.get("error", insights).get("message", insights))
