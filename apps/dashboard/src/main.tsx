import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "sonner"

import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-gray-800 border border-white/10 text-gray-100",
          success: "border-violet-500/50",
          error: "border-red-500/50",
        },
      }}
    />
  </React.StrictMode>
)
