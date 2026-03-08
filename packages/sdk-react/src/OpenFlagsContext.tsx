import type { OpenFlagsClient } from "@openflags/js"
import { createContext, type ReactNode } from "react"

export interface OpenFlagsProviderProps {
  /** Base URL of the OpenFlags server */
  apiUrl: string
  /** Project slug or id (flags are scoped per project) */
  project: string
  /** Optional user identifier. Use identify(userId) when the user logs in or changes. */
  userId?: string
  children: ReactNode
}

export interface OpenFlagsContextValue {
  client: OpenFlagsClient
  /** Set or clear the current user (e.g. after login/logout). Causes components to re-render with new flag values. */
  identify: (userId: string | null) => void
}

export const OpenFlagsContext = createContext<OpenFlagsContextValue | null>(null)
