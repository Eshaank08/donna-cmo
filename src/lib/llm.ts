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

// No key, no account, no cost — if a local Ollama server is running, this
// is a genuine zero-API path, not a cloud provider in disguise. Only probed
// when neither cloud key is set, so anyone who already configured a key
// sees no behavior change at all.
const OLLAMA_HOST = "http://localhost:11434";

export class LlmConfigError extends Error {}

type Resolved =
  | { provider: "anthropic"; key: string }
  | { provider: "openai"; key: string }
  | { provider: "ollama"; model: string };

async function detectOllamaModel(): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      signal: AbortSignal.timeout(800),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { models?: { name: string }[] };
    return data.models?.[0]?.name ?? null;
  } catch {
    return null;
  }
}

async function resolveProvider(): Promise<Resolved> {
  const anthropicKey = getKey("ANTHROPIC_API_KEY");
  if (anthropicKey) return { provider: "anthropic", key: anthropicKey };

  const openaiKey = getKey("OPENAI_API_KEY");
  if (openaiKey) return { provider: "openai", key: openaiKey };

  const ollamaModel = await detectOllamaModel();
  if (ollamaModel) return { provider: "ollama", model: ollamaModel };

  throw new LlmConfigError(
    "No LLM available. Add an Anthropic or OpenAI API key in Settings, or run Ollama locally (any model) — no key needed for that."
  );
}

/** True if this tool can make an LLM call right now — a cloud key, or a reachable local Ollama server. */
export async function isLlmAvailable(): Promise<boolean> {
  if (getKey("ANTHROPIC_API_KEY") || getKey("OPENAI_API_KEY")) return true;
  return Boolean(await detectOllamaModel());
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

async function callOllama(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: { num_predict: maxTokens },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const text = data.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Ollama returned no text content.");
  }
  return text;
}

/**
 * Calls whichever LLM is available — Anthropic key, then OpenAI key, then a
 * local Ollama server with zero key needed. Throws LlmConfigError if none.
 */
export async function callLlm(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number } = {}
): Promise<string> {
  const resolved = await resolveProvider();
  const maxTokens = opts.maxTokens ?? 1024;

  if (resolved.provider === "anthropic") {
    return callAnthropic(resolved.key, systemPrompt, userPrompt, maxTokens);
  }
  if (resolved.provider === "openai") {
    return callOpenAI(resolved.key, systemPrompt, userPrompt, maxTokens);
  }
  return callOllama(resolved.model, systemPrompt, userPrompt, maxTokens);
}
