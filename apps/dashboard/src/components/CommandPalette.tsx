import { motion, AnimatePresence } from "framer-motion"
import { Command, Flag, PlusCircle, Settings, LogOut, LayoutDashboard, Users } from "lucide-react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"
import { cn } from "@/lib/utils"

type Item =
  | { type: "nav"; id: string; label: string; path: string; icon: React.ReactNode }
  | { type: "action"; id: string; label: string; icon: React.ReactNode; run: () => void }

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const { user, logout } = useAuth()
  const { projects } = useProjects()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  const items = useMemo((): Item[] => {
    const q = query.trim().toLowerCase()
    const list: Item[] = [
      {
        type: "nav",
        id: "home",
        label: "Projects",
        path: "/",
        icon: <LayoutDashboard className="h-4 w-4 text-cyan-400" />,
      },
      ...(user?.role === "admin" || user?.role === "developer"
        ? [
            {
              type: "nav" as const,
              id: "new",
              label: "New project",
              path: "/projects/new",
              icon: <PlusCircle className="h-4 w-4 text-violet-400" />,
            },
          ]
        : []),
      ...projects.map((p) => ({
        type: "nav" as const,
        id: p.id,
        label: p.name,
        path: `/projects/${p.id}`,
        icon: <Flag className="h-4 w-4 text-emerald-400" />,
      })),
    ]
    list.splice(2, 0, {
      type: "nav",
      id: "users",
      label: "Users",
      path: "/users",
      icon: <Users className="h-4 w-4 text-blue-400" />,
    })
    if (projectId && user?.role === "admin") {
      list.splice(2, 0, {
        type: "nav",
        id: "settings",
        label: "Project settings",
        path: `/projects/${projectId}/settings`,
        icon: <Settings className="h-4 w-4 text-amber-400" />,
      })
    }
    list.push({
      type: "action",
      id: "signout",
      label: "Sign out",
      icon: <LogOut className="h-4 w-4 text-red-400" />,
      run: () => {
        onOpenChange(false)
        logout()
      },
    })
    if (!q) return list
    return list.filter((item) => item.label.toLowerCase().includes(q))
  }, [query, projects, projectId, user?.role, logout, onOpenChange])

  useEffect(() => {
    setSelectedIndex((i) => (i >= items.length ? Math.max(0, items.length - 1) : i))
  }, [items.length])

  const handleSelect = useCallback(
    (item: Item) => {
      if (item.type === "nav") {
        onOpenChange(false)
        navigate(item.path)
      } else {
        item.run()
      }
    },
    [navigate, onOpenChange]
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % items.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + items.length) % items.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (items[selectedIndex]) handleSelect(items[selectedIndex])
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, items, selectedIndex, handleSelect, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-xl p-0 gap-0 overflow-hidden bg-[#09090b]/80 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.1)] sm:rounded-[24px]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

        <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-4 z-10">
          <Command className="h-5 w-5 shrink-0 text-white/50" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects or actions…"
            className="flex-1 border-0 bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-0 px-0"
          />
        </div>

        <div className="relative max-h-[min(50vh,350px)] overflow-y-auto px-2 py-3 z-10 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Command className="h-8 w-8 text-white/20 mb-3" />
              <p className="text-sm text-white/50">No results found for "{query}"</p>
            </div>
          ) : (
            <ul className="space-y-1">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "relative flex w-full items-center gap-3 px-3 py-3 text-left text-[15px] font-medium transition-all rounded-xl group overflow-hidden",
                        i === selectedIndex
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {i === selectedIndex && (
                        <motion.div
                          layoutId="command-palette-active-item"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      <div
                        className={cn(
                          "relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors border",
                          i === selectedIndex
                            ? "bg-white/10 border-white/20"
                            : "bg-white/5 border-transparent group-hover:bg-white/10 group-hover:border-white/10"
                        )}
                      >
                        {item.icon}
                      </div>

                      <span className="relative z-10 truncate">{item.label}</span>

                      {i === selectedIndex && (
                        <div className="relative z-10 ml-auto flex items-center gap-1">
                          <span className="text-xs text-white/40">Press</span>
                          <kbd className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 font-sans text-[10px] font-medium text-white/70">
                            ↵
                          </kbd>
                        </div>
                      )}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="relative border-t border-white/5 bg-black/20 px-4 py-3 text-xs text-white/40 flex items-center gap-4 z-10 rounded-b-[24px]">
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 bg-white/10 items-center rounded px-1.5 font-sans shadow-sm ring-1 ring-white/10">
              ↑
            </kbd>
            <kbd className="inline-flex h-5 bg-white/10 items-center rounded px-1.5 font-sans shadow-sm ring-1 ring-white/10">
              ↓
            </kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 bg-white/10 items-center rounded px-1.5 font-sans shadow-sm ring-1 ring-white/10">
              ↵
            </kbd>
            <span>select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 bg-white/10 items-center rounded px-2 font-sans shadow-sm ring-1 ring-white/10">
              esc
            </kbd>
            <span>close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
