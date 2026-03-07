import { Command, Flag, PlusCircle, Settings, LogOut, LayoutDashboard, Users } from "lucide-react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      ...(user?.role === "admin" || user?.role === "developer"
        ? [
            {
              type: "nav" as const,
              id: "new",
              label: "New project",
              path: "/projects/new",
              icon: <PlusCircle className="h-4 w-4" />,
            },
          ]
        : []),
      ...projects.map((p) => ({
        type: "nav" as const,
        id: p.id,
        label: p.name,
        path: `/projects/${p.id}`,
        icon: <Flag className="h-4 w-4" />,
      })),
    ]
    list.splice(2, 0, {
      type: "nav",
      id: "users",
      label: "Users",
      path: "/users",
      icon: <Users className="h-4 w-4" />,
    })
    if (projectId && user?.role === "admin") {
      list.splice(2, 0, {
        type: "nav",
        id: "settings",
        label: "Project settings",
        path: `/projects/${projectId}/settings`,
        icon: <Settings className="h-4 w-4" />,
      })
    }
    list.push({
      type: "action",
      id: "signout",
      label: "Sign out",
      icon: <LogOut className="h-4 w-4" />,
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
        showClose={true}
        className="max-w-lg border-white/10 bg-gray-800/95 p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <Command className="h-4 w-4 shrink-0 text-gray-500" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects or actions…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[min(60vh,400px)] overflow-auto py-2">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No results</p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      i === selectedIndex
                        ? "bg-white/10 text-gray-100"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    )}
                  >
                    <span className="text-gray-500">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-white/5 px-4 py-2 text-xs text-gray-600">
          <kbd className="rounded bg-gray-700/50 px-1.5 py-0.5">↑↓</kbd> navigate
          {" · "}
          <kbd className="rounded bg-gray-700/50 px-1.5 py-0.5">↵</kbd> select
          {" · "}
          <kbd className="rounded bg-gray-700/50 px-1.5 py-0.5">esc</kbd> close
        </p>
      </DialogContent>
    </Dialog>
  )
}
