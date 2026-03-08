import * as auth from "./auth.js"
import { initDb } from "./db.js"
import * as flagsProject from "./flagsProject.js"
import * as projects from "./projects.js"
import * as users from "./users.js"

const port = Number(process.env.PORT) || 4000
const db = initDb()

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  }
}

function jsonResponse(body: unknown, status: number, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extraHeaders },
  })
}

const server = Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    const url = new URL(req.url)
    const pathname = url.pathname

    try {
      // ----- Auth -----
      if (pathname === "/auth/signup" && req.method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string }
        const result = await auth.signup(db, body)
        const headers: HeadersInit = result.sessionId
          ? { "Set-Cookie": auth.setSessionCookieHeader(result.sessionId) }
          : {}
        return jsonResponse(result.body, result.status, headers)
      }
      if (pathname === "/auth/login" && req.method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string }
        const result = await auth.login(db, body)
        const headers: HeadersInit = result.sessionId
          ? { "Set-Cookie": auth.setSessionCookieHeader(result.sessionId) }
          : {}
        return jsonResponse(result.body, result.status, headers)
      }
      if (pathname === "/auth/logout" && req.method === "POST") {
        const result = await auth.logout(db, req)
        return jsonResponse(result.body, result.status, {
          "Set-Cookie": auth.clearSessionCookieHeader(),
        })
      }
      if (pathname === "/auth/me" && req.method === "GET") {
        const user = await auth.getSessionUser(db, req)
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
        return jsonResponse(
          { user: { id: user.id, email: user.email, role: user.role ?? "member" } },
          200
        )
      }

      // ----- Global users (platform admin only) -----
      if (pathname === "/users" && req.method === "GET") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const result = await users.listUsers(db)
        return jsonResponse(result.body, result.status)
      }
      if (pathname === "/users" && req.method === "POST") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const body = (await req.json()) as { email?: string; role?: string }
        const result = await users.inviteUser(db, authResult.user.id, body)
        return jsonResponse(result.body, result.status)
      }
      const userIdMatch = pathname.match(/^\/users\/([^/]+)$/)
      if (userIdMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const targetUserId = userIdMatch[1]
        if (req.method === "PATCH") {
          const body = (await req.json()) as { role?: string }
          const result = await users.updateUserRole(db, authResult.user.id, targetUserId, body)
          return jsonResponse(result.body, result.status)
        }
        if (req.method === "DELETE") {
          const result = await users.removeUser(db, authResult.user.id, targetUserId)
          return jsonResponse(result.body, result.status)
        }
      }

      // ----- Projects (authenticated) -----
      if (pathname === "/projects" && req.method === "GET") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const list = await projects.getAllProjects(db)
        return jsonResponse(list, 200)
      }
      if (pathname === "/projects" && req.method === "POST") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        if (!auth.requireCanCreateProject(db, authResult.user.id)) {
          return jsonResponse({ error: "Forbidden" }, 403)
        }
        const body = (await req.json()) as { name?: string; slug?: string }
        const result = await projects.createProject(db, authResult.user.id, body)
        return jsonResponse(result.body, result.status)
      }

      const projectIdMatch = pathname.match(/^\/projects\/([^/]+)$/)
      if (projectIdMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const projectId = projectIdMatch[1]
        if (req.method === "GET") {
          const result = await projects.getProject(db, projectId, authResult.user.id)
          return jsonResponse(result.body, result.status)
        }
        if (req.method === "DELETE") {
          const result = await projects.deleteProject(db, projectId, authResult.user.id)
          return jsonResponse(result.body, result.status)
        }
      }

      // ----- Project flags: GET is public (SDK), POST/PATCH/DELETE require auth -----
      const flagsListMatch = pathname.match(/^\/projects\/([^/]+)\/flags$/)
      if (flagsListMatch) {
        const projectIdOrSlug = flagsListMatch[1]
        if (req.method === "GET") {
          const result = await flagsProject.handleFlagsList(db, projectIdOrSlug)
          return jsonResponse(
            result.body,
            result.status,
            result.status === 200 ? { "Cache-Control": "public, max-age=15" } : undefined
          )
        }
        if (req.method === "POST") {
          const authResult = await auth.requireAuth(db, req)
          if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
          const body = (await req.json()) as import("@openflags/types").CreateFlagInput
          const result = await flagsProject.handleFlagsCreate(
            db,
            projectIdOrSlug,
            authResult.user.id,
            body
          )
          return jsonResponse(result.body, result.status)
        }
      }
      const flagDetailMatch = pathname.match(/^\/projects\/([^/]+)\/flags\/([^/]+)$/)
      if (flagDetailMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const projectId = flagDetailMatch[1]
        const flagId = flagDetailMatch[2]
        if (req.method === "PATCH") {
          const body = (await req.json()) as import("@openflags/types").UpdateFlagInput
          const result = await flagsProject.handleFlagUpdate(
            db,
            projectId,
            flagId,
            authResult.user.id,
            body
          )
          return jsonResponse(result.body, result.status)
        }
        if (req.method === "DELETE") {
          const result = await flagsProject.handleFlagDelete(
            db,
            projectId,
            flagId,
            authResult.user.id
          )
          return jsonResponse(result.body, result.status)
        }
      }

      return jsonResponse({ error: "Not Found" }, 404)
    } catch (err) {
      console.error(err)
      return jsonResponse(
        {
          error: "Internal Server Error",
          message: err instanceof Error ? err.message : String(err),
        },
        500
      )
    }
  },
})

console.log(`Server listening on http://localhost:${server.port}`)
