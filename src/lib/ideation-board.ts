import { db } from "@/lib/db";
import { COLUMNS, type ColumnKey } from "@/lib/ideation-board-columns";

export { COLUMNS, type ColumnKey };

export type IdeationCard = {
  id: number;
  title: string;
  notes: string;
  status: ColumnKey;
  created_at: string;
  updated_at: string;
};

type CardRow = {
  id: number;
  title: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToCard(row: CardRow): IdeationCard {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    status: (COLUMNS.some((c) => c.key === row.status)
      ? row.status
      : COLUMNS[0].key) as ColumnKey,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function listCards(): IdeationCard[] {
  const rows = db
    .prepare("SELECT * FROM ideation_cards ORDER BY id DESC")
    .all() as CardRow[];
  return rows.map(rowToCard);
}

export function createCard(
  title: string,
  notes: string,
  status: ColumnKey = "idea"
): IdeationCard {
  const result = db
    .prepare(
      `INSERT INTO ideation_cards (title, notes, status) VALUES (?, ?, ?)`
    )
    .run(title, notes, status);
  const row = db
    .prepare("SELECT * FROM ideation_cards WHERE id = ?")
    .get(result.lastInsertRowid) as CardRow;
  return rowToCard(row);
}

export function moveCard(id: number, direction: "next" | "prev"): void {
  const row = db
    .prepare("SELECT * FROM ideation_cards WHERE id = ?")
    .get(id) as CardRow | undefined;
  if (!row) return;

  const currentIndex = COLUMNS.findIndex((c) => c.key === row.status);
  const nextIndex =
    direction === "next"
      ? Math.min(currentIndex + 1, COLUMNS.length - 1)
      : Math.max(currentIndex - 1, 0);
  if (nextIndex === currentIndex) return;

  db.prepare(
    `UPDATE ideation_cards SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(COLUMNS[nextIndex].key, id);
}

export function deleteCard(id: number): void {
  db.prepare("DELETE FROM ideation_cards WHERE id = ?").run(id);
}
