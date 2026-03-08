import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { PlusCircle, FolderOpen, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { api } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"
import { slugify } from "@/lib/utils"

export default function Projects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, loading, refreshProjects } = useProjects()
  const canCreateProject = user?.role === "admin" || user?.role === "developer"
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      const project = await api.createProject(name.trim(), slug.trim() || undefined)
      setDialogOpen(false)
      setName("")
      setSlug("")
      await refreshProjects()
      navigate(`/projects/${project.id}`)
      toast.success("Project created")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }

  if (loading) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Projects</h2>
           <p className="text-white/50 text-sm">Manage your feature flags environments.</p>
        </div>
        {canCreateProject && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <PlusCircle className="h-4 w-4" />
                New project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
              </DialogHeader>
              <Form.Root
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreate(e)
                }}
              >
                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium">
                    {error}
                  </div>
                )}
                <TextFieldRoot name="name">
                  <TextFieldLabel>Name</TextFieldLabel>
                  <TextFieldInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const v = e.target.value
                      setName(v)
                      setSlug((prev) => (prev === slugify(name) || !prev ? slugify(v) : prev))
                    }}
                    placeholder="My Project"
                    required
                  />
                </TextFieldRoot>
                <TextFieldRoot name="slug" className="mt-4">
                  <TextFieldLabel>Slug (optional)</TextFieldLabel>
                  <TextFieldInput
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-project"
                  />
                </TextFieldRoot>
                <DialogFooter className="mt-6 pt-6 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="bg-transparent hover:bg-white/5">
                    Cancel
                  </Button>
                  <Button type="submit">Create Project</Button>
                </DialogFooter>
              </Form.Root>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {projects.length === 0 ? (
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
         >
          <Card className="text-center overflow-hidden relative border-dashed border-white/20 bg-transparent">
            {/* Ambient glow behind empty state */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
            
            <CardContent className="pt-12 pb-12 relative z-10 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-300 shadow-inner mb-6 border border-white/10">
                <FolderOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
              <p className="max-w-md mx-auto text-white/50 text-center mb-8">
                {canCreateProject
                  ? "Get started by creating a new project. A project groups your feature flags together."
                  : "You don't have access to any projects right now."}
              </p>
              {canCreateProject && (
                <Button className="gap-2 pl-4 pr-5 h-11" onClick={() => setDialogOpen(true)}>
                  <PlusCircle className="h-[18px] w-[18px]" />
                  Create your first project
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
            >
              <Link to={`/projects/${p.id}`} className="block h-full outline-none group">
                <Card className="h-full flex flex-col transition-all duration-300 bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:from-white/[0.05] hover:to-white/[0.02] border-white/5 hover:border-violet-500/30 group-focus-visible:ring-2 group-focus-visible:ring-violet-500/50 p-6 relative overflow-hidden group-hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)]">
                  {/* Subtle top glare effect that turns violet on hover */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 group-hover:via-violet-500/50 to-transparent transition-all duration-500" />
                  
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/5 border border-white/10 group-hover:bg-violet-500/10 group-hover:border-violet-500/20 group-hover:text-violet-300 transition-colors shadow-inner">
                      <FolderOpen className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white/5 border border-white/10 text-white">
                       <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 mt-auto">
                    <p className="text-lg font-semibold text-white tracking-tight leading-tight mb-1">{p.name}</p>
                    <p className="text-sm font-mono text-white/40 truncate">{p.slug}</p>
                  </div>
                </Card>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}
