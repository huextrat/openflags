import { Database } from "bun:sqlite"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const USERS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

const SESSIONS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

const PROJECTS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

const PROJECT_MEMBERS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS project_members (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (project_id, user_id)
  )
`

const FLAGS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS flags (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    environment TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0,
    rollout_percentage INTEGER NOT NULL DEFAULT 0,
    users TEXT,
    UNIQUE(project_id, key, environment)
  )
`

const SCHEMA_VERSION_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL DEFAULT 0
  )
`

function getCurrentVersion(db: Database): number {
  const rows = db.query("SELECT version FROM schema_version LIMIT 1").all() as { version: number }[]
  return rows.length > 0 ? rows[0].version : 0
}

function setVersion(db: Database, version: number): void {
  const rows = db.query("SELECT 1 FROM schema_version LIMIT 1").all()
  if (rows.length === 0) {
    db.run("INSERT INTO schema_version (version) VALUES (?)", [version])
  } else {
    db.run("UPDATE schema_version SET version = ?", [version])
  }
}

type MigrationFn = (db: Database) => void

/**
 * Migrations run in order at startup. To add a new one: append a function that updates
 * the schema and is idempotent when possible (e.g. IF NOT EXISTS, or check column exists).
 * Version is persisted in schema_version; only migrations with index + 1 > current version run.
 */
const MIGRATIONS: MigrationFn[] = [
  (db) => {
    db.run(USERS_SCHEMA)
    db.run(SESSIONS_SCHEMA)
    db.run(PROJECTS_SCHEMA)
    db.run(PROJECT_MEMBERS_SCHEMA)
    db.run(FLAGS_SCHEMA)
  },
]

function runMigrations(db: Database): void {
  let version = getCurrentVersion(db)
  for (let i = 0; i < MIGRATIONS.length; i++) {
    const nextVersion = i + 1
    if (version < nextVersion) {
      MIGRATIONS[i](db)
      setVersion(db, nextVersion)
      version = nextVersion
    }
  }
}

export function initDb(): Database {
  const dataDir = path.join(__dirname, "..", "data")
  fs.mkdirSync(dataDir, { recursive: true })
  const dbPath = path.join(dataDir, "flags.db")
  const db = new Database(dbPath, { create: true })

  db.run(SCHEMA_VERSION_TABLE)
  const hasVersionRow = (db.query("SELECT 1 FROM schema_version LIMIT 1").all() as unknown[]).length > 0
  if (!hasVersionRow) {
    db.run("INSERT INTO schema_version (version) VALUES (0)")
  }
  runMigrations(db)

  return db
}

/** In-memory DB with same schema; for tests only. */
export function createMemoryDb(): Database {
  const db = new Database(":memory:")
  db.run(USERS_SCHEMA)
  db.run(SESSIONS_SCHEMA)
  db.run(PROJECTS_SCHEMA)
  db.run(PROJECT_MEMBERS_SCHEMA)
  db.run(FLAGS_SCHEMA)
  return db
}

export interface UserRow {
  id: string
  email: string
  password_hash: string
  created_at: string
}

export interface SessionRow {
  id: string
  user_id: string
  expires_at: string
  created_at: string
}

export interface ProjectRow {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ProjectMemberRow {
  project_id: string
  user_id: string
  role: string
  created_at: string
}

export interface FlagRow {
  id: string
  project_id: string
  key: string
  environment: string
  enabled: number
  rollout_percentage: number
  users: string | null
}

export function rowToFlag(row: FlagRow): {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  environment: string
  users?: string[]
} {
  return {
    id: row.id,
    key: row.key,
    environment: row.environment,
    enabled: row.enabled === 1,
    rolloutPercentage: row.rollout_percentage,
    ...(row.users ? { users: JSON.parse(row.users) as string[] } : {}),
  }
}
