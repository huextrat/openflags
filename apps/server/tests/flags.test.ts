import { describe, expect, test } from "bun:test"

import { createMemoryDb } from "../src/db.js"
import * as flagsProject from "../src/flagsProject.js"

const PROJECT_ID = "proj1"
const USER_ID = "user1"

function setupDb() {
  const db = createMemoryDb()
  db.run("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [USER_ID, "test@test.com", "dummy"])
  db.run("INSERT INTO projects (id, name, slug) VALUES (?, ?, ?)", [PROJECT_ID, "Test", "test"])
  db.run("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)", [PROJECT_ID, USER_ID, "admin"])
  return db
}

describe("GET /projects/:idOrSlug/flags", () => {
  test("returns empty array when no flags", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsList(db, PROJECT_ID)
    expect(result.status).toBe(200)
    expect(result.body).toEqual([])
  })

  test("returns 404 when project does not exist", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsList(db, "nonexistent")
    expect(result.status).toBe(404)
    expect(result.body).toEqual({ error: "Project not found" })
  })

  test("returns flags filtered by environment when query param set", async () => {
    const db = setupDb()
    await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "f1",
      environment: "dev",
      enabled: true,
    })
    await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "f2",
      environment: "prod",
      enabled: true,
    })

    const devResult = await flagsProject.handleFlagsList(db, PROJECT_ID, "dev")
    expect(devResult.status).toBe(200)
    expect(Array.isArray(devResult.body)).toBe(true)
    expect((devResult.body as { key: string }[]).map((f) => f.key)).toEqual(["f1"])

    const prodResult = await flagsProject.handleFlagsList(db, PROJECT_ID, "prod")
    expect((prodResult.body as { key: string }[]).map((f) => f.key)).toEqual(["f2"])
  })
})

describe("POST /projects/:id/flags", () => {
  test("creates flag and returns 201 with body", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "new_feature",
      environment: "dev",
      enabled: true,
      rolloutPercentage: 50,
    })
    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({
      key: "new_feature",
      environment: "dev",
      enabled: true,
      rolloutPercentage: 50,
    })
    expect((result.body as { id: string }).id).toBeDefined()
  })

  test("returns 400 when key is missing", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      environment: "dev",
    } as import("@openflags/types").CreateFlagInput)
    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: "key is required" })
  })

  test("returns 400 when environment is missing", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "x",
    } as import("@openflags/types").CreateFlagInput)
    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: "environment is required" })
  })

  test("returns 409 when same key+environment already exists", async () => {
    const db = setupDb()
    const body = { key: "dup", environment: "dev", enabled: false }
    await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, body)
    const result = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, body)
    expect(result.status).toBe(409)
    expect(result.body).toMatchObject({ error: expect.stringContaining("already exists") })
  })

  test("returns 403 when user is not project member", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagsCreate(db, PROJECT_ID, "other-user", {
      key: "x",
      environment: "dev",
    })
    expect(result.status).toBe(403)
    expect(result.body).toEqual({ error: "Forbidden" })
  })
})

describe("PATCH /projects/:id/flags/:flagId", () => {
  test("updates flag and returns 200", async () => {
    const db = setupDb()
    const created = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "patch_me",
      environment: "dev",
      enabled: false,
      rolloutPercentage: 0,
    })
    const id = (created.body as { id: string }).id

    const result = await flagsProject.handleFlagUpdate(db, PROJECT_ID, id, USER_ID, {
      enabled: true,
      rolloutPercentage: 100,
    })
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({
      key: "patch_me",
      enabled: true,
      rolloutPercentage: 100,
    })
  })

  test("returns 404 when flag id does not exist", async () => {
    const db = setupDb()
    const result = await flagsProject.handleFlagUpdate(db, PROJECT_ID, "nonexistent-id", USER_ID, { enabled: true })
    expect(result.status).toBe(404)
    expect(result.body).toEqual({ error: "Flag not found" })
  })
})

describe("DELETE /projects/:id/flags/:flagId", () => {
  test("deletes flag and returns 200", async () => {
    const db = setupDb()
    const created = await flagsProject.handleFlagsCreate(db, PROJECT_ID, USER_ID, {
      key: "delete_me",
      environment: "dev",
      enabled: true,
    })
    const id = (created.body as { id: string }).id
    const result = await flagsProject.handleFlagDelete(db, PROJECT_ID, id, USER_ID)
    expect(result.status).toBe(200)
    expect(result.body).toEqual({ ok: true })
    const list = await flagsProject.handleFlagsList(db, PROJECT_ID)
    expect((list.body as { id: string }[]).find((f) => f.id === id)).toBeUndefined()
  })
})
