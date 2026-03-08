import { createClient, type OpenFlagsClient } from "@openflags/js"
import { useCallback, useEffect, useMemo, useState } from "react"

import { OpenFlagsContext, type OpenFlagsProviderProps } from "./OpenFlagsContext"

export function OpenFlagsProvider({
  apiUrl,
  project,
  userId,
  refreshIntervalMs,
  children,
}: OpenFlagsProviderProps) {
  const [client, setClient] = useState<OpenFlagsClient | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [, setIdentifyVersion] = useState(0)
  const [refreshVersion, setRefreshVersion] = useState(0)

  useEffect(() => {
    createClient({ apiUrl, project }).then(setClient).catch(setError)
  }, [apiUrl, project])

  useEffect(() => {
    client?.identify(userId ?? null)
  }, [client, userId])

  useEffect(() => {
    if (!client || !refreshIntervalMs || refreshIntervalMs <= 0) return
    const id = setInterval(() => {
      void client.refresh().then(() => setRefreshVersion((v) => v + 1))
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }, [client, refreshIntervalMs])

  const identify = useCallback(
    (id: string | null) => {
      client?.identify(id)
      setIdentifyVersion((v) => v + 1)
    },
    [client]
  )

  const refresh = useCallback(async () => {
    if (!client) return
    await client.refresh()
    setRefreshVersion((v) => v + 1)
  }, [client])

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

  const value = useMemo(
    () => ({ client, identify, refresh, refreshVersion }),
    [client, identify, refresh, refreshVersion]
  )
  return <OpenFlagsContext.Provider value={value}>{children}</OpenFlagsContext.Provider>
}
