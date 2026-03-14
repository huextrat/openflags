import type { Metadata } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./global.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://openflags.dev"),
  title: {
    default: "OpenFlags | Open Source Feature Flags",
    template: "%s | OpenFlags",
  },
  description:
    "Self-hosted feature flags for modern JavaScript teams. Zero latency local evaluation, percentage rollouts, and a lightweight control plane without the enterprise tax.",
  keywords: [
    "feature flags",
    "feature toggles",
    "open source",
    "self hosted",
    "progressive delivery",
    "javascript sdk",
    "react sdk",
    "a/b testing",
    "canary release",
  ],
  authors: [{ name: "Hugo Extrat", url: "https://github.com/huextrat" }],
  creator: "Hugo Extrat",
  publisher: "OpenFlags",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "OpenFlags - Lightweight Feature Flags",
    description:
      "Ship faster with self-hosted feature flags for modern product teams. Enjoy zero latency local evaluation and keep data securely in your own stack.",
    url: "https://openflags.dev",
    siteName: "OpenFlags",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenFlags - Feature flags for modern teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenFlags",
    description: "Fast, self-hosted, edge-ready feature flags for modern teams.",
    creator: "@huextrat",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden bg-[var(--of-background)] text-[var(--of-foreground)] antialiased">
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
