import type { Database } from "bun:sqlite"
import { nanoid } from "nanoid"
import type { ProjectRow, UserRow } from "./db.js"

export type ProjectMemberRole = "admin" | "member" | "viewer"

export async function getProjectsForUser(db: Database, userId: string): Promise<ProjectRow[]> {
  return db
    .query(
      "SELECT p.id, p.name, p.slug, p.created_at FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ? ORDER BY p.name"
    )
    .all(userId) as ProjectRow[]
}

export async function getProjectById(db: Database, projectId: string): Promise<ProjectRow | null> {
  return db.query("SELECT id, name, slug, created_at FROM projects WHERE id = ?").get(projectId) as ProjectRow | null
}

export async function getProjectBySlug(db: Database, slug: string): Promise<ProjectRow | null> {
  return db.query("SELECT id, name, slug, created_at FROM projects WHERE slug = ?").get(slug) as ProjectRow | null
}

export function getMemberRole(db: Database, projectId: string, userId: string): ProjectMemberRole | null {
  const row = db
    .query("SELECT role FROM project_members WHERE project_id = ? AND user_id = ?")
    .get(projectId, userId) as { role: string } | undefined
  return (row?.role as ProjectMemberRole) ?? null
}

export function requireProjectRole(
  db: Database,
  projectId: string,
  userId: string,
  allowed: ProjectMemberRole[]
): boolean {
  const role = getMemberRole(db, projectId, userId)
  return role !== null && allowed.includes(role)
}

export async function createProject(
  db: Database,
  userId: string,
  body: { name?: string; slug?: string }
): Promise<{ body: unknown; status: number }> {
  const name = body.name?.trim()
  const slug = (body.slug?.trim() || name?.toLowerCase().replace(/\s+/g, "-")) || "project"
  if (!name) return { body: { error: "name is required" }, status: 400 }
  const id = nanoid()
  try {
    db.run("INSERT INTO projects (id, name, slug) VALUES (?, ?, ?)", [id, name, slug])
    db.run("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)", [id, userId, "admin"])
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (typeof e.message === "string" && e.message.includes("UNIQUE")) {
      return { body: { error: "A project with this slug already exists" }, status: 409 }
    }
    throw err
  }
  const project = db.query("SELECT id, name, slug, created_at FROM projects WHERE id = ?").get(id) as ProjectRow
  return { body: project, status: 201 }
}

export async function getProject(
  db: Database,
  projectId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  const project = await getProjectById(db, projectId)
  if (!project) return { body: { error: "Project not found" }, status: 404 }
  if (!requireProjectRole(db, projectId, userId, ["admin", "member", "viewer"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  return { body: project, status: 200 }
}

export async function listMembers(
  db: Database,
  projectId: string,
  userId: string
): Promise<{ body: unknown; status: number }> {
  if (!requireProjectRole(db, projectId, userId, ["admin", "member", "viewer"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const rows = db
    .query(
      "SELECT u.id, u.email, pm.role FROM users u JOIN project_members pm ON pm.user_id = u.id WHERE pm.project_id = ?"
    )
    .all(projectId) as { id: string; email: string; role: string }[]
  return { body: rows, status: 200 }
}

export async function inviteMember(
  db: Database,
  projectId: string,
  userId: string,
  body: { email?: string; role?: string }
): Promise<{ body: unknown; status: number }> {
  if (!requireProjectRole(db, projectId, userId, ["admin"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const email = body.email?.trim().toLowerCase()
  const role = (body.role === "admin" || body.role === "member" || body.role === "viewer" ? body.role : "member") as ProjectMemberRole
  if (!email) return { body: { error: "email is required" }, status: 400 }
  const targetUser = db.query("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined
  if (!targetUser) {
    return { body: { error: "No account found with this email" }, status: 404 }
  }
  try {
    db.run("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)", [projectId, targetUser.id, role])
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (typeof e.message === "string" && e.message.includes("UNIQUE")) {
      return { body: { error: "User is already a member" }, status: 409 }
    }
    throw err
  }
  const member = db
    .query("SELECT u.id, u.email, pm.role FROM users u JOIN project_members pm ON pm.user_id = u.id WHERE pm.project_id = ? AND pm.user_id = ?")
    .get(projectId, targetUser.id) as { id: string; email: string; role: string }
  return { body: member, status: 201 }
}

export async function removeMember(
  db: Database,
  projectId: string,
  userId: string,
  targetUserId: string
): Promise<{ body: unknown; status: number }> {
  if (!requireProjectRole(db, projectId, userId, ["admin"])) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const result = db.run("DELETE FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, targetUserId])
  if (result.changes === 0) return { body: { error: "Member not found" }, status: 404 }
  return { body: { ok: true }, status: 200 }
}
