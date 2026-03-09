import { motion, AnimatePresence } from "framer-motion"
import { Flag, PlusCircle, Search, SearchX, Users, Pencil, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { api, type Flag as FlagType, type CreateFlagInput, type Segment } from "@/api"
import { CreateFlagDialog } from "@/components/flags/CreateFlagDialog"
import { EditFlagDialog } from "@/components/flags/EditFlagDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

function parseUsersInput(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ProjectFlags() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const [flags, setFlags] = useState<FlagType[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [form, setForm] = useState<
    CreateFlagInput & { usersInput: string; segmentsInput: string[] }
  >({
    key: "",
    enabled: false,
    rolloutPercentage: 0,
    usersInput: "",
    segmentsInput: [],
  })

  const [editFlag, setEditFlag] = useState<FlagType | null>(null)
  const [editRollout, setEditRollout] = useState(0)
  const [editEnabled, setEditEnabled] = useState(false)
  const [editUsersInput, setEditUsersInput] = useState("")
  const [editSegmentsInput, setEditSegmentsInput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const canEditFlags = user?.role === "admin" || user?.role === "developer"

  const filteredFlags = useMemo(() => {
    if (!searchQuery) return flags
    return flags.filter((f) => f.key.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [flags, searchQuery])

  const loadFlagsAndSegments = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    Promise.all([api.getFlags(projectId), api.getSegments(projectId)])
      .then(([flagsData, segmentsData]) => {
        setFlags(flagsData)
        setSegments(segmentsData)
      })
      .catch(() => {
        setFlags([])
        setSegments([])
      })
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    loadFlagsAndSegments()
  }, [loadFlagsAndSegments])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setError(null)
    try {
      const users = parseUsersInput(form.usersInput)
      const flag = await api.createFlag(projectId, {
        key: form.key,
        enabled: form.enabled,
        rolloutPercentage: form.rolloutPercentage ?? 0,
        ...(users.length > 0 && { users }),
        ...(form.segmentsInput.length > 0 && { segments: form.segmentsInput }),
      })
      setFlags((prev) => [flag, ...prev])
      setDialogOpen(false)
      setForm({ key: "", enabled: false, rolloutPercentage: 0, usersInput: "", segmentsInput: [] })
      toast.success("Flag created")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flag")
    }
  }

  async function toggleEnabled(flag: FlagType) {
    if (!projectId) return

    // Optimistic update
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: !flag.enabled } : f)))

    try {
      const updated = await api.updateFlag(projectId, flag.id, { enabled: !flag.enabled })
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      if (updated.enabled) {
        toast.success(`${updated.key} enabled`)
      } else {
        toast(`${updated.key} disabled`)
      }
    } catch {
      loadFlagsAndSegments()
      toast.error("Failed to update flag")
    }
  }

  async function handleRolloutChange(flagId: string, value: number[]) {
    if (!projectId || value.length === 0) return
    const v = value[0]

    // Optimistic update
    setFlags((prev) => prev.map((f) => (f.id === flagId ? { ...f, rolloutPercentage: v } : f)))

    try {
      const updated = await api.updateFlag(projectId, flagId, { rolloutPercentage: v })
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      loadFlagsAndSegments()
      toast.error("Failed to set rollout")
    }
  }

  function openEdit(flag: FlagType) {
    setEditFlag(flag)
    setEditRollout(flag.rolloutPercentage)
    setEditEnabled(flag.enabled)
    setEditUsersInput((flag.users ?? []).join("\n"))
    setEditSegmentsInput(flag.segments ?? [])
    setError(null)
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId || !editFlag) return
    setError(null)
    try {
      const users = parseUsersInput(editUsersInput)
      const updated = await api.updateFlag(projectId, editFlag.id, {
        enabled: editEnabled,
        rolloutPercentage: editRollout,
        users,
        segments: editSegmentsInput,
      })
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setEditFlag(null)
      toast.success("Flag updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update flag")
    }
  }

  async function handleDelete(flagId: string) {
    if (!projectId) return
    if (!confirm("Delete this flag? This action cannot be undone.")) return

    // Optimistic
    setFlags((prev) => prev.filter((f) => f.id !== flagId))

    try {
      await api.deleteFlag(projectId, flagId)
      toast.success("Flag deleted")
    } catch {
      loadFlagsAndSegments()
      toast.error("Failed to delete flag")
    }
  }

  function toggleSegmentSelection(segmentId: string, forCreate: boolean) {
    if (forCreate) {
      setForm((prev) => ({
        ...prev,
        segmentsInput: prev.segmentsInput.includes(segmentId)
          ? prev.segmentsInput.filter((id) => id !== segmentId)
          : [...prev.segmentsInput, segmentId],
      }))
    } else {
      setEditSegmentsInput((prev) =>
        prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
      )
    }
  }

  if (!projectId) return null
  if (loading) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Feature Flags</h2>
          <p className="text-white/50 text-sm">Control the release of features safely.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {flags.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <SearchX className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {canEditFlags && (
            <CreateFlagDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              form={form}
              setForm={setForm}
              segments={segments}
              onToggleSegment={toggleSegmentSelection}
              onSubmit={handleCreate}
              error={error}
              triggerTrigger={
                <Button className="w-full sm:w-auto gap-2 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  <PlusCircle className="h-4 w-4" />
                  New flag
                </Button>
              }
            />
          )}
        </div>
      </div>

      {flags.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center bg-transparent border-dashed border-white/20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
            <CardContent className="pt-16 pb-16 relative z-10 flex flex-col items-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 shadow-inner mb-6 border border-white/10">
                <Flag className="h-8 w-8" />
              </div>
              <p className="mt-4 text-white/70 text-lg font-medium">
                {canEditFlags ? "No feature flags created yet." : "No flags in this project."}
              </p>
              {canEditFlags && (
                <Button
                  className="mt-8 gap-2 h-11 px-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  onClick={() => setDialogOpen(true)}
                >
                  <PlusCircle className="h-[18px] w-[18px]" />
                  Create your first flag
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : filteredFlags.length === 0 ? (
        <div className="py-12 text-center text-white/50">
          <SearchX className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p>No flags found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* Custom animated list */}
          <AnimatePresence initial={false}>
            {filteredFlags.map((flag, idx) => {
              const isActive = flag.enabled && flag.rolloutPercentage > 0
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: idx * 0.03, ease: "easeOut" }}
                  key={flag.id}
                  className={cn(
                    "group relative flex flex-col lg:flex-row lg:items-center gap-6 rounded-[20px] border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] overflow-hidden",
                    isActive && "shadow-[0_4px_30px_rgba(139,92,246,0.05)] border-white/10"
                  )}
                >
                  {/* Subtle active glow */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent pointer-events-none" />
                  )}

                  {/* Flag Identity */}
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div
                      className={cn(
                        "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-colors",
                        flag.enabled
                          ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                          : "bg-white/5 border-white/10 text-white/30"
                      )}
                    >
                      <Flag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-mono text-[15px] font-semibold text-white tracking-tight truncate">
                          {flag.key}
                        </h3>
                        {!flag.enabled && (
                          <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50 uppercase tracking-widest">
                            Off
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/40">
                        <div
                          className="flex items-center gap-1.5"
                          title={
                            flag.users?.length
                              ? flag.users.join(", ")
                              : "No specific users targeted"
                          }
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{flag.users?.length || 0} explicitly targeted</span>
                        </div>
                        {flag.segments && flag.segments.length > 0 && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5 text-violet-300/80">
                              <span>{flag.segments.length} segments</span>
                            </div>
                          </>
                        )}
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="font-mono text-[10px] uppercase tracking-wider opacity-50">
                          ID: {flag.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-6 lg:gap-10 border-t border-white/5 pt-4 lg:pt-0 lg:border-t-0 pl-[3.25rem] lg:pl-0">
                    {/* Toggle */}
                    <div className="flex flex-col gap-2 min-w-[5rem]">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Status
                      </span>
                      {canEditFlags ? (
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={() => toggleEnabled(flag)}
                            className={cn(
                              "data-[state=checked]:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-medium",
                              flag.enabled ? "text-violet-300" : "text-white/40"
                            )}
                          >
                            {flag.enabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "text-xs font-medium",
                            flag.enabled ? "text-violet-300" : "text-white/40"
                          )}
                        >
                          {flag.enabled ? "Active" : "Disabled"}
                        </span>
                      )}
                    </div>

                    {/* Rollout */}
                    <div className="flex flex-col gap-2 w-full lg:w-48 xl:w-64 max-w-[200px]">
                      <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        <span>Traffic</span>
                        <span className="text-white/70 font-mono tracking-normal">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                      {canEditFlags ? (
                        <div className="relative pt-1 flex items-center group/slider">
                          <Slider
                            disabled={!flag.enabled}
                            value={[flag.rolloutPercentage]}
                            onValueChange={(value) => handleRolloutChange(flag.id, value)}
                            max={100}
                            step={1}
                            className={cn(
                              "transition-opacity",
                              !flag.enabled && "opacity-40 grayscale"
                            )}
                          />
                        </div>
                      ) : (
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 mt-1">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              flag.enabled
                                ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                : "bg-white/20"
                            )}
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canEditFlags && (
                      <div className="flex items-center gap-1 shrink-0 ml-auto lg:ml-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                          onClick={() => openEdit(flag)}
                          title="Edit flag"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                          onClick={() => handleDelete(flag.id)}
                          title="Delete flag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      {/* Edit Dialog */}
      <EditFlagDialog
        flag={editFlag}
        onOpenChange={(open) => !open && setEditFlag(null)}
        editEnabled={editEnabled}
        setEditEnabled={setEditEnabled}
        editRollout={editRollout}
        setEditRollout={setEditRollout}
        editSegmentsInput={editSegmentsInput}
        segments={segments}
        onToggleSegment={toggleSegmentSelection}
        editUsersInput={editUsersInput}
        setEditUsersInput={setEditUsersInput}
        onSubmit={handleEditSave}
        error={error}
      />
    </div>
  )
}
