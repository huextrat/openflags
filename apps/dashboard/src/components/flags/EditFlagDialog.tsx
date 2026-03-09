import * as Form from "@radix-ui/react-form"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

import type { Flag as FlagType, Segment } from "@/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface EditFlagDialogProps {
  flag: FlagType | null
  onOpenChange: (open: boolean) => void
  editEnabled: boolean
  setEditEnabled: (enabled: boolean) => void
  editRollout: number
  setEditRollout: (rollout: number) => void
  editSegmentsInput: string[]
  segments: Segment[]
  onToggleSegment: (segmentId: string, forCreate: boolean) => void
  editUsersInput: string
  setEditUsersInput: (input: string) => void
  onSubmit: (e: React.FormEvent) => void
  error: string | null
}

export function EditFlagDialog({
  flag,
  onOpenChange,
  editEnabled,
  setEditEnabled,
  editRollout,
  setEditRollout,
  editSegmentsInput,
  segments,
  onToggleSegment,
  editUsersInput,
  setEditUsersInput,
  onSubmit,
  error,
}: EditFlagDialogProps) {
  return (
    <Dialog open={!!flag} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Edit Flag</span>
            <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-white/10 text-violet-300">
              {flag?.key}
            </span>
          </DialogTitle>
        </DialogHeader>
        {flag && (
          <Form.Root className="space-y-6 mt-4" onSubmit={onSubmit}>
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

            {segments.length > 0 && (
              <div className="space-y-2">
                <Label>Target Segments</Label>
                <div className="grid gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {segments.map((segment) => {
                    const isSelected = editSegmentsInput.includes(segment.id)
                    return (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => onToggleSegment(segment.id, false)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                          isSelected
                            ? "border-violet-500/50 bg-violet-500/10"
                            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{segment.name}</p>
                          <p className="text-xs text-white/40">
                            {segment.users?.length || 0} users
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Form.Submit asChild>
                <Button type="submit">Save Changes</Button>
              </Form.Submit>
            </DialogFooter>
          </Form.Root>
        )}
      </DialogContent>
    </Dialog>
  )
}
