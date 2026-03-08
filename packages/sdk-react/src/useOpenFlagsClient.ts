import { useContext } from "react"

import { OpenFlagsContext } from "./OpenFlagsContext"

/** Returns the client and identify function. Call identify(userId) when the user logs in or changes, identify(null) on logout. */
export function useOpenFlagsClient() {
  return useContext(OpenFlagsContext)
}
