import { db } from "@/lib/db";

export type Job = {
  id: number;
  tool: string;
  status: "queued" | "running" | "done" | "failed";
  input: string | null;
  log: string;
  output_path: string | null;
  created_at: string;
  updated_at: string;
};

export function createJob(tool: string, input: string): number {
  const result = db
    .prepare("INSERT INTO jobs (tool, input) VALUES (?, ?)")
    .run(tool, input);
  return Number(result.lastInsertRowid);
}

export function updateJob(
  id: number,
  fields: Partial<Pick<Job, "status" | "log" | "output_path">>
) {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(fields)) {
    sets.push(`${key} = ?`);
    values.push(value);
  }
  sets.push("updated_at = datetime('now')");
  db.prepare(`UPDATE jobs SET ${sets.join(", ")} WHERE id = ?`).run(
    ...values,
    id
  );
}

export function appendJobLog(id: number, line: string) {
  db.prepare(
    "UPDATE jobs SET log = log || ? || char(10), updated_at = datetime('now') WHERE id = ?"
  ).run(line, id);
}

export function getJob(id: number): Job | undefined {
  return db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as
    | Job
    | undefined;
}

export function listJobs(tool?: string): Job[] {
  if (tool) {
    return db
      .prepare("SELECT * FROM jobs WHERE tool = ? ORDER BY id DESC")
      .all(tool) as Job[];
  }
  return db.prepare("SELECT * FROM jobs ORDER BY id DESC").all() as Job[];
}
