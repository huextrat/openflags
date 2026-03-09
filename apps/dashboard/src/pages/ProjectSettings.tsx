import * as Tabs from "@radix-ui/react-tabs"
import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { api, type Project, type Segment } from "@/api"
import { EditSegmentDialog } from "@/components/segments/EditSegmentDialog"
import { SegmentList } from "@/components/segments/SegmentList"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"

function parseUsersInput(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshProjects } = useProjects()

  const [project, setProject] = useState<Project | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])

  // Project Delete UI
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState("")

  // Segment Create UI
  const [createSegmentDialogOpen, setCreateSegmentDialogOpen] = useState(false)
  const [newSegmentName, setNewSegmentName] = useState("")
  const [newSegmentUsersInput, setNewSegmentUsersInput] = useState("")
  const [segmentError, setSegmentError] = useState<string | null>(null)

  // Segment Edit UI
  const [editSegment, setEditSegment] = useState<Segment | null>(null)
  const [editSegmentName, setEditSegmentName] = useState("")
  const [editSegmentUsersInput, setEditSegmentUsersInput] = useState("")

  const isPlatformAdmin = user?.role === "admin"
  const canEditSegments = user?.role === "admin" || user?.role === "developer"

  const loadSegments = useCallback(() => {
    if (!projectId) return
    api
      .getSegments(projectId)
      .then(setSegments)
      .catch(() => setSegments([]))
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    api
      .getProject(projectId)
      .then(setProject)
      .catch(() => setProject(null))

    loadSegments()
  }, [projectId, loadSegments])

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

  async function handleCreateSegment(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setSegmentError(null)
    try {
      const users = parseUsersInput(newSegmentUsersInput)
      const segment = await api.createSegment(projectId, {
        name: newSegmentName,
        ...(users.length > 0 && { users }),
      })
      setSegments((prev) => [segment, ...prev])
      setCreateSegmentDialogOpen(false)
      setNewSegmentName("")
      setNewSegmentUsersInput("")
      toast.success("Segment created")
    } catch (err) {
      setSegmentError(err instanceof Error ? err.message : "Failed to create segment")
    }
  }

  function openEditSegment(segment: Segment) {
    setEditSegment(segment)
    setEditSegmentName(segment.name)
    setEditSegmentUsersInput((segment.users ?? []).join("\n"))
    setSegmentError(null)
  }

  async function handleEditSegmentSave(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId || !editSegment) return
    setSegmentError(null)
    try {
      const users = parseUsersInput(editSegmentUsersInput)
      const updated = await api.updateSegment(projectId, editSegment.id, {
        name: editSegmentName,
        users,
      })
      setSegments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setEditSegment(null)
      toast.success("Segment updated")
    } catch (err) {
      setSegmentError(err instanceof Error ? err.message : "Failed to update segment")
    }
  }

  async function handleDeleteSegment(segmentId: string) {
    if (!projectId) return
    if (!confirm("Delete this segment? Flags using it will no longer match its users.")) return

    setSegments((prev) => prev.filter((s) => s.id !== segmentId))

    try {
      await api.deleteSegment(projectId, segmentId)
      toast.success("Segment deleted")
    } catch {
      loadSegments()
      toast.error("Failed to delete segment")
    }
  }

  if (!projectId) return null

  return (
    <div className="space-y-8 pb-12 relative max-w-5xl mx-auto">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Project Settings</h2>
          <p className="text-white/50 text-sm">
            Manage configuration, environments, and user segments for{" "}
            {project?.name || "this project"}.
          </p>
        </div>
      </div>

      <Tabs.Root defaultValue="general" className="w-full relative z-10">
        <Tabs.List
          className="flex w-full mb-8 border-b border-white/10"
          aria-label="Project Settings"
        >
          <Tabs.Trigger
            value="general"
            className="px-4 py-3 text-sm font-medium text-white/50 hover:text-white data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 transition-colors bg-transparent border-0 outline-none cursor-pointer"
          >
            General
          </Tabs.Trigger>
          <Tabs.Trigger
            value="segments"
            className="px-4 py-3 text-sm font-medium text-white/50 hover:text-white data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 transition-colors bg-transparent border-0 outline-none cursor-pointer"
          >
            User Segments
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general" className="outline-none">
          <GeneralSettings
            project={project}
            isPlatformAdmin={isPlatformAdmin}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            deleteConfirmSlug={deleteConfirmSlug}
            setDeleteConfirmSlug={setDeleteConfirmSlug}
            handleDeleteProject={handleDeleteProject}
          />
        </Tabs.Content>

        <Tabs.Content value="segments" className="outline-none">
          <SegmentList
            segments={segments}
            canEditSegments={canEditSegments}
            createSegmentDialogOpen={createSegmentDialogOpen}
            setCreateSegmentDialogOpen={setCreateSegmentDialogOpen}
            newSegmentName={newSegmentName}
            setNewSegmentName={setNewSegmentName}
            newSegmentUsersInput={newSegmentUsersInput}
            setNewSegmentUsersInput={setNewSegmentUsersInput}
            segmentError={segmentError}
            handleCreateSegment={handleCreateSegment}
            openEditSegment={openEditSegment}
            handleDeleteSegment={handleDeleteSegment}
          />
        </Tabs.Content>
      </Tabs.Root>

      {/* Edit Segment Dialog */}
      <EditSegmentDialog
        editSegment={editSegment}
        setEditSegment={setEditSegment}
        editSegmentName={editSegmentName}
        setEditSegmentName={setEditSegmentName}
        editSegmentUsersInput={editSegmentUsersInput}
        setEditSegmentUsersInput={setEditSegmentUsersInput}
        segmentError={segmentError}
        handleEditSegmentSave={handleEditSegmentSave}
      />
    </div>
  )
}
