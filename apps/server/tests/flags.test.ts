import { describe, expect, test } from "bun:test"

import { createMemoryDb } from "../src/db.js"
import { handleFlags } from "../src/flags.js"

describe("GET /flags", () => {
  test("returns empty array when no flags", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/flags")
    const { body, status } = await handleFlags(req, db, "/flags")
    expect(status).toBe(200)
    expect(body).toEqual([])
  })

  test("returns flags filtered by environment when query param set", async () => {
    const db = createMemoryDb()
    const postReq = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "f1",
        environment: "dev",
        enabled: true,
      }),
    })
    await handleFlags(postReq, db, "/flags")
    const postReq2 = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "f2",
        environment: "prod",
        enabled: true,
      }),
    })
    await handleFlags(postReq2, db, "/flags")

    const getDev = new Request("http://localhost/flags?environment=dev")
    const { body: devBody, status: devStatus } = await handleFlags(getDev, db, "/flags")
    expect(devStatus).toBe(200)
    expect(Array.isArray(devBody)).toBe(true)
    expect((devBody as { key: string }[]).map((f) => f.key)).toEqual(["f1"])

    const getProd = new Request("http://localhost/flags?environment=prod")
    const { body: prodBody } = await handleFlags(getProd, db, "/flags")
    expect((prodBody as { key: string }[]).map((f) => f.key)).toEqual(["f2"])
  })
})

describe("POST /flags", () => {
  test("creates flag and returns 201 with body", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "new_feature",
        environment: "dev",
        enabled: true,
        rolloutPercentage: 50,
      }),
    })
    const { body, status } = await handleFlags(req, db, "/flags")
    expect(status).toBe(201)
    expect(body).toMatchObject({
      key: "new_feature",
      environment: "dev",
      enabled: true,
      rolloutPercentage: 50,
    })
    expect((body as { id: string }).id).toBeDefined()
  })

  test("returns 400 when key is missing", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ environment: "dev" }),
    })
    const { body, status } = await handleFlags(req, db, "/flags")
    expect(status).toBe(400)
    expect(body).toEqual({ error: "key is required" })
  })

  test("returns 400 when environment is missing", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "x" }),
    })
    const { body, status } = await handleFlags(req, db, "/flags")
    expect(status).toBe(400)
    expect(body).toEqual({ error: "environment is required" })
  })

  test("returns 409 when same key+environment already exists", async () => {
    const db = createMemoryDb()
    const body = { key: "dup", environment: "dev", enabled: false }
    const req1 = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    await handleFlags(req1, db, "/flags")

    const req2 = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const { body: resBody, status } = await handleFlags(req2, db, "/flags")
    expect(status).toBe(409)
    expect(resBody).toMatchObject({ error: expect.stringContaining("already exists") })
  })
})

describe("PATCH /flags/:id", () => {
  test("updates flag and returns 200", async () => {
    const db = createMemoryDb()
    const postReq = new Request("http://localhost/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "patch_me",
        environment: "dev",
        enabled: false,
        rolloutPercentage: 0,
      }),
    })
    const { body: created } = await handleFlags(postReq, db, "/flags")
    const id = (created as { id: string }).id

    const patchReq = new Request(`http://localhost/flags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true, rolloutPercentage: 100 }),
    })
    const { body: updated, status } = await handleFlags(patchReq, db, `/flags/${id}`)
    expect(status).toBe(200)
    expect(updated).toMatchObject({
      key: "patch_me",
      enabled: true,
      rolloutPercentage: 100,
    })
  })

  test("returns 404 when flag id does not exist", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/flags/nonexistent-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    })
    const { body, status } = await handleFlags(req, db, "/flags/nonexistent-id")
    expect(status).toBe(404)
    expect(body).toEqual({ error: "Flag not found" })
  })
})

describe("404 for unknown path", () => {
  test("returns 404 for non-flags path", async () => {
    const db = createMemoryDb()
    const req = new Request("http://localhost/other")
    const { body, status } = await handleFlags(req, db, "/other")
    expect(status).toBe(404)
    expect(body).toEqual({ error: "Not Found" })
  })
})
