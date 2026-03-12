import { join, extname } from "node:path"

import * as auth from "./auth.js"
import { initDb } from "./db.js"
import * as flagsProject from "./flagsProject.js"
import * as projects from "./projects.js"
import * as segmentsProject from "./segmentsProject.js"
import * as users from "./users.js"

const port = Number(process.env.PORT) || 4000
const db = initDb()

// When DASHBOARD_DIR is set (all-in-one Docker mode), we serve the
// dashboard SPA from that directory and prefix all API routes with /api.
const dashboardDir = process.env.DASHBOARD_DIR ?? ""
const isEmbedded = dashboardDir.length > 0
const apiPrefix = isEmbedded ? "/api" : ""

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
}

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
      // Strip the API prefix for route matching
      const routePath =
        isEmbedded && pathname.startsWith(apiPrefix)
          ? pathname.slice(apiPrefix.length) || "/"
          : isEmbedded
            ? null // Not an API route in embedded mode
            : pathname

      // ----- Serve Dashboard (embedded mode) -----
      if (isEmbedded && routePath === null) {
        // Try to serve a static file from the dashboard build (always allow: assets, favicon, etc.)
        const filePath = join(dashboardDir, pathname)
        const file = Bun.file(filePath)
        if (await file.exists()) {
          const ext = extname(pathname)
          const contentType = MIME_TYPES[ext] ?? "application/octet-stream"
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
              ...(ext !== ".html"
                ? { "Cache-Control": "public, max-age=31536000, immutable" }
                : {}),
            },
          })
        }
        // SPA fallback: require auth for dashboard routes except login/signup
        const publicPaths = ["/login", "/signup"]
        const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))
        if (!isPublicPath) {
          const sessionUser = await auth.getSessionUser(db, req)
          if (!sessionUser) {
            const loginUrl = new URL("/login", url.origin)
            return new Response(null, {
              status: 302,
              headers: { Location: loginUrl.pathname + url.search, ...corsHeaders() },
            })
          }
        }
        const indexPath = join(dashboardDir, "index.html")
        const indexFile = Bun.file(indexPath)
        if (await indexFile.exists()) {
          return new Response(indexFile, {
            headers: { "Content-Type": "text/html" },
          })
        }
        return new Response("Not Found", { status: 404 })
      }

      // ----- Auth -----
      if (routePath === "/auth/config" && req.method === "GET") {
        const disableSignup =
          process.env.OPENFLAGS_DISABLE_SIGNUP !== "false" &&
          process.env.OPENFLAGS_DISABLE_SIGNUP !== "0"
        const existingCount = db.query("SELECT COUNT(*) as c FROM users").get() as { c: number }
        const signupAllowed = !disableSignup || existingCount.c === 0
        return jsonResponse({ signupAllowed }, 200)
      }
      if (routePath === "/auth/signup" && req.method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string }
        const disableSignup =
          process.env.OPENFLAGS_DISABLE_SIGNUP !== "false" &&
          process.env.OPENFLAGS_DISABLE_SIGNUP !== "0"
        if (disableSignup) {
          const existingCount = db.query("SELECT COUNT(*) as c FROM users").get() as { c: number }
          if (existingCount.c > 0) {
            return jsonResponse(
              { error: "Signup is disabled. Ask an admin to invite you." },
              403
            )
          }
        }
        const result = await auth.signup(db, body)
        const headers: HeadersInit = result.sessionId
          ? { "Set-Cookie": auth.setSessionCookieHeader(result.sessionId) }
          : {}
        return jsonResponse(result.body, result.status, headers)
      }
      if (routePath === "/auth/login" && req.method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string }
        const result = await auth.login(db, body)
        const headers: HeadersInit = result.sessionId
          ? { "Set-Cookie": auth.setSessionCookieHeader(result.sessionId) }
          : {}
        return jsonResponse(result.body, result.status, headers)
      }
      if (routePath === "/auth/logout" && req.method === "POST") {
        const result = await auth.logout(db, req)
        return jsonResponse(result.body, result.status, {
          "Set-Cookie": auth.clearSessionCookieHeader(),
        })
      }
      if (routePath === "/auth/me" && req.method === "GET") {
        const user = await auth.getSessionUser(db, req)
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
        return jsonResponse(
          { user: { id: user.id, email: user.email, role: user.role ?? "member" } },
          200
        )
      }

      // ----- Global users (platform admin only) -----
      if (routePath === "/users" && req.method === "GET") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const result = await users.listUsers(db)
        return jsonResponse(result.body, result.status)
      }
      if (routePath === "/users" && req.method === "POST") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const body = (await req.json()) as { email?: string; role?: string }
        const result = await users.inviteUser(db, authResult.user.id, body)
        return jsonResponse(result.body, result.status)
      }
      const userIdMatch = routePath?.match(/^\/users\/([^/]+)$/)
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
      if (routePath === "/projects" && req.method === "GET") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const list = await projects.getAllProjects(db)
        return jsonResponse(list, 200)
      }
      if (routePath === "/projects" && req.method === "POST") {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        if (!auth.requireCanCreateProject(db, authResult.user.id)) {
          return jsonResponse({ error: "Forbidden" }, 403)
        }
        const body = (await req.json()) as { name?: string; slug?: string }
        const result = await projects.createProject(db, authResult.user.id, body)
        return jsonResponse(result.body, result.status)
      }

      const projectIdMatch = routePath?.match(/^\/projects\/([^/]+)$/)
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
      const flagsListMatch = routePath?.match(/^\/projects\/([^/]+)\/flags$/)
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
          const body = (await req.json()) as import("@openflagsdev/types").CreateFlagInput
          const result = await flagsProject.handleFlagsCreate(
            db,
            projectIdOrSlug,
            authResult.user.id,
            body
          )
          return jsonResponse(result.body, result.status)
        }
      }
      const flagDetailMatch = routePath?.match(/^\/projects\/([^/]+)\/flags\/([^/]+)$/)
      if (flagDetailMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)
        const projectId = flagDetailMatch[1]
        const flagId = flagDetailMatch[2]
        if (req.method === "PATCH") {
          const body = (await req.json()) as import("@openflagsdev/types").UpdateFlagInput
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

      // ----- Project segments: GET/POST/PATCH/DELETE require auth -----
      const segmentsListMatch = routePath?.match(/^\/projects\/([^/]+)\/segments$/)
      if (segmentsListMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)

        const projectIdOrSlug = segmentsListMatch[1]

        if (req.method === "GET") {
          const result = await segmentsProject.handleSegmentsList(
            db,
            projectIdOrSlug,
            authResult.user.id
          )
          return jsonResponse(result.body, result.status)
        }

        if (req.method === "POST") {
          const body = (await req.json()) as import("@openflagsdev/types").CreateSegmentInput
          const result = await segmentsProject.handleSegmentCreate(
            db,
            projectIdOrSlug,
            authResult.user.id,
            body
          )
          return jsonResponse(result.body, result.status)
        }
      }

      const segmentDetailMatch = routePath?.match(/^\/projects\/([^/]+)\/segments\/([^/]+)$/)
      if (segmentDetailMatch) {
        const authResult = await auth.requireAuth(db, req)
        if ("body" in authResult) return jsonResponse(authResult.body, authResult.status)

        const projectId = segmentDetailMatch[1]
        const segmentId = segmentDetailMatch[2]

        if (req.method === "PATCH") {
          const body = (await req.json()) as import("@openflagsdev/types").UpdateSegmentInput
          const result = await segmentsProject.handleSegmentUpdate(
            db,
            projectId,
            segmentId,
            authResult.user.id,
            body
          )
          return jsonResponse(result.body, result.status)
        }

        if (req.method === "DELETE") {
          const result = await segmentsProject.handleSegmentDelete(
            db,
            projectId,
            segmentId,
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

if (isEmbedded) {
  console.log(`OpenFlags listening on http://localhost:${server.port} (API + Dashboard)`)
} else {
  console.log(`Server listening on http://localhost:${server.port}`)
}
