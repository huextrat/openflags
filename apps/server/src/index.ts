import { initDb } from "./db.js"
import { handleFlags } from "./flags.js"

const port = Number(process.env.PORT) || 4000
const db = initDb()

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
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

    if (pathname === "/flags" || pathname.startsWith("/flags/")) {
      try {
        const res = await handleFlags(req, db, pathname)
        return jsonResponse(res.body, res.status)
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
    }

    return jsonResponse({ error: "Not Found" }, 404)
  },
})

console.log(`Server listening on http://localhost:${server.port}`)
