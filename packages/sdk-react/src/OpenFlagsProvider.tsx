import { createClient, type OpenFlagsClient } from "@openflags/js"
import { useCallback, useEffect, useMemo, useState } from "react"

import { OpenFlagsContext, type OpenFlagsProviderProps } from "./OpenFlagsContext"

export function OpenFlagsProvider({ apiUrl, project, userId, children }: OpenFlagsProviderProps) {
  const [client, setClient] = useState<OpenFlagsClient | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [, setIdentifyVersion] = useState(0)

  useEffect(() => {
    createClient({ apiUrl, project }).then(setClient).catch(setError)
  }, [apiUrl, project])

  useEffect(() => {
    client?.identify(userId ?? null)
  }, [client, userId])

  const identify = useCallback(
    (id: string | null) => {
      client?.identify(id)
      setIdentifyVersion((v) => v + 1)
    },
    [client]
  )

  if (error) {
    return (
      <OpenFlagsContext.Provider value={null}>
        <div data-openflags-error>Error loading flags: {error.message}</div>
      </OpenFlagsContext.Provider>
    )
  }

  if (!client) {
    return <OpenFlagsContext.Provider value={null}>{children}</OpenFlagsContext.Provider>
  }

  const value = useMemo(() => ({ client, identify }), [client, identify])
  return <OpenFlagsContext.Provider value={value}>{children}</OpenFlagsContext.Provider>
}
