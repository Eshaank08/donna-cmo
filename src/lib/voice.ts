import { db } from "@/lib/db";
import { callLlm } from "@/lib/llm";
import { buildStatisticalProfile } from "@/lib/voice-stats";

export type VoiceProfile = {
  samples: string[];
  tone: string;
  sentence_patterns: string;
  recurring_phrases: string;
  avoid: string;
  updated_at: string;
};

export type HumanizeRecord = {
  id: number;
  input_text: string;
  output_text: string;
  created_at: string;
};

type VoiceProfileRow = {
  samples: string;
  tone: string | null;
  sentence_patterns: string | null;
  recurring_phrases: string | null;
  avoid: string | null;
  updated_at: string;
};

export function getVoiceProfile(): VoiceProfile | null {
  const row = db
    .prepare(
      "SELECT samples, tone, sentence_patterns, recurring_phrases, avoid, updated_at FROM voice_profile WHERE id = 1"
    )
    .get() as VoiceProfileRow | undefined;
  if (!row) return null;
  return {
    samples: JSON.parse(row.samples),
    tone: row.tone ?? "",
    sentence_patterns: row.sentence_patterns ?? "",
    recurring_phrases: row.recurring_phrases ?? "",
    avoid: row.avoid ?? "",
    updated_at: row.updated_at,
  };
}

function saveVoiceProfileRow(
  samples: string[],
  fields: {
    tone: string;
    sentence_patterns: string;
    recurring_phrases: string;
    avoid: string;
  }
) {
  db.prepare(
    `INSERT INTO voice_profile (id, samples, tone, sentence_patterns, recurring_phrases, avoid, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       samples = excluded.samples,
       tone = excluded.tone,
       sentence_patterns = excluded.sentence_patterns,
       recurring_phrases = excluded.recurring_phrases,
       avoid = excluded.avoid,
       updated_at = excluded.updated_at`
  ).run(
    JSON.stringify(samples),
    fields.tone,
    fields.sentence_patterns,
    fields.recurring_phrases,
    fields.avoid
  );
}

const PROFILE_SYSTEM_PROMPT = `You are a writing analyst. Given several samples of one person's past writing (captions, scripts, posts), find the real patterns in how they write — not generic writing advice. Be specific and concrete, citing actual words or habits from the samples where you can. Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it.`;

function buildProfileUserPrompt(samples: string[]): string {
  return [
    "Writing samples from one author, separated by '---':",
    "",
    samples.join("\n---\n"),
    "",
    "Return a JSON object with exactly these four string fields:",
    "{",
    '  "tone": "the overall tone and attitude of the writing",',
    '  "sentence_patterns": "recurring structural habits — sentence length, rhythm, punctuation, fragments vs full sentences",',
    '  "recurring_phrases": "specific words, phrases, or openers/closers that show up more than once",',
    '  "avoid": "what this writing never does — tics, cliches, or tones that would break the voice"',
    "}",
  ].join("\n");
}

function extractJsonObject(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("The model didn't return a JSON profile. Try again.");
  }
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    throw new Error("Couldn't parse the model's response as JSON. Try again.");
  }
}

export async function buildVoiceProfile(
  samples: string[]
): Promise<VoiceProfile> {
  const cleaned = samples.map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new Error("Add at least one writing sample.");
  }

  const raw = await callLlm(
    PROFILE_SYSTEM_PROMPT,
    buildProfileUserPrompt(cleaned),
    { maxTokens: 1024 }
  );
  const parsed = extractJsonObject(raw);

  const fields = {
    tone: String(parsed.tone ?? "").trim(),
    sentence_patterns: String(parsed.sentence_patterns ?? "").trim(),
    recurring_phrases: String(parsed.recurring_phrases ?? "").trim(),
    avoid: String(parsed.avoid ?? "").trim(),
  };

  saveVoiceProfileRow(cleaned, fields);

  const profile = getVoiceProfile();
  if (!profile) throw new Error("Saved the profile but couldn't reload it.");
  return profile;
}

/** Same shape as buildVoiceProfile, but pure computed statistics — no LLM, no key, no network. */
export function buildStatisticalVoiceProfile(samples: string[]): VoiceProfile {
  const cleaned = samples.map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new Error("Add at least one writing sample.");
  }

  const fields = buildStatisticalProfile(cleaned);
  saveVoiceProfileRow(cleaned, fields);

  const profile = getVoiceProfile();
  if (!profile) throw new Error("Saved the profile but couldn't reload it.");
  return profile;
}

const HUMANIZE_SYSTEM_PROMPT = `You rewrite drafts so they sound like they were written by one specific person, using their voice profile. Keep the meaning and roughly the same length. Do not add new claims. Respond with ONLY the rewritten draft — no preamble, no explanation, no quotation marks around it.`;

function buildHumanizeUserPrompt(
  profile: VoiceProfile,
  draft: string
): string {
  return [
    "Voice profile:",
    `Tone: ${profile.tone || "(not specified)"}`,
    `Sentence patterns: ${profile.sentence_patterns || "(not specified)"}`,
    `Recurring phrases: ${profile.recurring_phrases || "(not specified)"}`,
    `Avoid: ${profile.avoid || "(not specified)"}`,
    "",
    "Rewrite the following draft in this voice:",
    "",
    draft,
  ].join("\n");
}

export async function humanizeDraft(draftText: string): Promise<HumanizeRecord> {
  const trimmed = draftText.trim();
  if (!trimmed) {
    throw new Error("Paste a draft to rewrite.");
  }

  const profile = getVoiceProfile();
  if (!profile) {
    throw new Error("Build a voice profile first, on the other tab.");
  }

  const output = await callLlm(
    HUMANIZE_SYSTEM_PROMPT,
    buildHumanizeUserPrompt(profile, trimmed),
    { maxTokens: 1024 }
  );
  const cleanOutput = output.trim();

  const result = db
    .prepare(
      "INSERT INTO voice_humanize_history (input_text, output_text) VALUES (?, ?)"
    )
    .run(trimmed, cleanOutput);

  return {
    id: Number(result.lastInsertRowid),
    input_text: trimmed,
    output_text: cleanOutput,
    created_at: new Date().toISOString(),
  };
}

export function listHumanizeHistory(): HumanizeRecord[] {
  return db
    .prepare(
      "SELECT id, input_text, output_text, created_at FROM voice_humanize_history ORDER BY id DESC LIMIT 20"
    )
    .all() as HumanizeRecord[];
}
