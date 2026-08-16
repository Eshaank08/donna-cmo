// Provider-agnostic LLM calling, isolated in this one module so a third
// provider is a small addition here, not a change everywhere it's used.
// Server-only (reads keys from SQLite via @/lib/keys) — never import this
// from a client component.
import { spawn } from "node:child_process";
import os from "node:os";
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
  | { provider: "claude-code" }
  | { provider: "ollama"; model: string }
  | { provider: "hermes" };

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

/** Runs a CLI as a subprocess and collects its output. Never throws on a non-zero exit — callers check `code`. Kills and rejects on timeout, since at least one of these CLIs has been observed to print an error and then hang instead of exiting. */
function spawnCollect(
  command: string,
  args: string[],
  opts: { timeoutMs?: number } = {}
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    // cwd is a neutral tmp dir, not this repo — belt-and-suspenders on top
    // of each call's own isolation flags so a Voice-tool call never picks
    // up donna-cmo's own .mcp.json, CLAUDE.md, or hooks as context.
    const child = spawn(command, args, { cwd: os.tmpdir(), env: process.env });
    let stdout = "";
    let stderr = "";
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          child.kill();
          reject(new Error(`${command} timed out`));
        }, opts.timeoutMs)
      : null;
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ stdout, stderr, code });
    });
  });
}

/** Free, local, no completion cost — just confirms the CLI is installed and logged in. */
async function detectClaudeCodeCli(): Promise<boolean> {
  try {
    const { stdout, code } = await spawnCollect("claude", ["auth", "status"], {
      timeoutMs: 4000,
    });
    if (code !== 0) return false;
    const status = JSON.parse(stdout) as { loggedIn?: boolean };
    return status.loggedIn === true;
  } catch {
    return false;
  }
}

// Hermes is Eshaan's own personal agent CLI, not something anyone else
// installing this toolkit would have — deliberately not documented in the
// README/Settings copy the way Claude Code and Ollama are. It exists here
// as a best-effort extra fallback on his machine only, and it's genuinely
// best-effort: it routes through whichever pooled provider credential is
// configured, which has been observed to fail (insufficient credits) or
// hang past a clean error message rather than exit — hence the hard
// timeout and the explicit "API call failed" text check below, since exit
// code alone isn't proven reliable for this CLI.
async function detectHermesCli(): Promise<boolean> {
  try {
    const { code } = await spawnCollect("hermes", ["status"], {
      timeoutMs: 5000,
    });
    return code === 0;
  } catch {
    return false;
  }
}

async function resolveProvider(): Promise<Resolved> {
  const anthropicKey = getKey("ANTHROPIC_API_KEY");
  if (anthropicKey) return { provider: "anthropic", key: anthropicKey };

  const openaiKey = getKey("OPENAI_API_KEY");
  if (openaiKey) return { provider: "openai", key: openaiKey };

  if (await detectClaudeCodeCli()) return { provider: "claude-code" };

  const ollamaModel = await detectOllamaModel();
  if (ollamaModel) return { provider: "ollama", model: ollamaModel };

  if (await detectHermesCli()) return { provider: "hermes" };

  throw new LlmConfigError(
    "No LLM available. Add an Anthropic or OpenAI API key in Settings, log into the Claude Code CLI (`claude login`) if it's installed, or run Ollama locally (any model) — no key needed for the last two."
  );
}

/** True if this tool can make an LLM call right now — a cloud key, a logged-in Claude Code CLI, a reachable local Ollama server, or (personal-machine best-effort) Hermes. */
export async function isLlmAvailable(): Promise<boolean> {
  if (getKey("ANTHROPIC_API_KEY") || getKey("OPENAI_API_KEY")) return true;
  if (await detectClaudeCodeCli()) return true;
  if (await detectOllamaModel()) return true;
  return await detectHermesCli();
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

async function callClaudeCode(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // --system-prompt fully replaces the default coding-agent framing (not
  // --append-system-prompt, which would stack this tool's instructions on
  // top of it). --tools ""/--strict-mcp-config/--setting-sources "" keep
  // this a plain text-in-text-out call: no file reads, no MCP servers, no
  // user or project CLAUDE.md/settings/hooks bleeding into the response.
  // No token cap here — the CLI doesn't expose a max-output-tokens flag.
  const { stdout, stderr, code } = await spawnCollect("claude", [
    "-p",
    userPrompt,
    "--system-prompt",
    systemPrompt,
    "--output-format",
    "json",
    "--tools",
    "",
    "--strict-mcp-config",
    "--setting-sources",
    "",
  ]);

  if (code !== 0) {
    throw new Error(
      `Claude Code CLI error (exit ${code}): ${(stderr || stdout).slice(0, 500)}`
    );
  }

  let parsed: { is_error?: boolean; result?: string };
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(
      `Claude Code CLI returned unparseable output: ${stdout.slice(0, 500)}`
    );
  }

  if (parsed.is_error || typeof parsed.result !== "string" || !parsed.result.trim()) {
    throw new Error(
      `Claude Code CLI returned no usable result: ${(parsed.result ?? stdout).slice(0, 500)}`
    );
  }

  return parsed.result;
}

async function callHermes(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // No --system-prompt-equivalent flag exists for `hermes chat`, so it's
  // folded into the query text. --ignore-rules (not --safe-mode) so it
  // keeps ~/.hermes/config.yaml's actual configured default model/provider
  // — --safe-mode also implies --ignore-user-config, which was observed
  // to fall back to a builtin default model this account can't afford,
  // even though the real configured default is a free one.
  const combinedPrompt = `${systemPrompt}\n\n---\n\nRespond only to the above instructions, nothing else. Do not use any tools.\n\n${userPrompt}`;

  const { stdout, stderr, code } = await spawnCollect(
    "hermes",
    ["chat", "-q", combinedPrompt, "-Q", "--ignore-rules", "--max-turns", "1"],
    { timeoutMs: 60000 }
  );

  if (code !== 0) {
    throw new Error(
      `Hermes CLI error (exit ${code}): ${(stderr || stdout).slice(0, 500)}`
    );
  }

  const lines = stdout.split("\n");
  const sessionLineIdx = lines.findIndex((l) => l.startsWith("session_id:"));
  const result = (
    sessionLineIdx === -1 ? stdout : lines.slice(sessionLineIdx + 1).join("\n")
  ).trim();

  // Exit code alone isn't proven reliable for this CLI (observed hanging
  // past a printed error instead of exiting non-zero), so also check text.
  if (!result || /^API call failed/.test(result) || stdout.includes("API call failed")) {
    throw new Error(`Hermes CLI returned no usable result: ${(result || stdout).slice(0, 500)}`);
  }

  return result;
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
  if (resolved.provider === "claude-code") {
    return callClaudeCode(systemPrompt, userPrompt);
  }
  if (resolved.provider === "hermes") {
    return callHermes(systemPrompt, userPrompt);
  }
  return callOllama(resolved.model, systemPrompt, userPrompt, maxTokens);
}
