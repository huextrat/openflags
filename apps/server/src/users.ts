import type { Database } from "bun:sqlite"

import { nanoid } from "nanoid"

import * as auth from "./auth.js"

export type PlatformRole = "admin" | "developer" | "member"

export async function listUsers(db: Database): Promise<{ body: unknown; status: number }> {
  const rows = db
    .query("SELECT id, email, role, created_at FROM users ORDER BY created_at ASC")
    .all() as { id: string; email: string; role: string; created_at: string }[]
  const users = rows.map((r) => ({ id: r.id, email: r.email, role: r.role }))
  return { body: users, status: 200 }
}

export async function inviteUser(
  db: Database,
  userId: string,
  body: { email?: string; role?: string }
): Promise<{ body: unknown; status: number }> {
  if (!auth.requirePlatformAdmin(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const email = body.email?.trim().toLowerCase()
  const role = (
    body.role === "admin" || body.role === "developer" || body.role === "member"
      ? body.role
      : "member"
  ) as PlatformRole
  if (!email) return { body: { error: "email is required" }, status: 400 }
  const existing = db.query("SELECT id FROM users WHERE email = ?").get(email) as
    | { id: string }
    | undefined
  if (existing) {
    return { body: { error: "An account with this email already exists" }, status: 409 }
  }
  const newUserId = nanoid()
  const tempPassword = nanoid(24)
  const passwordHash = await Bun.password.hash(tempPassword, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  })
  db.run("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)", [
    newUserId,
    email,
    passwordHash,
    role,
  ])
  const row = db.query("SELECT id, email, role FROM users WHERE id = ?").get(newUserId) as {
    id: string
    email: string
    role: string
  }
  return { body: row, status: 201 }
}

export async function updateUserRole(
  db: Database,
  userId: string,
  targetUserId: string,
  body: { role?: string }
): Promise<{ body: unknown; status: number }> {
  if (!auth.requirePlatformAdmin(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  const role =
    body.role === "admin" || body.role === "developer" || body.role === "member"
      ? body.role
      : undefined
  if (!role) return { body: { error: "role must be admin, developer, or member" }, status: 400 }
  const result = db.run("UPDATE users SET role = ? WHERE id = ?", [role, targetUserId])
  if (result.changes === 0) return { body: { error: "User not found" }, status: 404 }
  const row = db.query("SELECT id, email, role FROM users WHERE id = ?").get(targetUserId) as {
    id: string
    email: string
    role: string
  }
  return { body: row, status: 200 }
}

export async function removeUser(
  db: Database,
  userId: string,
  targetUserId: string
): Promise<{ body: unknown; status: number }> {
  if (!auth.requirePlatformAdmin(db, userId)) {
    return { body: { error: "Forbidden" }, status: 403 }
  }
  if (userId === targetUserId) {
    return { body: { error: "You cannot remove yourself" }, status: 400 }
  }
  const target = db.query("SELECT role FROM users WHERE id = ?").get(targetUserId) as
    | { role: string }
    | undefined
  if (!target) return { body: { error: "User not found" }, status: 404 }
  db.run("DELETE FROM sessions WHERE user_id = ?", [targetUserId])
  db.run("DELETE FROM users WHERE id = ?", [targetUserId])
  return { body: { ok: true }, status: 200 }
}
