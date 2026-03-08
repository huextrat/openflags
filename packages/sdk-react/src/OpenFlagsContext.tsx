import type { OpenFlagsClient } from "@openflags/js"
import { createContext, type ReactNode } from "react"

export interface OpenFlagsProviderProps {
  /** Base URL of the OpenFlags server */
  apiUrl: string
  /** Project slug or id (flags are scoped per project) */
  project: string
  /** Optional user identifier. Use identify(userId) when the user logs in or changes. */
  userId?: string
  /** Optional interval in ms to refetch flags. When set, components re-render after each refresh. */
  refreshIntervalMs?: number
  children: ReactNode
}

export interface OpenFlagsContextValue {
  client: OpenFlagsClient
  /** Set or clear the current user (e.g. after login/logout). Causes components to re-render with new flag values. */
  identify: (userId: string | null) => void
  /** Refetch flags from the server. Causes components to re-render when done. */
  refresh: () => Promise<void>
  /** Increments after each refresh; use as dependency or key if you need to react to flag updates. */
  refreshVersion: number
}

export const OpenFlagsContext = createContext<OpenFlagsContextValue | null>(null)
