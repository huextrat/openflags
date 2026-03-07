import { useContext } from "react"
import { OpenFlagsContext } from "./OpenFlagsContext"

export function useFlags(): Record<string, boolean> {
  const client = useContext(OpenFlagsContext)
  if (!client) return {}
  return client.getAll()
}
