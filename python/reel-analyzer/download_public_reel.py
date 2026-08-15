import subprocess
import sys
import os

def download(url, out_dir="/tmp/ig_analysis"):
    os.makedirs(out_dir, exist_ok=True)
    base_cmd = ["yt-dlp", "--no-warnings", "-o", os.path.join(out_dir, "%(id)s.%(ext)s"), url]
    result = subprocess.run(base_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        cmd = base_cmd[:2] + ["--cookies-from-browser", "chrome"] + base_cmd[2:]
        result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        raise SystemExit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 download_public_reel.py <instagram_post_or_reel_url> [url2 ...]")
        raise SystemExit(1)
    for url in sys.argv[1:]:
        print(f"Downloading {url}")
        download(url)
