import type { Flag } from "@openflags/types"

export interface OpenFlagsClientConfig {
  /** Base URL of the OpenFlags server (e.g. https://flags.example.com) */
  apiUrl: string
  /** Project slug or id (from the dashboard). Flags are scoped per project. */
  project: string
  /** User identifier for rollout and user targeting */
  userId: string
}

export interface OpenFlagsClient {
  isEnabled(flagKey: string): boolean
  /** All flag keys and their enabled state (for useFlags()) */
  getAll(): Record<string, boolean>
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
  const { apiUrl, project, userId } = config
  const url = `${apiUrl}/projects/${encodeURIComponent(project)}/flags`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch flags: ${res.status}`)
  const flags: Flag[] = await res.json()

  return {
    isEnabled(flagKey: string): boolean {
      const flag = flags.find((f) => f.key === flagKey)
      if (!flag) return false
      return isFlagEnabledForUser(flag, userId, flagKey)
    },
    getAll(): Record<string, boolean> {
      const out: Record<string, boolean> = {}
      for (const flag of flags) {
        out[flag.key] = isFlagEnabledForUser(flag, userId, flag.key)
      }
      return out
    },
  }
}
