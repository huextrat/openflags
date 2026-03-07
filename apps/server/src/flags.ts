import type { Database } from "bun:sqlite"

import type { CreateFlagInput, UpdateFlagInput } from "@openflags/types"
import { nanoid } from "nanoid"

import { rowToFlag, type FlagRow } from "./db.js"

export async function handleFlags(
  req: Request,
  db: Database,
  pathname: string
): Promise<{ body: unknown; status: number }> {
  const method = req.method
  const url = new URL(req.url)

  if (pathname === "/flags" && method === "GET") {
    const environment = url.searchParams.get("environment") ?? undefined
    const rows = environment
      ? (db.query("SELECT * FROM flags WHERE environment = ?").all(environment) as FlagRow[])
      : (db.query("SELECT * FROM flags").all() as FlagRow[])
    const flags = rows.map(rowToFlag)
    return { body: flags, status: 200 }
  }

  if (pathname === "/flags" && method === "POST") {
    const body = (await req.json()) as CreateFlagInput
    if (!body.key?.trim()) {
      return { body: { error: "key is required" }, status: 400 }
    }
    if (!body.environment?.trim()) {
      return { body: { error: "environment is required" }, status: 400 }
    }
    const id = nanoid()
    const enabled = body.enabled ?? false
    const rolloutPercentage = Math.min(100, Math.max(0, body.rolloutPercentage ?? 0))
    const users = body.users ?? []
    const usersJson = JSON.stringify(users)
    try {
      db.run(
        "INSERT INTO flags (id, key, environment, enabled, rollout_percentage, users) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          body.key.trim(),
          body.environment.trim(),
          enabled ? 1 : 0,
          rolloutPercentage,
          usersJson,
        ]
      )
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return { body: { error: "Flag with this key and environment already exists" }, status: 409 }
      }
      throw err
    }
    const row = db.query("SELECT * FROM flags WHERE id = ?").get(id) as FlagRow
    return { body: rowToFlag(row), status: 201 }
  }

  const match = pathname.match(/^\/flags\/([^/]+)$/)
  if (match && method === "PATCH") {
    const id = decodeURIComponent(match[1])
    const body = (await req.json()) as UpdateFlagInput
    const row = db.query("SELECT * FROM flags WHERE id = ?").get(id) as FlagRow | null
    if (!row) {
      return { body: { error: "Flag not found" }, status: 404 }
    }
    const enabled = body.enabled !== undefined ? body.enabled : row.enabled === 1
    const rolloutPercentage =
      body.rolloutPercentage !== undefined
        ? Math.min(100, Math.max(0, body.rolloutPercentage))
        : row.rollout_percentage
    const users = body.users !== undefined ? body.users : row.users ? JSON.parse(row.users) : []
    const usersJson = JSON.stringify(users)
    db.run("UPDATE flags SET enabled = ?, rollout_percentage = ?, users = ? WHERE id = ?", [
      enabled ? 1 : 0,
      rolloutPercentage,
      usersJson,
      id,
    ])
    const updated = db.query("SELECT * FROM flags WHERE id = ?").get(id) as FlagRow
    return { body: rowToFlag(updated), status: 200 }
  }

  return { body: { error: "Not Found" }, status: 404 }
}
