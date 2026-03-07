import { Database } from "bun:sqlite"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function initDb(): Database {
  const dataDir = path.join(__dirname, "..", "data")
  fs.mkdirSync(dataDir, { recursive: true })
  const dbPath = path.join(dataDir, "flags.db")
  const db = new Database(dbPath, { create: true })

  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      environment TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      rollout_percentage INTEGER NOT NULL DEFAULT 0,
      users TEXT,
      UNIQUE(key, environment)
    )
  `)

  return db
}

export interface FlagRow {
  id: string
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
