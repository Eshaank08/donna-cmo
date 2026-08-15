// Pure, client-safe data — no db import here. Keep it that way; see CLAUDE.md
// on why a client component must never import a module that pulls in
// better-sqlite3 (idea-gate-gates.ts is the established fix pattern this
// file follows).

export const COLUMNS = [
  { key: "idea", title: "Idea" },
  { key: "scripting", title: "Scripting" },
  { key: "ready_to_shoot", title: "Ready to shoot" },
  { key: "posted", title: "Posted" },
] as const;

export type ColumnKey = (typeof COLUMNS)[number]["key"];
