import type { Flag } from "@openflags/types"

export interface OpenFlagsClientConfig {
  /** Base URL of the OpenFlags server (e.g. https://flags.example.com) */
  apiUrl: string
  /** Project slug or id (from the dashboard). Flags are scoped per project. */
  project: string
  /** Optional user identifier. Call identify(userId) when the user logs in or changes. */
  userId?: string
  /**
   * Optional interval in ms to refetch flags in the background. Omit or 0 = no auto-refresh.
   * Use with refresh() for manual refresh (e.g. after login or on window focus).
   */
  refreshIntervalMs?: number
}

export interface OpenFlagsClient {
  isEnabled(flagKey: string): boolean
  /** All flag keys and their enabled state (for useFlags()) */
  getAll(): Record<string, boolean>
  /** Set or update the current user (e.g. after login). Pass null to clear (e.g. logout). */
  identify(userId: string | null): void
  /** Refetch flags from the server. Resolves when the new flags are in place. */
  refresh(): Promise<void>
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
  const { apiUrl, project, userId: initialUserId, refreshIntervalMs } = config
  const url = `${apiUrl}/projects/${encodeURIComponent(project)}/flags`

  async function fetchFlags(): Promise<Flag[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch flags: ${res.status}`)
    return res.json()
  }

  const flagsRef: { current: Flag[] } = { current: await fetchFlags() }
  let currentUserId: string = initialUserId ?? ""

  let intervalId: ReturnType<typeof setInterval> | undefined
  if (refreshIntervalMs != null && refreshIntervalMs > 0) {
    intervalId = setInterval(() => {
      void fetchFlags().then((flags) => {
        flagsRef.current = flags
      })
    }, refreshIntervalMs)
  }

  const client: OpenFlagsClient & { destroy?: () => void } = {
    isEnabled(flagKey: string): boolean {
      const flag = flagsRef.current.find((f) => f.key === flagKey)
      if (!flag) return false
      return isFlagEnabledForUser(flag, currentUserId, flagKey)
    },
    getAll(): Record<string, boolean> {
      const out: Record<string, boolean> = {}
      for (const flag of flagsRef.current) {
        out[flag.key] = isFlagEnabledForUser(flag, currentUserId, flag.key)
      }
      return out
    },
    identify(userId: string | null): void {
      currentUserId = userId ?? ""
    },
    async refresh(): Promise<void> {
      flagsRef.current = await fetchFlags()
    },
  }

  if (intervalId !== undefined) {
    client.destroy = () => clearInterval(intervalId)
  }

  return client
}
