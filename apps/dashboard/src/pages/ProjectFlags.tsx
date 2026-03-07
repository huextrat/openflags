import * as Form from "@radix-ui/react-form"
import { Flag, PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
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

export default function ProjectFlags() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const [flags, setFlags] = useState<FlagType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CreateFlagInput>({
    key: "",
    enabled: false,
    rolloutPercentage: 0,
  })
  const [editFlag, setEditFlag] = useState<FlagType | null>(null)
  const [editRollout, setEditRollout] = useState(0)
  const [editEnabled, setEditEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canEditFlags = user?.role === "admin" || user?.role === "developer"

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
      const flag = await api.createFlag(projectId, {
        key: form.key,
        enabled: form.enabled,
        rolloutPercentage: form.rolloutPercentage ?? 0,
      })
      setFlags((prev) => [...prev, flag])
      setDialogOpen(false)
      setForm({ key: "", enabled: false, rolloutPercentage: 0 })
      toast.success("Flag created")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flag")
    }
  }

  async function toggleEnabled(flag: FlagType) {
    if (!projectId) return
    try {
      const updated = await api.updateFlag(projectId, flag.id, { enabled: !flag.enabled })
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      loadFlags()
    }
  }

  async function handleRolloutChange(flagId: string, value: number[]) {
    if (!projectId || value.length === 0) return
    const v = value[0]
    try {
      const updated = await api.updateFlag(projectId, flagId, { rolloutPercentage: v })
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      loadFlags()
    }
  }

  function openEdit(flag: FlagType) {
    setEditFlag(flag)
    setEditRollout(flag.rolloutPercentage)
    setEditEnabled(flag.enabled)
    setError(null)
  }

  async function handleEditSave(e: React.SubmitEvent) {
    e.preventDefault()
    if (!projectId || !editFlag) return
    setError(null)
    try {
      const updated = await api.updateFlag(projectId, editFlag.id, {
        enabled: editEnabled,
        rolloutPercentage: editRollout,
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
    if (!confirm("Delete this flag?")) return
    try {
      await api.deleteFlag(projectId, flagId)
      setFlags((prev) => prev.filter((f) => f.id !== flagId))
      toast.success("Flag deleted")
    } catch {
      loadFlags()
    }
  }

  if (!projectId) return null
  if (loading) return <p className="text-gray-400">Loading flags…</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-100">Flags</h2>
        {canEditFlags && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create flag</DialogTitle>
              </DialogHeader>
              <Form.Root
                className="space-y-6"
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
                <div className="space-y-2">
                  <TextFieldRoot name="key">
                    <TextFieldLabel>Key</TextFieldLabel>
                    <TextFieldInput
                      id="key"
                      type="text"
                      value={form.key}
                      onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                      placeholder="new_feature"
                      required
                    />
                  </TextFieldRoot>
                  <p className="text-xs text-gray-500">e.g. new_feature, dark_mode</p>
                </div>
                <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-sm font-medium text-gray-400">Default state</p>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.enabled ?? false}
                      onCheckedChange={(checked: boolean) =>
                        setForm((p) => ({ ...p, enabled: checked }))
                      }
                    />
                    <span className="text-sm text-gray-300">Enabled</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Rollout %</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[form.rolloutPercentage ?? 0]}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, rolloutPercentage: v[0] ?? 0 }))
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-8 text-sm tabular-nums text-gray-400">
                        {form.rolloutPercentage ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
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

      {flags.length === 0 ? (
        <Card className="border-white/5 text-center">
          <CardContent className="pt-8">
            <Flag className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-400">
              {canEditFlags
                ? "No flags in this project. Create one to get started."
                : "No flags in this project."}
            </p>
            {canEditFlags && (
              <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                New flag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-white/5 p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Key
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Enabled
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rollout %
                  </th>
                  {canEditFlags && (
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {flags.map((flag) => (
                  <tr key={flag.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-gray-100">{flag.key}</td>
                    <td className="px-6 py-4">
                      {canEditFlags ? (
                        <label className="flex cursor-pointer items-center gap-2">
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={() => toggleEnabled(flag)}
                          />
                          <span className="text-sm text-gray-400">
                            {flag.enabled ? "On" : "Off"}
                          </span>
                        </label>
                      ) : (
                        <span className="text-sm text-gray-400">{flag.enabled ? "On" : "Off"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {canEditFlags ? (
                        <>
                          <div className="w-32">
                            <Slider
                              value={[flag.rolloutPercentage]}
                              onValueChange={(value) => handleRolloutChange(flag.id, value)}
                              max={100}
                              step={1}
                            />
                          </div>
                          <span className="mt-1 block text-xs text-gray-500">
                            {flag.rolloutPercentage}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">{flag.rolloutPercentage}%</span>
                      )}
                    </td>
                    {canEditFlags && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-400 hover:text-gray-200"
                            onClick={() => openEdit(flag)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDelete(flag.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!editFlag} onOpenChange={(open) => !open && setEditFlag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit flag {editFlag?.key}</DialogTitle>
          </DialogHeader>
          {editFlag && (
            <form className="space-y-5" onSubmit={handleEditSave}>
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <Switch checked={editEnabled} onCheckedChange={setEditEnabled} />
                  <span className="text-sm font-medium text-gray-400">Enabled</span>
                </label>
              </div>
              <div className="space-y-4">
                <Label>Rollout %</Label>
                <div className="space-y-2">
                  <Slider
                    value={[editRollout]}
                    onValueChange={(v) => setEditRollout(v[0] ?? 0)}
                    max={100}
                    step={1}
                  />
                  <p className="text-xs text-gray-500">{editRollout}%</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditFlag(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
