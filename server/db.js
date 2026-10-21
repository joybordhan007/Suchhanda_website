"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_sqlite_1 = require("node:sqlite");
const config_ts_1 = require("./config.ts");
(0, node_fs_1.mkdirSync)(config_ts_1.config.dataDir, { recursive: true });
(0, node_fs_1.mkdirSync)(config_ts_1.config.uploadsDir, { recursive: true });
exports.db = new node_sqlite_1.DatabaseSync((0, node_path_1.join)(config_ts_1.config.dataDir, "site.db"));
exports.db.exec(`
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
`);
// First-party visit statistics for the dashboard. `visitor` is a daily-changing hash,
// so visitors can be counted per day without storing IP addresses or cookies.
exports.db.exec(`
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
`);
// Columns added after the first release; existing databases get them on start-up.
const adminColumns = exports.db.prepare("PRAGMA table_info(admins)").all().map((column) => column.name);
if (!adminColumns.includes("name"))
    exports.db.exec("ALTER TABLE admins ADD COLUMN name TEXT NOT NULL DEFAULT ''");
if (!adminColumns.includes("avatar"))
    exports.db.exec("ALTER TABLE admins ADD COLUMN avatar TEXT NOT NULL DEFAULT ''");
