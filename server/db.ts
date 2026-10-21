import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { config } from "./config.ts"

// The few SQLite calls the server uses; node:sqlite and better-sqlite3 both provide them.
type Statement = {
  get(...params: unknown[]): unknown
  all(...params: unknown[]): unknown[]
  run(...params: unknown[]): unknown
}
export type Database = {
  exec(sql: string): void
  prepare(sql: string): Statement
}

// Node 22.13+ has SQLite built in. Older Node versions (e.g. the Node 20 offered by many
// cPanel hosts) use the better-sqlite3 package instead; the database file is the same.
async function openDatabase(file: string): Promise<Database> {
  try {
    const { DatabaseSync } = await import("node:sqlite")
    return new DatabaseSync(file) as unknown as Database
  } catch (builtInError) {
    // A variable keeps TypeScript from requiring the optional package's types.
    const fallback = "better-sqlite3"
    try {
      const { default: BetterSqlite } = await import(fallback)
      return new BetterSqlite(file) as Database
    } catch {
      throw new Error(
        `No SQLite driver: this Node.js (${process.version}) has no built-in node:sqlite and the better-sqlite3 package is not installed. ` +
          "Run `npm install` in the app folder, or choose Node.js 22.13 or newer. " +
          `(node:sqlite: ${builtInError instanceof Error ? builtInError.message : String(builtInError)})`,
      )
    }
  }
}

mkdirSync(config.dataDir, { recursive: true })
mkdirSync(config.uploadsDir, { recursive: true })

export const db = await openDatabase(join(config.dataDir, "site.db"))

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0
  );
`)

// First-party visit statistics for the dashboard. `visitor` is a daily-changing hash,
// so visitors can be counted per day without storing IP addresses or cookies.
db.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    path TEXT NOT NULL,
    source TEXT NOT NULL,
    visitor TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS page_views_day ON page_views(day);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

// Columns added after the first release; existing databases get them on start-up.
const adminColumns = (db.prepare("PRAGMA table_info(admins)").all() as { name: string }[]).map((column) => column.name)
if (!adminColumns.includes("name")) db.exec("ALTER TABLE admins ADD COLUMN name TEXT NOT NULL DEFAULT ''")
if (!adminColumns.includes("avatar")) db.exec("ALTER TABLE admins ADD COLUMN avatar TEXT NOT NULL DEFAULT ''")
