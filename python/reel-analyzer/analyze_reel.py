import json
import os
import subprocess
import sys

from _env import load_env
from extract_frames import extract as extract_frames
from transcribe_groq import transcribe as transcribe_groq

DEFAULT_OUT_ROOT = "/tmp/reel-analyzer"


def _run_yt_dlp(args):
    result = subprocess.run(["yt-dlp", "--no-warnings"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        result = subprocess.run(
            ["yt-dlp", "--no-warnings", "--cookies-from-browser", "chrome"] + args,
            capture_output=True, text=True,
        )
    return result


def fetch_metadata(url):
    result = _run_yt_dlp(["--skip-download", "-j", url])
    if result.returncode != 0:
        _explain_failure(result.stderr)
        raise SystemExit(1)
    return json.loads(result.stdout)


def download_video(url, dest_dir):
    result = _run_yt_dlp(["-o", os.path.join(dest_dir, "video.%(ext)s"), url])
    if result.returncode != 0:
        _explain_failure(result.stderr)
        raise SystemExit(1)
    for f in os.listdir(dest_dir):
        if f.startswith("video."):
            return os.path.join(dest_dir, f)
    raise RuntimeError("Download reported success but no video file found")


def _explain_failure(stderr):
    print(stderr, file=sys.stderr)
    if "cookies database" in stderr or "empty media response" in stderr:
        print(
            "\nCookie/auth issue talking to Instagram. Check, in order:\n"
            "  1. Chrome is open and you're logged into instagram.com in it.\n"
            "  2. Quit and reopen Chrome once (its cookie DB can lock while running).\n"
            "  3. On macOS, if it still fails: System Settings > Privacy & Security > "
            "Full Disk Access — make sure your terminal (or the app running this) is "
            "enabled there, then restart it.\n",
            file=sys.stderr,
        )


def analyze(url, out_root=DEFAULT_OUT_ROOT, frame_interval=1.5, skip_transcript=False):
    meta = fetch_metadata(url)
    post_id = meta.get("id", "unknown")
    dest_dir = os.path.join(out_root, post_id)
    os.makedirs(dest_dir, exist_ok=True)

    print(f"[{post_id}] downloading video...")
    video_path = download_video(url, dest_dir)

    duration = meta.get("duration")
    if duration is None:
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video_path],
            capture_output=True, text=True,
        )
        try:
            duration = round(float(probe.stdout.strip()), 1)
        except ValueError:
            duration = None

    print(f"[{post_id}] extracting frames...")
    frames_dir = extract_frames(video_path, interval=frame_interval)

    transcript = None
    if not skip_transcript:
        env = load_env()
        if env.get("GROQ_API_KEY"):
            print(f"[{post_id}] transcribing audio...")
            try:
                transcript = transcribe_groq(video_path)
            except Exception as e:
                print(f"[{post_id}] transcription failed, continuing without it: {e}", file=sys.stderr)
        else:
            print(f"[{post_id}] no GROQ_API_KEY set, skipping transcript")

    record = {
        "id": post_id,
        "url": meta.get("webpage_url", url),
        "caption": meta.get("description"),
        "like_count": meta.get("like_count"),
        "comment_count": meta.get("comment_count"),
        "view_count": meta.get("view_count"),
        "duration_seconds": duration,
        "upload_date": meta.get("upload_date"),
        "uploader": meta.get("uploader") or meta.get("channel"),
        "video_path": video_path,
        "frames_dir": frames_dir,
        "transcript": transcript,
    }

    with open(os.path.join(dest_dir, "meta.json"), "w") as f:
        json.dump(record, f, indent=2)

    summary_lines = [
        f"# {record['uploader'] or 'Unknown'} — {post_id}",
        f"\n{record['url']}\n",
        f"Duration: {record['duration_seconds']}s | Likes: {record['like_count']} | Comments: {record['comment_count']} | Views: {record['view_count']}\n",
        "## Caption",
        record["caption"] or "(none)",
        "\n## Transcript",
        transcript or "(no audio transcript)",
        f"\n## Frames\n{frames_dir}/",
    ]
    summary_path = os.path.join(dest_dir, "summary.md")
    with open(summary_path, "w") as f:
        f.write("\n".join(summary_lines))

    print(f"[{post_id}] done -> {dest_dir}")
    return record


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_reel.py <url> [url2 ...] [--no-transcript] [--interval=1.5] [--output-dir=/path]")
        raise SystemExit(1)

    urls = []
    interval = 1.5
    skip_transcript = False
    out_root = DEFAULT_OUT_ROOT
    for arg in sys.argv[1:]:
        if arg == "--no-transcript":
            skip_transcript = True
        elif arg.startswith("--interval="):
            interval = float(arg.split("=", 1)[1])
        elif arg.startswith("--output-dir="):
            out_root = arg.split("=", 1)[1]
        else:
            urls.append(arg)

    results = []
    for url in urls:
        results.append(analyze(url, out_root=out_root, frame_interval=interval, skip_transcript=skip_transcript))

    print(f"\n{len(results)} reel(s) analyzed. Output in {out_root}/<id>/ — see summary.md in each.")
