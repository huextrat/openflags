import type { Database } from "bun:sqlite"

import type { CreateSegmentInput, UpdateSegmentInput } from "@openflagsdev/types"
import { Segment } from "@openflagsdev/types"
import { nanoid } from "nanoid"

import type { SegmentRow } from "./db.js"
import * as auth from "./auth.js"
import { getProjectById, getProjectBySlug } from "./projects.js"

function rowToSegment(row: SegmentRow): Segment {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    createdAt: row.created_at,
    ...(row.users ? { users: JSON.parse(row.users) as string[] } : {}),
  }
}

export async function handleSegmentsList(
  db: Database,
  projectIdOrSlug: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }

  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  const rows = db
    .query("SELECT * FROM segments WHERE project_id = ?")
    .all(project.id) as SegmentRow[]
  const segments = rows.map(rowToSegment)
  return { body: segments, status: 200 }
}

export async function handleSegmentCreate(
  db: Database,
  projectIdOrSlug: string,
  userId: string,
  body: CreateSegmentInput
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }

  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  if (!body.name?.trim()) return { body: { error: "name is required" }, status: 400 }

  const id = nanoid()
  const users = body.users ?? []
  const usersJson = JSON.stringify(users)

  db.run("INSERT INTO segments (id, project_id, name, users) VALUES (?, ?, ?, ?)", [
    id,
    project.id,
    body.name.trim(),
    usersJson,
  ])

  const row = db.query("SELECT * FROM segments WHERE id = ?").get(id) as SegmentRow
  return { body: rowToSegment(row), status: 201 }
}

export async function handleSegmentUpdate(
  db: Database,
  projectIdOrSlug: string,
  segmentId: string,
  userId: string,
  body: UpdateSegmentInput
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }

  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  const row = db
    .query("SELECT * FROM segments WHERE id = ? AND project_id = ?")
    .get(segmentId, project.id) as SegmentRow | null

  if (!row) return { body: { error: "Segment not found" }, status: 404 }

  const name = body.name !== undefined ? body.name.trim() : row.name
  if (!name) return { body: { error: "name cannot be empty" }, status: 400 }

  const users =
    body.users !== undefined ? body.users : row.users ? (JSON.parse(row.users) as string[]) : []
  const usersJson = JSON.stringify(users)

  db.run("UPDATE segments SET name = ?, users = ? WHERE id = ?", [name, usersJson, segmentId])

  const updated = db.query("SELECT * FROM segments WHERE id = ?").get(segmentId) as SegmentRow
  return { body: rowToSegment(updated), status: 200 }
}

export async function handleSegmentDelete(
  db: Database,
  projectIdOrSlug: string,
  segmentId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  const project =
    (await getProjectById(db, projectIdOrSlug)) ?? (await getProjectBySlug(db, projectIdOrSlug))
  if (!project) return { body: { error: "Project not found" }, status: 404 }

  if (!auth.requireCanCreateProject(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }

  const row = db
    .query("SELECT id FROM segments WHERE id = ? AND project_id = ?")
    .get(segmentId, project.id)
  if (!row) return { body: { error: "Segment not found" }, status: 404 }

  db.run("DELETE FROM segments WHERE id = ?", [segmentId])
  return { body: { ok: true }, status: 200 }
}
