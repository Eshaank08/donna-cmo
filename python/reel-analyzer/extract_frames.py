import subprocess
import sys
import os

def extract(video_path, interval=1.5):
    name = os.path.splitext(os.path.basename(video_path))[0]
    out_dir = os.path.join(os.path.dirname(video_path), f"frames_{name}")
    os.makedirs(out_dir, exist_ok=True)
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps=1/{interval}",
        "-qscale:v", "3",
        os.path.join(out_dir, "f_%03d.jpg"),
        "-y", "-loglevel", "error",
    ]
    subprocess.run(cmd, check=True)
    frames = sorted(os.listdir(out_dir))
    print(f"{name}: {len(frames)} frames -> {out_dir}")
    return out_dir

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 extract_frames.py <video_path> [interval_seconds]")
        raise SystemExit(1)
    interval = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
    extract(sys.argv[1], interval)
