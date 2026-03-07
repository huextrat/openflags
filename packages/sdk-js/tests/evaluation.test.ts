import { describe, expect, test } from "bun:test"

import type { Flag } from "@openflags/types"

import { createClient } from "../src/index.js"

function mockFetch(flags: Flag[]) {
  const payload = JSON.stringify(flags)
  return () =>
    Promise.resolve(new Response(payload, { headers: { "Content-Type": "application/json" } }))
}

describe("createClient + isEnabled", () => {
  test("returns false when flag is disabled", async () => {
    const flags: Flag[] = [
      {
        id: "1",
        key: "off_flag",
        enabled: false,
        rolloutPercentage: 100,
      },
    ]
    globalThis.fetch = mockFetch(flags) as unknown as typeof fetch
    const client = await createClient({ apiUrl: "http://localhost", project: "test", userId: "u1" })
    expect(client.isEnabled("off_flag")).toBe(false)
  })

  test("returns true when flag is enabled and rollout 100%", async () => {
    const flags: Flag[] = [
      {
        id: "1",
        key: "on_flag",
        enabled: true,
        rolloutPercentage: 100,
      },
    ]
    globalThis.fetch = mockFetch(flags) as unknown as typeof fetch
    const client = await createClient({ apiUrl: "http://localhost", project: "test", userId: "u1" })
    expect(client.isEnabled("on_flag")).toBe(true)
  })

  test("returns false when flag is enabled but rollout 0% and user not in list", async () => {
    const flags: Flag[] = [
      {
        id: "1",
        key: "rollout_zero",
        enabled: true,
        rolloutPercentage: 0,
      },
    ]
    globalThis.fetch = mockFetch(flags) as unknown as typeof fetch
    const client = await createClient({
      apiUrl: "http://localhost",
      project: "test",
      userId: "random_user",
    })
    expect(client.isEnabled("rollout_zero")).toBe(false)
  })

  test("returns true when user is in users list", async () => {
    const flags: Flag[] = [
      {
        id: "1",
        key: "targeted",
        enabled: true,
        rolloutPercentage: 0,
        users: ["u1", "u2"],
      },
    ]
    globalThis.fetch = mockFetch(flags) as unknown as typeof fetch
    const client = await createClient({ apiUrl: "http://localhost", project: "test", userId: "u1" })
    expect(client.isEnabled("targeted")).toBe(true)
  })

  test("returns false when flag key does not exist", async () => {
    globalThis.fetch = mockFetch([]) as unknown as typeof fetch
    const client = await createClient({ apiUrl: "http://localhost", project: "test", userId: "u1" })
    expect(client.isEnabled("missing")).toBe(false)
  })
})

describe("createClient + getAll", () => {
  test("returns record of flag key -> boolean", async () => {
    const flags: Flag[] = [
      {
        id: "1",
        key: "a",
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        id: "2",
        key: "b",
        enabled: false,
        rolloutPercentage: 0,
      },
    ]
    globalThis.fetch = mockFetch(flags) as unknown as typeof fetch
    const client = await createClient({ apiUrl: "http://localhost", project: "test", userId: "u1" })
    const all = client.getAll()
    expect(all.a).toBe(true)
    expect(all.b).toBe(false)
    expect(Object.keys(all)).toHaveLength(2)
  })
})
