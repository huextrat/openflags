import * as Form from "@radix-ui/react-form"
import { motion, AnimatePresence } from "framer-motion"
import { Flag, PlusCircle, Pencil, Trash2, Users, Search, SearchX } from "lucide-react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { api, type Flag as FlagType, type CreateFlagInput } from "@/api"
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
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
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
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [form, setForm] = useState<CreateFlagInput & { usersInput: string }>({
    key: "",
    enabled: false,
    rolloutPercentage: 0,
    usersInput: "",
  })
  const [editFlag, setEditFlag] = useState<FlagType | null>(null)
  const [editRollout, setEditRollout] = useState(0)
  const [editEnabled, setEditEnabled] = useState(false)
  const [editUsersInput, setEditUsersInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const canEditFlags = user?.role === "admin" || user?.role === "developer"

  const filteredFlags = useMemo(() => {
    if (!searchQuery) return flags
    return flags.filter((f) => f.key.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [flags, searchQuery])

  const loadFlags = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    api
      .getFlags(projectId)
      .then(setFlags)
      .catch(() => setFlags([]))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    loadFlags()
  }, [loadFlags])

  async function handleCreate(e: React.SubmitEvent) {
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
      })
      setFlags((prev) => [flag, ...prev])
      setDialogOpen(false)
      setForm({ key: "", enabled: false, rolloutPercentage: 0, usersInput: "" })
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
      loadFlags()
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
      loadFlags()
      toast.error("Failed to set rollout")
    }
  }

  function openEdit(flag: FlagType) {
    setEditFlag(flag)
    setEditRollout(flag.rolloutPercentage)
    setEditEnabled(flag.enabled)
    setEditUsersInput((flag.users ?? []).join("\n"))
    setError(null)
  }

  async function handleEditSave(e: React.SubmitEvent) {
    e.preventDefault()
    if (!projectId || !editFlag) return
    setError(null)
    try {
      const users = parseUsersInput(editUsersInput)
      const updated = await api.updateFlag(projectId, editFlag.id, {
        enabled: editEnabled,
        rolloutPercentage: editRollout,
        users,
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
      loadFlags()
      toast.error("Failed to delete flag")
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
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <SearchX className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {canEditFlags && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  <PlusCircle className="h-4 w-4" />
                  New flag
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create new flag</DialogTitle>
                </DialogHeader>
                <Form.Root
                  className="space-y-6 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCreate(e)
                  }}
                >
                  {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-medium">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <TextFieldRoot name="key">
                      <TextFieldLabel>Flag Key</TextFieldLabel>
                      <TextFieldInput
                        id="key"
                        type="text"
                        value={form.key}
                        onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                        placeholder="e.g. new_checkout_flow"
                        required
                        className="font-mono text-sm"
                      />
                    </TextFieldRoot>
                    <p className="text-[11px] text-white/40 pt-1">
                      Use a descriptive key, typically snake_case or kebab-case.
                    </p>
                  </div>
                  <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Default state</p>
                        <p className="text-[11px] text-white/40 mt-1">
                          Is this flag active immediately on creation?
                        </p>
                      </div>
                      <Switch
                        checked={form.enabled ?? false}
                        onCheckedChange={(checked: boolean) =>
                          setForm((p) => ({ ...p, enabled: checked }))
                        }
                      />
                    </div>
                    {form.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 pt-4 border-t border-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <Label className="text-white">Percentage Rollout</Label>
                          <span className="inline-flex h-6 w-10 items-center justify-center rounded-md bg-white/10 text-xs font-semibold tabular-nums text-white">
                            {form.rolloutPercentage ?? 0}%
                          </span>
                        </div>
                        <Slider
                          value={[form.rolloutPercentage ?? 0]}
                          onValueChange={(v) =>
                            setForm((p) => ({ ...p, rolloutPercentage: v[0] ?? 0 }))
                          }
                          max={100}
                          step={1}
                          className="pt-2"
                        />
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-users">Targeted users (whitelist, optional)</Label>
                    <textarea
                      id="create-users"
                      value={form.usersInput}
                      onChange={(e) => setForm((p) => ({ ...p, usersInput: e.target.value }))}
                      placeholder="user-id-1&#10;user-id-2"
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-y font-mono"
                    />
                    <p className="text-[11px] text-white/40 pt-1">
                      Comma or newline separated list of user IDs that will <strong>always</strong>{" "}
                      evaluate to true.
                    </p>
                  </div>
                  <DialogFooter className="border-t border-white/5 pt-6 mt-6">
                    <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Flag</Button>
                  </DialogFooter>
                </Form.Root>
              </DialogContent>
            </Dialog>
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
                      <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                        <div
                          className="flex items-center gap-1.5"
                          title={
                            flag.users?.length
                              ? flag.users.join(", ")
                              : "No specific users targeted"
                          }
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{flag.users?.length || 0} specifically targeted</span>
                        </div>
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
      <Dialog open={!!editFlag} onOpenChange={(open) => !open && setEditFlag(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Edit Flag</span>
              <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-white/10 text-violet-300">
                {editFlag?.key}
              </span>
            </DialogTitle>
          </DialogHeader>
          {editFlag && (
            <form className="space-y-6 mt-4" onSubmit={handleEditSave}>
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Feature status</p>
                    <p className="text-[11px] text-white/40 mt-1">
                      Globally enable or disable this flag
                    </p>
                  </div>
                  <Switch
                    checked={editEnabled}
                    onCheckedChange={setEditEnabled}
                    className="data-[state=checked]:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  />
                </div>

                <AnimatePresence>
                  {editEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-4 border-t border-white/5 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-white">Percentage Rollout</Label>
                        <span className="inline-flex h-6 w-10 items-center justify-center rounded-md bg-white/10 text-xs font-semibold tabular-nums text-white">
                          {editRollout}%
                        </span>
                      </div>
                      <Slider
                        value={[editRollout]}
                        onValueChange={(v) => setEditRollout(v[0] ?? 0)}
                        max={100}
                        step={1}
                        className="pt-2"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-users">Targeted specific users (whitelist)</Label>
                <textarea
                  id="edit-users"
                  value={editUsersInput}
                  onChange={(e) => setEditUsersInput(e.target.value)}
                  placeholder="user-id-1&#10;user-id-2"
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-y font-mono"
                />
                <p className="text-[11px] text-white/40 pt-1">
                  Comma or newline separated list of user IDs that will always get this feature.
                  Overrides rollout percentage.
                </p>
              </div>
              <DialogFooter className="border-t border-white/5 pt-6 mt-6">
                <Button type="button" variant="ghost" onClick={() => setEditFlag(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
