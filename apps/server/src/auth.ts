import type { Database } from "bun:sqlite"

import { nanoid } from "nanoid"

import type { UserRow } from "./db.js"

const SESSION_COOKIE_NAME = "openflags_session"
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function getSessionIdFromRequest(req: Request): string | null {
  const cookie = req.headers.get("Cookie")
  if (!cookie) return null
  const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[1].trim()) : null
}

export function setSessionCookieHeader(sessionId: string): string {
  const expires = new Date(Date.now() + SESSION_DURATION_MS)
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export async function getSessionUser(db: Database, req: Request): Promise<UserRow | null> {
  const sessionId = getSessionIdFromRequest(req)
  if (!sessionId) return null
  const row = db
    .query(
      "SELECT u.id, u.email, u.password_hash, u.role, u.created_at FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')"
    )
    .get(sessionId) as UserRow | undefined
  return row ?? null
}

export function requirePlatformAdmin(db: Database, userId: string): boolean {
  const row = db.query("SELECT role FROM users WHERE id = ?").get(userId) as
    | { role: string }
    | undefined
  return row?.role === "admin"
}

export function requireCanCreateProject(db: Database, userId: string): boolean {
  const row = db.query("SELECT role FROM users WHERE id = ?").get(userId) as
    | { role: string }
    | undefined
  return row?.role === "admin" || row?.role === "developer"
}

export async function requireAuth(
  db: Database,
  req: Request
): Promise<{ user: UserRow } | { body: unknown; status: number }> {
  const user = await getSessionUser(db, req)
  if (!user) {
    return { body: { error: "Unauthorized", message: "Not logged in" }, status: 401 }
  }
  return { user }
}

export async function signup(
  db: Database,
  body: { email?: string; password?: string }
): Promise<{ body: unknown; status: number; sessionId?: string }> {
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  if (!email) return { body: { error: "email is required" }, status: 400 }
  if (!password || password.length < 8) {
    return { body: { error: "password must be at least 8 characters" }, status: 400 }
  }
  const userId = nanoid()
  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  })
  const existingCount = db.query("SELECT COUNT(*) as c FROM users").get() as { c: number }
  const role = existingCount.c === 0 ? "admin" : "member"
  try {
    db.run("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)", [
      userId,
      email,
      passwordHash,
      role,
    ])
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (typeof e.message === "string" && e.message.includes("UNIQUE")) {
      return { body: { error: "An account with this email already exists" }, status: 409 }
    }
    throw err
  }
  const sessionId = nanoid()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  db.run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    sessionId,
    userId,
    expiresAt,
  ])
  return { body: { user: { id: userId, email, role } }, status: 201, sessionId }
}

export async function login(
  db: Database,
  body: { email?: string; password?: string }
): Promise<{ body: unknown; status: number; sessionId?: string }> {
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  if (!email) return { body: { error: "email is required" }, status: 400 }
  if (!password) return { body: { error: "password is required" }, status: 400 }
  const user = db
    .query("SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?")
    .get(email) as UserRow | undefined
  if (!user) {
    return { body: { error: "Invalid email or password" }, status: 401 }
  }
  const valid = await Bun.password.verify(password, user.password_hash)
  if (!valid) {
    return { body: { error: "Invalid email or password" }, status: 401 }
  }
  const sessionId = nanoid()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  db.run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    sessionId,
    user.id,
    expiresAt,
  ])
  const role = (user as UserRow).role ?? "member"
  return {
    body: { user: { id: user.id, email: user.email, role } },
    status: 200,
    sessionId,
  }
}

export async function logout(
  db: Database,
  req: Request
): Promise<{ body: unknown; status: number }> {
  const sessionId = getSessionIdFromRequest(req)
  if (sessionId) {
    db.run("DELETE FROM sessions WHERE id = ?", [sessionId])
  }
  return { body: { ok: true }, status: 200 }
}
