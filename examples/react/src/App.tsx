import { OpenFlagsProvider, useFlag, useFlags } from "@openflags/react"

const API_URL = "http://localhost:4000"

function Demo() {
  const newCheckout = useFlag("new_checkout")
  const flags = useFlags()

  return (
    <div>
      <h1>OpenFlags React Example</h1>
      <p>
        <strong>useFlag("new_checkout"):</strong> {newCheckout ? "On" : "Off"}
      </p>
      <p>
        <strong>useFlags():</strong>{" "}
        {Object.keys(flags).length === 0
          ? "(no flags)"
          : Object.entries(flags)
              .map(([k, v]) => `${k}=${v ? "on" : "off"}`)
              .join(", ")}
      </p>
      {flags.new_checkout && <p>New checkout feature is visible!</p>}
    </div>
  )
}

function App() {
  return (
    <OpenFlagsProvider apiUrl={API_URL} userId="user-1" environment="dev">
      <Demo />
    </OpenFlagsProvider>
  )
}

export default App
