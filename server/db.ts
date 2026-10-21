import { mkdirSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"
import { config } from "./config.ts"

// The few SQLite calls the server uses.
type Statement = {
  get(...params: unknown[]): unknown
  all(...params: unknown[]): unknown[]
  run(...params: unknown[]): unknown
}
export type Database = {
  exec(sql: string): void
  prepare(sql: string): Statement
}

type WasmDatabase = {
  exec(sql: string): void
  get(sql: string, values: unknown[]): unknown
  all(sql: string, values: unknown[]): unknown[]
  run(sql: string, values: unknown[]): unknown
}

// Node 22.13+ has SQLite built in. Older Node versions (cPanel hosts offer Node 20 at most)
// use node-sqlite3-wasm: SQLite compiled to WebAssembly, so nothing has to be built on the
// host. The database file is the same either way.
async function openDatabase(file: string): Promise<Database> {
  try {
    const { DatabaseSync } = await import("node:sqlite")
    const db = new DatabaseSync(file) as unknown as Database
    db.exec("PRAGMA journal_mode = WAL;")
    return db
  } catch {
    const { default: sqliteWasm } = await import("node-sqlite3-wasm")
    removeStaleLock(file)
    const raw = new sqliteWasm.Database(file) as WasmDatabase
    // The WebAssembly build cannot share WAL memory between processes, so it uses a
    // rollback journal. A database last used in WAL mode is converted once here.
    raw.exec("PRAGMA busy_timeout = 5000;")
    raw.exec("PRAGMA locking_mode = EXCLUSIVE;")
    raw.get("PRAGMA journal_mode = DELETE;", [])
    raw.exec("PRAGMA locking_mode = NORMAL;")
    const retry = <T>(query: () => T): T => {
      try {
        return query()
      } catch (error) {
        if (!(error instanceof Error && /locked|busy/i.test(error.message)) || !removeStaleLock(file)) throw error
        return query()
      }
    }
    const db: Database = {
      exec: (sql) => retry(() => raw.exec(sql)),
      prepare: (sql) => ({
        get: (...values) => retry(() => raw.get(sql, values)) ?? undefined,
        all: (...values) => retry(() => raw.all(sql, values)),
        run: (...values) => retry(() => raw.run(sql, values)),
      }),
    }
    return db
  }
}

// node-sqlite3-wasm locks the database with a "<file>.lock" folder. A process killed while
// holding it leaves the folder behind; any lock older than a few seconds is such a leftover.
function removeStaleLock(file: string) {
  const lock = `${file}.lock`
  try {
    if (Date.now() - statSync(lock).mtimeMs < 15_000) return false
    rmSync(lock, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

mkdirSync(config.dataDir, { recursive: true })
mkdirSync(config.uploadsDir, { recursive: true })

export const db = await openDatabase(join(config.dataDir, "site.db"))

db.exec(`
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
