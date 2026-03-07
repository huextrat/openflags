import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { PlusCircle, FolderOpen } from "lucide-react"
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

  if (loading) return <p className="text-gray-400">Loading projects…</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-100">Projects</h2>
        {canCreateProject && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
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
                <TextFieldRoot name="slug">
                  <TextFieldLabel>Slug (optional)</TextFieldLabel>
                  <TextFieldInput
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-project"
                  />
                </TextFieldRoot>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </Form.Root>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="border-white/5 text-center">
          <CardContent className="pt-8">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-400">
              {canCreateProject
                ? "No projects yet. Create one to get started."
                : "No projects yet."}
            </p>
            {canCreateProject && (
              <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                New project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <Link to={`/projects/${p.id}`}>
                <Card className="transition-all duration-200 hover:border-white/10 hover:bg-gray-800">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-700/50">
                      <FolderOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-100">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.slug}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}
