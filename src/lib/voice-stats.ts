// Rule-based voice profile — zero API calls, zero network. Real computed
// statistics from the pasted samples, not a placeholder: sentence rhythm,
// punctuation habits, and phrases that actually repeat. Cruder than the LLM
// profile (no read on tone/attitude, which needs semantic understanding),
// but a genuine fallback for anyone with no LLM key and no local Ollama.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for",
  "with", "is", "are", "was", "were", "be", "been", "it", "this", "that",
  "i", "you", "we", "they", "he", "she", "as", "by", "from", "so", "if",
  "not", "no", "do", "did", "have", "has", "had", "will", "would", "can",
  "could", "just", "my", "your", "our", "their", "there", "what", "which",
]);

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

function topEntries(counts: Map<string, number>, min: number, limit: number) {
  return [...counts.entries()]
    .filter(([, c]) => c >= min)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export type StatisticalProfileFields = {
  tone: string;
  sentence_patterns: string;
  recurring_phrases: string;
  avoid: string;
};

export function buildStatisticalProfile(
  samples: string[]
): StatisticalProfileFields {
  const text = samples.join("\n\n");
  const sentences = samples.flatMap(splitSentences);
  const sentenceCount = sentences.length || 1;
  const pct = (n: number) => Math.round((n / sentenceCount) * 100);

  const lengths = sentences
    .map((s) => words(s).length)
    .filter((n) => n > 0);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const shortCount = lengths.filter((n) => n <= 5).length;
  const longCount = lengths.filter((n) => n >= 25).length;

  const emDash = (text.match(/—|--/g) ?? []).length;
  const exclaim = (text.match(/!/g) ?? []).length;
  const question = (text.match(/\?/g) ?? []).length;
  const semicolon = (text.match(/;/g) ?? []).length;
  const contractions = (text.match(/\b\w+'\w+\b/g) ?? []).length;

  const allWords = words(text);
  const phraseCounts = new Map<string, number>();
  for (const n of [2, 3]) {
    for (const g of ngrams(allWords, n)) {
      const parts = g.split(" ");
      if (parts.every((w) => STOPWORDS.has(w))) continue;
      phraseCounts.set(g, (phraseCounts.get(g) ?? 0) + 1);
    }
  }
  const recurring = topEntries(phraseCounts, 2, 6).map(
    ([g, c]) => `"${g}" (${c}×)`
  );

  const openerCounts = new Map<string, number>();
  for (const s of sentences) {
    const w = words(s)[0];
    if (w && !STOPWORDS.has(w)) {
      openerCounts.set(w, (openerCounts.get(w) ?? 0) + 1);
    }
  }
  const topOpeners = topEntries(openerCounts, 2, 4).map(([w]) => w);

  const sentencePatterns = [
    `Averages ${avgLen.toFixed(1)} words per sentence across ${sentences.length} sentence${sentences.length === 1 ? "" : "s"}.`,
    shortCount ? `${pct(shortCount)}% are short fragments (5 words or fewer).` : null,
    longCount ? `${pct(longCount)}% run long (25+ words).` : null,
    `Em dashes in ${pct(emDash)}% of sentences, ${pct(exclaim)}% end in "!", ${pct(question)}% are questions.`,
    semicolon ? `${semicolon} semicolon${semicolon === 1 ? "" : "s"} total.` : "Never uses semicolons.",
    `${contractions} contraction${contractions === 1 ? "" : "s"} across the samples.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    tone:
      "Statistical mode can't read tone or attitude — that needs semantic understanding, not sentence counting. Add an Anthropic/OpenAI key in Settings, or run Ollama locally, for a real tone read.",
    sentence_patterns: sentencePatterns,
    recurring_phrases: recurring.length
      ? recurring.join(", ")
      : "Nothing repeated across these samples — add more text to find real patterns.",
    avoid: topOpeners.length
      ? `Sentences rarely open with anything besides: ${topOpeners.join(", ")}.`
      : "Not enough data yet to say what this writing avoids.",
  };
}
