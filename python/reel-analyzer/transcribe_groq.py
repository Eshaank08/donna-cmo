import sys
import os
import requests
from _env import load_env

GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

def transcribe(video_path, model="whisper-large-v3-turbo"):
    env = load_env()
    api_key = env.get("GROQ_API_KEY")
    if not api_key:
        print("Missing GROQ_API_KEY in .env — get a free key at console.groq.com", file=sys.stderr)
        raise SystemExit(1)
    with open(video_path, "rb") as f:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            files={"file": f},
            data={"model": model, "response_format": "text"},
        )
    resp.raise_for_status()
    return resp.text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 transcribe_groq.py <video_path>")
        raise SystemExit(1)
    text = transcribe(sys.argv[1])
    print(text)
