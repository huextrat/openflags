import { Database } from "bun:sqlite"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

/**
 * Executes a raw SQL script strictly by splitting on semicolons.
 */
function runSqlScript(db: Database, script: string): void {
  const statements = script
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  db.transaction(() => {
    for (const stmt of statements) {
      db.run(stmt)
    }
  })()
}

/**
 * Reads all .sql files from the migrations folder in ascending order,
 * and runs any that have an index (e.g. 1 from "1_init.sql") > current version.
 */
function runMigrations(db: Database): void {
  const migrationsDir = path.join(__dirname, "migrations")

  if (!fs.existsSync(migrationsDir)) {
    return
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .toSorted()

  let currentVersion = getCurrentVersion(db)

  for (const file of files) {
    const match = file.match(/^(\d+)_.*\.sql$/)
    if (!match) continue

    const migrationVersion = parseInt(match[1], 10)

    if (migrationVersion > currentVersion) {
      const script = fs.readFileSync(path.join(migrationsDir, file), "utf-8")
      runSqlScript(db, script)
      setVersion(db, migrationVersion)
      currentVersion = migrationVersion
    }
  }
}

export function initDb(): Database {
  const dataDir = path.join(__dirname, "..", "data")
  fs.mkdirSync(dataDir, { recursive: true })
  const dbPath = path.join(dataDir, "flags.db")
  const db = new Database(dbPath, { create: true })

  db.run(SCHEMA_VERSION_TABLE)
  const hasVersionRow =
    (db.query("SELECT 1 FROM schema_version LIMIT 1").all() as unknown[]).length > 0
  if (!hasVersionRow) {
    db.run("INSERT INTO schema_version (version) VALUES (0)")
  }
  runMigrations(db)

  return db
}

/** In-memory DB with same schema; for tests only. */
export function createMemoryDb(): Database {
  const db = new Database(":memory:")
  db.run(SCHEMA_VERSION_TABLE)
  db.run("INSERT INTO schema_version (version) VALUES (0)")
  runMigrations(db)
  return db
}

export interface UserRow {
  id: string
  email: string
  password_hash: string
  role: string
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

export interface FlagRow {
  id: string
  project_id: string
  key: string
  enabled: number
  rollout_percentage: number
  users: string | null
  segments: string | null
}

export interface SegmentRow {
  id: string
  project_id: string
  name: string
  users: string | null
  created_at: string
}

export function rowToFlag(row: FlagRow): {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  users?: string[]
  segments?: string[]
} {
  return {
    id: row.id,
    key: row.key,
    enabled: row.enabled === 1,
    rolloutPercentage: row.rollout_percentage,
    ...(row.users ? { users: JSON.parse(row.users) as string[] } : {}),
    ...(row.segments ? { segments: JSON.parse(row.segments) as string[] } : {}),
  }
}
