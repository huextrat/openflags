import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { Flag } from "lucide-react"

import { source } from "@/lib/source"

export const dynamicParams = false
export const revalidate = false

function Logo() {
  return (
    <div className="flex items-center gap-3 font-semibold text-white transition-opacity group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow duration-300">
        <Flag className="h-4 w-4 text-violet-300" />
      </div>
      <span className="tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
        OpenFlags
      </span>
    </div>
  )
}

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: <Logo />,
        url: "/",
        transparentMode: "top",
      }}
      sidebar={{
        defaultOpenLevel: 1,
        prefetch: true,
      }}
      githubUrl="https://github.com/huextrat/openflags"
    >
      {children}
    </DocsLayout>
  )
}
