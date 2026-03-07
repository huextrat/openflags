import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Flag,
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  User,
  Command,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Outlet, useParams, useLocation } from "react-router-dom"

import { api, type Project } from "@/api"
import CommandPalette from "@/components/CommandPalette"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"
import { cn } from "@/lib/utils"

export default function Layout() {
  const { user, logout } = useAuth()
  const { projectId } = useParams()
  const location = useLocation()
  const { projects } = useProjects()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (projectId) {
      api
        .getProject(projectId)
        .then(setCurrentProject)
        .catch(() => setCurrentProject(null))
    } else {
      setCurrentProject(null)
    }
  }, [projectId])

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar - collapsible */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-gray-800/70 backdrop-blur-md transition-all duration-300 lg:static",
          sidebarCollapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-gray-100 transition-opacity hover:opacity-90"
            onClick={() => setSidebarOpen(false)}
          >
            <Flag className="h-5 w-5 shrink-0 text-violet-400" />
            {!sidebarCollapsed && <span>OpenFlags</span>}
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-auto p-3">
          <Link
            to="/users"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              location.pathname === "/users"
                ? "bg-white/10 text-gray-100"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}
          >
            <Users className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && "Users"}
          </Link>
          {!sidebarCollapsed && (
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Projects
            </div>
          )}
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                p.id === projectId
                  ? "bg-white/10 text-gray-100"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-700/50">
                <Flag className="h-4 w-4 text-gray-400" />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">{p.name}</span>
                  {p.id === projectId && (
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-500" />
                  )}
                </>
              )}
            </Link>
          ))}
          {(user?.role === "admin" || user?.role === "developer") && (
            <Link to="/projects/new" onClick={() => setSidebarOpen(false)}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <PlusCircle className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && "New project"}
              </span>
            </Link>
          )}
        </nav>
        {!sidebarCollapsed && (
          <div className="border-t border-white/5 p-3">
            <p className="truncate px-3 py-2 text-xs text-gray-500" title={user?.email}>
              {user?.email}
            </p>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Header - glass */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-gray-900/70 px-6 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-500 hover:text-gray-300"
            onClick={() => setCommandOpen(true)}
          >
            <Command className="h-4 w-4" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="pointer-events-none hidden rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs sm:inline">
              ⌘K
            </kbd>
          </Button>
          {currentProject && (
            <div className="flex flex-1 items-center justify-between gap-4">
              <h1 className="text-lg font-semibold text-gray-100">{currentProject.name}</h1>
              <div className="flex items-center gap-2">
                {user?.role === "admin" && (
                  <Link
                    to={`/projects/${currentProject.id}/settings`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-100">{user?.email}</p>
                      <p className="text-xs text-gray-500">Signed in</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/">Projects</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-red-400 focus:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          {!currentProject && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-100">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-red-400 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={projectId ?? "list"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
