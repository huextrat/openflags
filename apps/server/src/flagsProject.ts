import type { Database } from "bun:sqlite"

import type { CreateFlagInput, UpdateFlagInput } from "@openflags/types"
import { nanoid } from "nanoid"

import { rowToFlag, type FlagRow } from "./db.js"
import { getProjectById, getProjectBySlug, requireProjectRole } from "./projects.js"

export async function handleFlagsList(
  db: Database,
  projectIdOrSlug: string,
  environment?: string
): Promise<{ body: unknown; status: number }> {
  const project = (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  const rows = environment
    ? (db
        .query("SELECT * FROM flags WHERE project_id = ? AND environment = ?")
        .all(projectId, environment) as FlagRow[])
    : (db.query("SELECT * FROM flags WHERE project_id = ?").all(projectId) as FlagRow[])
  const flags = rows.map(rowToFlag)
  return { body: flags, status: 200 }
}

export async function handleFlagsCreate(
  db: Database,
  projectIdOrSlug: string,
  userId: string,
  body: CreateFlagInput
): Promise<{ body: unknown; status: number }> {
  const project = (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!requireProjectRole(db, projectId, userId, ["admin", "member"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  if (!body.key?.trim()) return { body: { error: "key is required" }, status: 400 }
  if (!body.environment?.trim()) return { body: { error: "environment is required" }, status: 400 }
  const id = nanoid()
  const enabled = body.enabled ?? false
  const rolloutPercentage = Math.min(100, Math.max(0, body.rolloutPercentage ?? 0))
  const users = body.users ?? []
  const usersJson = JSON.stringify(users)
  try {
    db.run(
      "INSERT INTO flags (id, project_id, key, environment, enabled, rollout_percentage, users) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, projectId, body.key.trim(), body.environment.trim(), enabled ? 1 : 0, rolloutPercentage, usersJson]
    )
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    const isUnique =
      e.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      (typeof e.message === "string" && (e.message.includes("UNIQUE") || e.message.includes("constraint failed")))
    if (isUnique) {
      return { body: { error: "Flag with this key and environment already exists" }, status: 409 }
    }
    throw err
  }
  const row = db.query("SELECT * FROM flags WHERE id = ?").get(id) as FlagRow
  return { body: rowToFlag(row), status: 201 }
}

export async function handleFlagUpdate(
  db: Database,
  projectIdOrSlug: string,
  flagId: string,
  userId: string,
  body: UpdateFlagInput
): Promise<{ body: unknown; status: number }> {
  const project = (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!requireProjectRole(db, projectId, userId, ["admin", "member"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const row = db.query("SELECT * FROM flags WHERE id = ? AND project_id = ?").get(flagId, projectId) as FlagRow | null
  if (!row) return { body: { error: "Flag not found" }, status: 404 }
  const enabled = body.enabled !== undefined ? body.enabled : row.enabled === 1
  const rolloutPercentage =
    body.rolloutPercentage !== undefined
      ? Math.min(100, Math.max(0, body.rolloutPercentage))
      : row.rollout_percentage
  const users = body.users !== undefined ? body.users : row.users ? (JSON.parse(row.users) as string[]) : []
  const usersJson = JSON.stringify(users)
  db.run("UPDATE flags SET enabled = ?, rollout_percentage = ?, users = ? WHERE id = ?", [
    enabled ? 1 : 0,
    rolloutPercentage,
    usersJson,
    flagId,
  ])
  const updated = db.query("SELECT * FROM flags WHERE id = ?").get(flagId) as FlagRow
  return { body: rowToFlag(updated), status: 200 }
}

export async function handleFlagDelete(
  db: Database,
  projectIdOrSlug: string,
  flagId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  const project = (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!requireProjectRole(db, projectId, userId, ["admin", "member"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const row = db.query("SELECT id FROM flags WHERE id = ? AND project_id = ?").get(flagId, projectId)
  if (!row) return { body: { error: "Flag not found" }, status: 404 }
  db.run("DELETE FROM flags WHERE id = ?", [flagId])
  return { body: { ok: true }, status: 200 }
}
