import type { Flag } from "@openflags/types"
import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

function App() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchFlags() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/flags`)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setFlags(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  async function toggleEnabled(flag: Flag) {
    try {
      const res = await fetch(`${API_URL}/flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !flag.enabled }),
      })
      if (!res.ok) throw new Error(res.statusText)
      const updated = await res.json()
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch (e) {
      setError(String(e))
    }
  }

  if (loading) return <p>Loading flags…</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>OpenFlags Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Environment</th>
            <th>Enabled</th>
            <th>Rollout %</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.key}</td>
              <td>{flag.environment}</td>
              <td>{flag.enabled ? "Yes" : "No"}</td>
              <td>{flag.rolloutPercentage}</td>
              <td>
                <button type="button" onClick={() => toggleEnabled(flag)}>
                  {flag.enabled ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {flags.length === 0 && <p>No flags yet. Create some via the API (POST /flags).</p>}
    </div>
  )
}

export default App
