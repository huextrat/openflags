import { useContext } from "react"

import { OpenFlagsContext } from "./OpenFlagsContext"

export function useFlag(flagKey: string): boolean {
  const client = useContext(OpenFlagsContext)
  if (!client) return false
  return client.isEnabled(flagKey)
}
