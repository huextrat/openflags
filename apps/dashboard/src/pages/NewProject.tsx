import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { api } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"
import { slugify } from "@/lib/utils"

export default function NewProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshProjects } = useProjects()
  const canCreateProject = user?.role === "admin" || user?.role === "developer"
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!canCreateProject) {
    return (
      <div className="max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>
        <p className="text-gray-400">You don’t have permission to create projects.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      const project = await api.createProject(name.trim(), slug.trim() || undefined)
      await refreshProjects()
      navigate(`/projects/${project.id}`, { replace: true })
      toast.success("Project created")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg"
    >
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>
      <Card className="border-white/5">
        <CardHeader>
          <CardTitle className="text-gray-100">Create project</CardTitle>
        </CardHeader>
        <CardContent>
          <Form.Root
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
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
            <div className="flex gap-3">
              <Button type="submit">Create</Button>
              <Link to="/">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </Form.Root>
        </CardContent>
      </Card>
    </motion.div>
  )
}
