import type { OpenFlagsClient } from "@openflags/js"
import { createContext, type ReactNode } from "react"

export interface OpenFlagsProviderProps {
  apiUrl: string
  userId: string
  environment?: string
  children: ReactNode
}

export const OpenFlagsContext = createContext<OpenFlagsClient | null>(null)
