import type { OpenFlagsClient } from "@openflags/js"
import { createContext, type ReactNode } from "react"

export interface OpenFlagsProviderProps {
  /** Base URL of the OpenFlags server */
  apiUrl: string
  /** Project slug or id (flags are scoped per project) */
  project: string
  /** User identifier for rollout and targeting */
  userId: string
  children: ReactNode
}

export const OpenFlagsContext = createContext<OpenFlagsClient | null>(null)
