import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { api, type Project } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshProjects } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState("")

  const isPlatformAdmin = user?.role === "admin"

  useEffect(() => {
    if (!projectId) return
    api
      .getProject(projectId)
      .then(setProject)
      .catch(() => setProject(null))
  }, [projectId])

  async function handleDeleteProject() {
    if (!projectId || !project || deleteConfirmSlug !== project.slug) return
    try {
      await api.deleteProject(projectId)
      await refreshProjects()
      setDeleteDialogOpen(false)
      setDeleteConfirmSlug("")
      navigate("/")
      toast.success("Project deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project")
    }
  }

  if (!projectId) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h2 className="text-2xl font-semibold text-gray-100">Project settings</h2>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isPlatformAdmin && project && (
          <Card className="mt-8 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-400">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-400">
                Deleting this project will remove all flags. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  setDeleteConfirmSlug("")
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete project
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <Form.Root onSubmit={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-red-400">Delete project</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-400">
                To confirm, type the project slug{" "}
                <strong className="font-mono text-gray-300">{project?.slug}</strong> below.
              </p>
              <TextFieldRoot name="delete-confirm">
                <TextFieldLabel>Project slug</TextFieldLabel>
                <TextFieldInput
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmSlug}
                  onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                  placeholder={project?.slug}
                  className="font-mono"
                  autoComplete="off"
                />
              </TextFieldRoot>
              <DialogFooter className="mt-4">
                <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!project || deleteConfirmSlug !== project.slug}
                  onClick={handleDeleteProject}
                >
                  Delete project
                </Button>
              </DialogFooter>
            </Form.Root>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
