import type { Database } from "bun:sqlite"

import { nanoid } from "nanoid"

import type { ProjectRow } from "./db.js"
import * as auth from "./auth.js"

export async function getAllProjects(db: Database): Promise<ProjectRow[]> {
  return db
    .query("SELECT id, name, slug, created_at FROM projects ORDER BY name")
    .all() as ProjectRow[]
}

export async function getProjectById(db: Database, projectId: string): Promise<ProjectRow | null> {
  return db
    .query("SELECT id, name, slug, created_at FROM projects WHERE id = ?")
    .get(projectId) as ProjectRow | null
}

export async function getProjectBySlug(db: Database, slug: string): Promise<ProjectRow | null> {
  return db
    .query("SELECT id, name, slug, created_at FROM projects WHERE slug = ?")
    .get(slug) as ProjectRow | null
}

export async function createProject(
  db: Database,
  _userId: string,
  body: { name?: string; slug?: string }
): Promise<{ body: unknown; status: number }> {
  const name = body.name?.trim()
  const slug = body.slug?.trim() || name?.toLowerCase().replace(/\s+/g, "-") || "project"
  if (!name) return { body: { error: "name is required" }, status: 400 }
  const id = nanoid()
  try {
    db.run("INSERT INTO projects (id, name, slug) VALUES (?, ?, ?)", [id, name, slug])
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (typeof e.message === "string" && e.message.includes("UNIQUE")) {
      return { body: { error: "A project with this slug already exists" }, status: 409 }
    }
    throw err
  }
  const project = db
    .query("SELECT id, name, slug, created_at FROM projects WHERE id = ?")
    .get(id) as ProjectRow
  return { body: project, status: 201 }
}

export async function getProject(
  db: Database,
  projectId: string,
  _userId: string
): Promise<{ body: unknown; status: number }> {
  const project = await getProjectById(db, projectId)
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  return { body: project, status: 200 }
}

export async function deleteProject(
  db: Database,
  projectId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  if (!auth.requirePlatformAdmin(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const project = getProjectById(db, projectId)
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  db.run("DELETE FROM projects WHERE id = ?", [projectId])
  return { body: { ok: true }, status: 200 }
}
