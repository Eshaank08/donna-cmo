import { db } from "@/lib/db";

export const KEY_REGISTRY = [
  {
    name: "META_ACCESS_TOKEN",
    label: "Meta access token",
    help: "Optional. Graph API token for your Instagram business account — only needed for the own-account insights view (not built into the UI yet), not for analyzing a public reel link.",
  },
  {
    name: "META_APP_ID",
    label: "Meta app ID",
    help: "Optional. From your Meta developer app — same not-yet-built insights feature as above.",
  },
  {
    name: "META_APP_SECRET",
    label: "Meta app secret",
    help: "Optional. From your Meta developer app — same not-yet-built insights feature as above.",
  },
  {
    name: "META_BUSINESS_ID",
    label: "Meta business ID",
    help: "Optional. Your Meta business account ID — same not-yet-built insights feature as above.",
  },
  {
    name: "IG_BUSINESS_ACCOUNT_ID",
    label: "Instagram business account ID",
    help: "Optional. The IG account the (not-yet-built) insights view would read from.",
  },
  {
    name: "GROQ_API_KEY",
    label: "Groq API key",
    help: "Optional. Adds a transcript to the reel analyzer — metadata, hooks, and frames all work without it. Free tier at console.groq.com.",
  },
  {
    name: "REDDIT_CLIENT_ID",
    label: "Reddit client ID",
    help: "Effectively required. Reddit now blocks anonymous requests to its public JSON endpoints outright (401/403), so without this the scan runs but returns nothing. From a \"script\" app at reddit.com/prefs/apps. Note: new app requests need Reddit's manual approval since Nov 2025 and may be denied — this is your own app, never shared.",
  },
  {
    name: "REDDIT_CLIENT_SECRET",
    label: "Reddit client secret",
    help: "From the same Reddit app as above.",
  },
  {
    name: "ANTHROPIC_API_KEY",
    label: "Anthropic API key",
    help: "Optional. Used by the Voice tool to analyze your writing and rewrite drafts. Preferred over OpenAI if both are set. If neither is set, Voice automatically falls back to a logged-in Claude Code CLI, then a local Ollama server if one's running — no key needed for either.",
  },
  {
    name: "OPENAI_API_KEY",
    label: "OpenAI API key",
    help: "Optional. Used by the Voice tool if no Anthropic key is set. Same Claude Code / local-Ollama fallback applies if neither key is present.",
  },
] as const;

export type KeyName = (typeof KEY_REGISTRY)[number]["name"];

export function getKey(name: KeyName): string | undefined {
  const row = db
    .prepare("SELECT value FROM api_keys WHERE name = ?")
    .get(name) as { value: string } | undefined;
  return row?.value;
}

export function getAllKeys(): Record<string, string> {
  const rows = db.prepare("SELECT name, value FROM api_keys").all() as {
    name: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.name, r.value]));
}

export function setKey(name: KeyName, value: string) {
  db.prepare(
    `INSERT INTO api_keys (name, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(name) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(name, value);
}

export function deleteKey(name: KeyName) {
  db.prepare("DELETE FROM api_keys WHERE name = ?").run(name);
}
