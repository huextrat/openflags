import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Flag,
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
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
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "p")) {
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
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar - vitrine-style glass */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#09090b]/40 backdrop-blur-3xl transition-all duration-300 lg:static shadow-[10px_0_50px_rgba(0,0,0,0.5)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 bg-white/[0.02]">
          <Link
            to="/"
            className="flex items-center gap-3 font-semibold text-white transition-opacity hover:opacity-80 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow duration-300">
              <Flag className="h-4 w-4 text-violet-300" />
            </div>
            <span className="tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              OpenFlags
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-auto p-3 custom-scrollbar relative z-10">
          <Link
            to="/users"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              location.pathname === "/users"
                ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            )}
          >
            <Users className="h-4 w-4 shrink-0" />
            Users
          </Link>

          <div className="px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Projects
          </div>

          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                p.id === projectId
                  ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              {p.id === projectId && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                />
              )}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 border",
                  p.id === projectId
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "bg-white/5 text-white/50 border-white/5 group-hover:border-white/20 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                )}
              >
                <span className="text-[11px] font-bold">{p.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="truncate">{p.name}</span>
              {p.id === projectId && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/40" />
              )}
            </Link>
          ))}

          <div className="pt-4">
            {(user?.role === "admin" || user?.role === "developer") && (
              <Link to="/projects/new" onClick={() => setSidebarOpen(false)}>
                <span className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/40 border border-transparent transition-all hover:border-white/20 hover:bg-white/5 hover:text-white group">
                  <PlusCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-400" />
                  New project
                </span>
              </Link>
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4 bg-white/[0.02] backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2 px-3 hover:bg-white/10 transition-colors cursor-pointer border border-white/10 shadow-inner group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-sm font-medium text-white group-hover:text-cyan-100 transition-colors"
                title={user?.email}
              >
                {user?.email}
              </p>
              <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider font-semibold">
                {user?.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 flex flex-col min-w-0 z-10">
        {/* Header - vitrine-style glass */}
        <header className="sticky top-0 z-30 shrink-0 flex h-16 items-center gap-4 border-b border-white/10 bg-[#09090b]/40 px-6 backdrop-blur-2xl shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-white/50 hover:text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl h-10 px-4 w-64 justify-start font-normal shadow-inner transition-all hover:border-white/20"
            onClick={() => setCommandOpen(true)}
          >
            <Command className="h-4 w-4 text-violet-400/70" />
            <span className="hidden sm:inline text-[13px]">Search projects or flags...</span>
            <kbd className="ml-auto pointer-events-none hidden items-center justify-center rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-medium text-white/50 sm:inline-flex h-5 border border-white/5 shadow-sm">
              ⌘K
            </kbd>
          </Button>

          <div className="ml-auto flex items-center gap-4 shrink-0">
            {currentProject && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <h1 className="text-[13px] font-medium text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1 shadow-inner">
                    Project{" "}
                    <span className="text-white ml-1 font-semibold">{currentProject.name}</span>
                  </h1>
                </div>

                {user?.role === "admin" && (
                  <Link
                    to={`/projects/${currentProject.id}/settings`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-white/60 transition-all border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                )}

                <div className="w-px h-6 bg-white/10 hidden sm:block mx-1" />
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 bg-white/5 hover:bg-white/15 border border-white/10 shadow-inner hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <User className="h-5 w-5 text-white/70 relative z-10" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 rounded-2xl border-white/10 bg-[#09090b]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.1)] p-2"
              >
                <div className="px-3 py-2.5">
                  <p className="text-[13px] font-medium text-white truncate">{user?.email}</p>
                  <p className="text-[10px] uppercase tracking-wider text-green-400 mt-0.5 flex items-center gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />{" "}
                    Active session
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-white/10 my-1" />
                <DropdownMenuItem
                  asChild
                  className="focus:bg-white/10 rounded-xl mx-1 my-1 px-3 py-2 cursor-pointer transition-colors"
                >
                  <Link to="/" className="flex items-center text-[13px] font-medium">
                    Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-white/10 rounded-xl mx-1 my-1 px-3 py-2 cursor-pointer transition-colors"
                >
                  <Link to="/account" className="flex items-center text-[13px] font-medium">
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/20 rounded-xl mx-1 my-1 px-3 py-2 cursor-pointer transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-[13px] font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 lg:p-12 relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={projectId ?? location.pathname ?? "list"}
              initial={{ opacity: 0, filter: "blur(8px)", y: 15, scale: 0.98 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)", y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.2, 1, 0.4, 1] }}
              className="max-w-[1200px] mx-auto w-full pb-20"
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
