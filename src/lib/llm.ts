// Provider-agnostic LLM calling, isolated in this one module so a third
// provider is a small addition here, not a change everywhere it's used.
// Server-only (reads keys from SQLite via @/lib/keys) — never import this
// from a client component.
import { getKey } from "@/lib/keys";

// Reasonable current defaults as of 2026-08-16. Bump these here if a
// provider deprecates the model — nothing else in the app needs to change.
// The Anthropic ID is a same-family model, checked directly. The OpenAI
// ID is a best-effort guess from public pricing pages (gpt-4o-mini itself
// is now well out of date, OpenAI has since shipped GPT-5/5.4/5.5) - worth
// confirming against OpenAI's actual current model list before relying on it.
const ANTHROPIC_MODEL = "claude-sonnet-5";
const OPENAI_MODEL = "gpt-5-mini";

export class LlmConfigError extends Error {}

type Provider = "anthropic" | "openai";

function resolveProvider(): { provider: Provider; key: string } {
  const anthropicKey = getKey("ANTHROPIC_API_KEY");
  if (anthropicKey) return { provider: "anthropic", key: anthropicKey };

  const openaiKey = getKey("OPENAI_API_KEY");
  if (openaiKey) return { provider: "openai", key: openaiKey };

  throw new LlmConfigError(
    "No LLM key configured. Add an Anthropic or OpenAI API key in Settings to use this tool."
  );
}

export function hasLlmKeyConfigured(): boolean {
  return Boolean(getKey("ANTHROPIC_API_KEY") || getKey("OPENAI_API_KEY"));
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Anthropic returned no text content.");
  }
  return text;
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenAI returned no text content.");
  }
  return text;
}

/**
 * Calls whichever LLM provider has a key configured — Anthropic preferred,
 * OpenAI as fallback. Throws LlmConfigError if neither is set.
 */
export async function callLlm(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number } = {}
): Promise<string> {
  const { provider, key } = resolveProvider();
  const maxTokens = opts.maxTokens ?? 1024;

  if (provider === "anthropic") {
    return callAnthropic(key, systemPrompt, userPrompt, maxTokens);
  }
  return callOpenAI(key, systemPrompt, userPrompt, maxTokens);
}
