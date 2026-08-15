import os

REQUIRED = ["META_ACCESS_TOKEN", "META_BUSINESS_ID", "IG_BUSINESS_ACCOUNT_ID", "GROQ_API_KEY"]


def load_env():
    """Keys come from the parent process's environment (the shell's job runner
    sets these from its keys vault). Falls back to a local .env file for
    standalone CLI use."""
    env = {k: os.environ[k] for k in REQUIRED if os.environ.get(k)}
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                env.setdefault(key.strip(), value.strip())
    return env


def set_env_value(key, value):
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path) as f:
            lines = f.readlines()
    found = False
    for i, line in enumerate(lines):
        if line.strip().startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            found = True
            break
    if not found:
        lines.append(f"{key}={value}\n")
    with open(env_path, "w") as f:
        f.writelines(lines)
