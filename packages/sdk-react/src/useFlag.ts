import { useContext } from "react"

import { OpenFlagsContext } from "./OpenFlagsContext"

export function useFlag(flagKey: string): boolean {
  const ctx = useContext(OpenFlagsContext)
  if (!ctx) return false
  return ctx.client.isEnabled(flagKey)
}
