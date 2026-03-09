import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

import type { CreateFlagInput, Segment } from "@/api"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

interface CreateFlagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: CreateFlagInput & { usersInput: string; segmentsInput: string[] }
  setForm: React.Dispatch<
    React.SetStateAction<CreateFlagInput & { usersInput: string; segmentsInput: string[] }>
  >
  segments: Segment[]
  onToggleSegment: (segmentId: string, forCreate: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  error: string | null
  triggerTrigger?: React.ReactNode
}

export function CreateFlagDialog({
  open,
  onOpenChange,
  form,
  setForm,
  segments,
  onToggleSegment,
  onSubmit,
  error,
  triggerTrigger,
}: CreateFlagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerTrigger && <DialogTrigger asChild>{triggerTrigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new flag</DialogTitle>
        </DialogHeader>
        <Form.Root className="space-y-6 mt-4" onSubmit={onSubmit}>
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
                onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, enabled: checked }))}
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
                  onValueChange={(v) => setForm((p) => ({ ...p, rolloutPercentage: v[0] ?? 0 }))}
                  max={100}
                  step={1}
                  className="pt-2"
                />
              </motion.div>
            )}
          </div>

          {segments.length > 0 && (
            <div className="space-y-2">
              <Label>Target Segments</Label>
              <div className="grid gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {segments.map((segment) => {
                  const isSelected = form.segmentsInput.includes(segment.id)
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => onToggleSegment(segment.id, true)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{segment.name}</p>
                        <p className="text-xs text-white/40">{segment.users?.length || 0} users</p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-users">Targeted specific users (whitelist)</Label>
            <textarea
              id="create-users"
              value={form.usersInput}
              onChange={(e) => setForm((p) => ({ ...p, usersInput: e.target.value }))}
              placeholder="user-id-1&#10;user-id-2"
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-y font-mono"
            />
            <p className="text-[11px] text-white/40 pt-1">
              Comma or newline separated list of user IDs that will <strong>always</strong> evaluate
              to true.
            </p>
          </div>
          <DialogFooter className="border-t border-white/5 pt-6 mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Form.Submit asChild>
              <Button type="submit">Create Flag</Button>
            </Form.Submit>
          </DialogFooter>
        </Form.Root>
      </DialogContent>
    </Dialog>
  )
}
