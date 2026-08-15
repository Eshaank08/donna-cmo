import { db } from "@/lib/db";

export const KEY_REGISTRY = [
  {
    name: "META_ACCESS_TOKEN",
    label: "Meta access token",
    help: "Graph API token for your Instagram business account. Required by the reel analyzer.",
  },
  {
    name: "META_APP_ID",
    label: "Meta app ID",
    help: "From your Meta developer app. Required by the reel analyzer.",
  },
  {
    name: "META_APP_SECRET",
    label: "Meta app secret",
    help: "From your Meta developer app. Required by the reel analyzer.",
  },
  {
    name: "META_BUSINESS_ID",
    label: "Meta business ID",
    help: "Your Meta business account ID. Required by the reel analyzer.",
  },
  {
    name: "IG_BUSINESS_ACCOUNT_ID",
    label: "Instagram business account ID",
    help: "The IG account the reel analyzer reads insights from.",
  },
  {
    name: "GROQ_API_KEY",
    label: "Groq API key",
    help: "Used to transcribe reel audio. Free tier at console.groq.com.",
  },
  {
    name: "REDDIT_CLIENT_ID",
    label: "Reddit client ID",
    help: "From a \"script\" app at reddit.com/prefs/apps. Reddit blocks unauthenticated access now, so this is effectively required, not optional. Note: new app requests need Reddit's manual approval since Nov 2025 and may be denied — this is your own app, never shared.",
  },
  {
    name: "REDDIT_CLIENT_SECRET",
    label: "Reddit client secret",
    help: "From the same Reddit app.",
  },
  {
    name: "ANTHROPIC_API_KEY",
    label: "Anthropic API key",
    help: "Used by the Voice tool to analyze your writing and rewrite drafts. Preferred over OpenAI if both are set.",
  },
  {
    name: "OPENAI_API_KEY",
    label: "OpenAI API key",
    help: "Used by the Voice tool if no Anthropic key is set.",
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
