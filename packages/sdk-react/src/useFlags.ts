import { useContext } from "react"

import { OpenFlagsContext } from "./OpenFlagsContext"

export function useFlags(): Record<string, boolean> {
  const ctx = useContext(OpenFlagsContext)
  if (!ctx) return {}
  return ctx.client.getAll()
}
