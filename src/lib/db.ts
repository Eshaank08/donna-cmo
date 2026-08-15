import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "local");
const DB_PATH = path.join(DATA_DIR, "db.sqlite");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  var __donnaCmoDb: Database.Database | undefined;
}

function createDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      name TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS brand_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      product_name TEXT,
      icp TEXT,
      voice TEXT,
      positioning TEXT,
      primary_color TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      input TEXT,
      log TEXT NOT NULL DEFAULT '',
      output_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS idea_gate_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hard_boundaries TEXT NOT NULL DEFAULT '[]',
      fingerprint_description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS idea_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_text TEXT NOT NULL,
      hard_boundary_hit INTEGER NOT NULL DEFAULT 0,
      gates TEXT NOT NULL DEFAULT '[]',
      verdict TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS voice_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      samples TEXT NOT NULL DEFAULT '[]',
      tone TEXT,
      sentence_patterns TEXT,
      recurring_phrases TEXT,
      avoid TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS voice_humanize_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input_text TEXT NOT NULL,
      output_text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

export const db = globalThis.__donnaCmoDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__donnaCmoDb = db;
}

export const OUTPUT_DIR = path.join(DATA_DIR, "output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
