import type { Database } from "bun:sqlite"

import type { CreateFlagInput, UpdateFlagInput } from "@openflagsdev/types"
import { nanoid } from "nanoid"

import * as auth from "./auth.js"
import { rowToFlag, type FlagRow } from "./db.js"
import { getProjectById, getProjectBySlug } from "./projects.js"

export async function handleFlagsList(
  db: Database,
  projectIdOrSlug: string
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id

  const rows = db.query("SELECT * FROM flags WHERE project_id = ?").all(projectId) as FlagRow[]

  // We compute the "effective" users array for each flag.
  // It's the union of the flag's explicit users and the users in its assigned segments.
  const flags = rows.map((row) => {
    const flag = rowToFlag(row)
    let effectiveUsers = new Set<string>(flag.users ?? [])

    if (flag.segments && flag.segments.length > 0) {
      const placeholders = flag.segments.map(() => "?").join(",")
      const segmentRows = db
        .query(`SELECT users FROM segments WHERE id IN (${placeholders})`)
        .all(...flag.segments) as { users: string | null }[]

      for (const sRow of segmentRows) {
        if (sRow.users) {
          const sUsers = JSON.parse(sRow.users) as string[]
          for (const u of sUsers) effectiveUsers.add(u)
        }
      }
    }

    flag.users = Array.from(effectiveUsers)
    return flag
  })

  return { body: flags, status: 200 }
}

export async function handleFlagsCreate(
  db: Database,
  projectIdOrSlug: string,
  userId: string,
  body: CreateFlagInput
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  if (!body.key?.trim()) return { body: { error: "key is required" }, status: 400 }

  const id = nanoid()
  const enabled = body.enabled ?? false
  const rolloutPercentage = Math.min(100, Math.max(0, body.rolloutPercentage ?? 0))
  const usersJson = JSON.stringify(body.users ?? [])
  const segmentsJson =
    body.segments && body.segments.length > 0 ? JSON.stringify(body.segments) : null

  try {
    db.run(
      "INSERT INTO flags (id, project_id, key, enabled, rollout_percentage, users, segments) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, projectId, body.key.trim(), enabled ? 1 : 0, rolloutPercentage, usersJson, segmentsJson]
    )
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    const isUnique =
      // @ts-ignore
      e.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      (typeof e.message === "string" &&
        (e.message.includes("UNIQUE") || e.message.includes("constraint failed")))
    if (isUnique) {
      return { body: { error: "Flag with this key already exists" }, status: 409 }
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
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  const row = db
    .query("SELECT * FROM flags WHERE id = ? AND project_id = ?")
    .get(flagId, projectId) as FlagRow | null
  if (!row) return { body: { error: "Flag not found" }, status: 404 }

  const enabled = body.enabled !== undefined ? body.enabled : row.enabled === 1
  const rolloutPercentage =
    body.rolloutPercentage !== undefined
      ? Math.min(100, Math.max(0, body.rolloutPercentage))
      : row.rollout_percentage

  const users =
    body.users !== undefined ? body.users : row.users ? (JSON.parse(row.users) as string[]) : []
  const usersJson = JSON.stringify(users)

  let segmentsJson: string | null = row.segments
  if (body.segments !== undefined) {
    segmentsJson = body.segments.length > 0 ? JSON.stringify(body.segments) : null
  }

  db.run(
    "UPDATE flags SET enabled = ?, rollout_percentage = ?, users = ?, segments = ? WHERE id = ?",
    [enabled ? 1 : 0, rolloutPercentage, usersJson, segmentsJson, flagId]
  )

  const updated = db.query("SELECT * FROM flags WHERE id = ?").get(flagId) as FlagRow
  return { body: rowToFlag(updated), status: 200 }
}

export async function handleFlagDelete(
  db: Database,
  projectIdOrSlug: string,
  flagId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  const projectId = project.id
  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  const row = db
    .query("SELECT id FROM flags WHERE id = ? AND project_id = ?")
    .get(flagId, projectId)
  if (!row) return { body: { error: "Flag not found" }, status: 404 }

  db.run("DELETE FROM flags WHERE id = ?", [flagId])
  return { body: { ok: true }, status: 200 }
}
