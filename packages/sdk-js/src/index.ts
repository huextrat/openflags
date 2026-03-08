import type { Flag } from "@openflags/types"

export interface OpenFlagsClientConfig {
  /** Base URL of the OpenFlags server (e.g. https://flags.example.com) */
  apiUrl: string
  /** Project slug or id (from the dashboard). Flags are scoped per project. */
  project: string
  /** Optional user identifier. Call identify(userId) when the user logs in or changes. */
  userId?: string
}

export interface OpenFlagsClient {
  isEnabled(flagKey: string): boolean
  /** All flag keys and their enabled state (for useFlags()) */
  getAll(): Record<string, boolean>
  /** Set or update the current user (e.g. after login). Pass null to clear (e.g. logout). */
  identify(userId: string | null): void
}

function hashToPercent(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h = (h << 5) - h + c
    h = h & 0x7fff_ffff
  }
  return Math.abs(h) % 100
}

function isFlagEnabledForUser(flag: Flag, userId: string, flagKey: string): boolean {
  if (!flag.enabled) return false
  if (flag.users?.length && flag.users.includes(userId)) return true
  const bucket = hashToPercent(userId + flagKey)
  return bucket < flag.rolloutPercentage
}

export async function createClient(config: OpenFlagsClientConfig): Promise<OpenFlagsClient> {
  const { apiUrl, project, userId: initialUserId } = config
  const url = `${apiUrl}/projects/${encodeURIComponent(project)}/flags`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch flags: ${res.status}`)
  const flags: Flag[] = await res.json()

  let currentUserId: string = initialUserId ?? ""

  return {
    isEnabled(flagKey: string): boolean {
      const flag = flags.find((f) => f.key === flagKey)
      if (!flag) return false
      return isFlagEnabledForUser(flag, currentUserId, flagKey)
    },
    getAll(): Record<string, boolean> {
      const out: Record<string, boolean> = {}
      for (const flag of flags) {
        out[flag.key] = isFlagEnabledForUser(flag, currentUserId, flag.key)
      }
      return out
    },
    identify(userId: string | null): void {
      currentUserId = userId ?? ""
    },
  }
}
