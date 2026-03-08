import type { Metadata } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"

import "./global.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://openflags.dev"),
  title: {
    default: "OpenFlags",
    template: "%s | OpenFlags",
  },
  description:
    "Self-hosted feature flags for modern JavaScript teams with local evaluation, percentage rollouts, and a lightweight control plane.",
  openGraph: {
    title: "OpenFlags",
    description:
      "Self-hosted feature flags for modern JavaScript teams with local evaluation, percentage rollouts, and a lightweight control plane.",
    siteName: "OpenFlags",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenFlags",
    description:
      "Ship safer with self-hosted feature flags designed for developers and product teams.",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--of-background)] text-[var(--of-foreground)] antialiased">
        <RootProvider
          theme={{
            defaultTheme: "dark",
            forcedTheme: "dark",
            enableSystem: false,
            disableTransitionOnChange: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
