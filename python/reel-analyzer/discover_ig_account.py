import json
import urllib.request
from _env import load_env, set_env_value

GRAPH = "https://graph.facebook.com/v21.0"

def get(path, params):
    qs = urllib.parse.urlencode(params)
    with urllib.request.urlopen(f"{GRAPH}/{path}?{qs}") as r:
        return json.loads(r.read())

if __name__ == "__main__":
    import urllib.parse
    env = load_env()
    token = env["META_ACCESS_TOKEN"]

    pages = get("me/accounts", {"fields": "id,name,instagram_business_account", "access_token": token})

    if "error" in pages:
        print("Error:", pages["error"]["message"])
        raise SystemExit(1)

    if not pages.get("data"):
        print("No Pages returned. Check that pages_show_list is granted on this token,")
        print("and that a Facebook Page is actually linked to your Instagram Business account.")
        raise SystemExit(1)

    for page in pages["data"]:
        ig = page.get("instagram_business_account")
        print(f"Page: {page['name']} ({page['id']})")
        if ig:
            print(f"  Instagram Business Account ID: {ig['id']}")
            set_env_value("IG_BUSINESS_ACCOUNT_ID", ig["id"])
            print("  -> saved to .env")
        else:
            print("  No Instagram Business Account linked to this Page.")
