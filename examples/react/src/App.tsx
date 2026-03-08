import { OpenFlagsProvider, useFlag, useFlags, useOpenFlagsClient } from "@openflagsdev/react"
import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

function Demo() {
  const newCheckout = useFlag("new_checkout")
  const flags = useFlags()
  const openFlags = useOpenFlagsClient()

  return (
    <div>
      {openFlags && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>
            identify(userId) — simule login / logout
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => openFlags.identify("user-1")}
              style={{
                padding: "0.35rem 0.75rem",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              user-1
            </button>
            <button
              type="button"
              onClick={() => openFlags.identify("user-2")}
              style={{
                padding: "0.35rem 0.75rem",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              user-2
            </button>
            <button
              type="button"
              onClick={() => openFlags.identify(null)}
              style={{
                padding: "0.35rem 0.75rem",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Déconnexion (anonymous)
            </button>
          </div>
        </div>
      )}
      <p>
        <strong>useFlag("new_checkout"):</strong> {newCheckout ? "On" : "Off"}
      </p>
      <p>
        <strong>useFlags():</strong>{" "}
        {Object.keys(flags).length === 0
          ? "(aucun flag)"
          : Object.entries(flags)
              .map(([k, v]) => `${k}=${v ? "on" : "off"}`)
              .join(", ")}
      </p>
      {flags.new_checkout && <p>La feature new checkout est visible.</p>}
    </div>
  )
}

function App() {
  const [projectSlug, setProjectSlug] = useState("")
  const [submittedProject, setSubmittedProject] = useState("")

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const slug = projectSlug.trim()
    if (slug) setSubmittedProject(slug)
  }

  return (
    <div style={{ padding: "1rem", maxWidth: 600 }}>
      <h1>OpenFlags React Example</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <label
          htmlFor="project"
          style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}
        >
          Projet (slug)
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="project"
            type="text"
            value={projectSlug}
            onChange={(e) => setProjectSlug(e.target.value)}
            placeholder="ex: my-app"
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Voir les flags
          </button>
        </div>
      </form>

      {submittedProject ? (
        <OpenFlagsProvider apiUrl={API_URL} project={submittedProject}>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>
            Flags pour le projet <strong>{submittedProject}</strong> (userId optionnel, utilise
            identify pour changer)
          </p>
          <Demo />
        </OpenFlagsProvider>
      ) : (
        <p style={{ color: "#666" }}>
          Saisissez le slug d’un projet et validez pour afficher les flags.
        </p>
      )}
    </div>
  )
}

export default App
