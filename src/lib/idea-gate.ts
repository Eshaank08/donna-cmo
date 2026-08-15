import { db } from "@/lib/db";
import { GATES, type GateAnswer } from "@/lib/idea-gate-gates";

export { GATES, type GateAnswer };

export type IdeaCheck = {
  id: number;
  idea_text: string;
  hard_boundary_hit: boolean;
  gates: GateAnswer[];
  verdict: "YES" | "NO";
  created_at: string;
};

export type IdeaGateConfig = {
  hard_boundaries: string[];
  fingerprint_description: string;
};

export function getIdeaGateConfig(): IdeaGateConfig {
  const row = db
    .prepare(
      "SELECT hard_boundaries, fingerprint_description FROM idea_gate_config WHERE id = 1"
    )
    .get() as { hard_boundaries: string; fingerprint_description: string | null } | undefined;
  if (!row) return { hard_boundaries: [], fingerprint_description: "" };
  return {
    hard_boundaries: JSON.parse(row.hard_boundaries),
    fingerprint_description: row.fingerprint_description ?? "",
  };
}

export function saveIdeaGateConfig(config: IdeaGateConfig) {
  db.prepare(
    `INSERT INTO idea_gate_config (id, hard_boundaries, fingerprint_description, updated_at)
     VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       hard_boundaries = excluded.hard_boundaries,
       fingerprint_description = excluded.fingerprint_description,
       updated_at = excluded.updated_at`
  ).run(JSON.stringify(config.hard_boundaries), config.fingerprint_description);
}

export function checkIdea(
  ideaText: string,
  hardBoundaryHit: boolean,
  gateAnswers: GateAnswer[]
): IdeaCheck {
  const allPass =
    !hardBoundaryHit &&
    gateAnswers.length === GATES.length &&
    gateAnswers.every((g) => g.pass && g.proof.trim().length > 0);
  const verdict: "YES" | "NO" = allPass ? "YES" : "NO";

  const result = db
    .prepare(
      `INSERT INTO idea_checks (idea_text, hard_boundary_hit, gates, verdict)
       VALUES (?, ?, ?, ?)`
    )
    .run(ideaText, hardBoundaryHit ? 1 : 0, JSON.stringify(gateAnswers), verdict);

  return {
    id: Number(result.lastInsertRowid),
    idea_text: ideaText,
    hard_boundary_hit: hardBoundaryHit,
    gates: gateAnswers,
    verdict,
    created_at: new Date().toISOString(),
  };
}

export function listIdeaChecks(): IdeaCheck[] {
  const rows = db
    .prepare("SELECT * FROM idea_checks ORDER BY id DESC")
    .all() as {
    id: number;
    idea_text: string;
    hard_boundary_hit: number;
    gates: string;
    verdict: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    idea_text: r.idea_text,
    hard_boundary_hit: Boolean(r.hard_boundary_hit),
    gates: JSON.parse(r.gates),
    verdict: r.verdict as "YES" | "NO",
    created_at: r.created_at,
  }));
}
