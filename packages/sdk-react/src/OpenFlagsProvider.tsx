import { createClient, type OpenFlagsClient } from "@openflags/js"
import { useEffect, useState } from "react"

import { OpenFlagsContext, type OpenFlagsProviderProps } from "./OpenFlagsContext"

export function OpenFlagsProvider({
  apiUrl,
  userId,
  environment,
  children,
}: OpenFlagsProviderProps) {
  const [client, setClient] = useState<OpenFlagsClient | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    createClient({ apiUrl, userId, environment }).then(setClient).catch(setError)
  }, [apiUrl, userId, environment])

  if (error) {
    return (
      <OpenFlagsContext.Provider value={null}>
        <div data-openflags-error>Error loading flags: {error.message}</div>
      </OpenFlagsContext.Provider>
    )
  }

  return <OpenFlagsContext.Provider value={client}>{children}</OpenFlagsContext.Provider>
}
