import * as Form from "@radix-ui/react-form"
import { motion, AnimatePresence } from "framer-motion"
import { Users, PlusCircle, Pencil, Trash2 } from "lucide-react"

import type { Segment } from "@/api"
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
import { TextFieldRoot, TextFieldInput, TextFieldLabel } from "@/components/ui/text-field"

interface SegmentListProps {
  segments: Segment[]
  canEditSegments: boolean
  createSegmentDialogOpen: boolean
  setCreateSegmentDialogOpen: (open: boolean) => void
  newSegmentName: string
  setNewSegmentName: (name: string) => void
  newSegmentUsersInput: string
  setNewSegmentUsersInput: (users: string) => void
  segmentError: string | null
  handleCreateSegment: (e: React.FormEvent) => void
  openEditSegment: (segment: Segment) => void
  handleDeleteSegment: (id: string) => void
}

export function SegmentList({
  segments,
  canEditSegments,
  createSegmentDialogOpen,
  setCreateSegmentDialogOpen,
  newSegmentName,
  setNewSegmentName,
  newSegmentUsersInput,
  setNewSegmentUsersInput,
  segmentError,
  handleCreateSegment,
  openEditSegment,
  handleDeleteSegment,
}: SegmentListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <p className="text-white/60 text-sm">
          Define reusable lists of User IDs to quickly target groups in your feature flags (e.g.,
          "Beta Testers").
        </p>

        {canEditSegments && (
          <Dialog open={createSegmentDialogOpen} onOpenChange={setCreateSegmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <PlusCircle className="h-4 w-4" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new segment</DialogTitle>
              </DialogHeader>
              <Form.Root className="space-y-6 mt-4" onSubmit={handleCreateSegment}>
                {segmentError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-medium">
                    {segmentError}
                  </div>
                )}
                <div className="space-y-2">
                  <TextFieldRoot name="name">
                    <TextFieldLabel>Segment Name</TextFieldLabel>
                    <TextFieldInput
                      id="name"
                      type="text"
                      value={newSegmentName}
                      onChange={(e) => setNewSegmentName(e.target.value)}
                      placeholder="e.g. Beta Testers"
                      required
                    />
                  </TextFieldRoot>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-segment-users">User IDs (whitelist)</Label>
                  <textarea
                    id="create-segment-users"
                    value={newSegmentUsersInput}
                    onChange={(e) => setNewSegmentUsersInput(e.target.value)}
                    placeholder="user-id-1&#10;user-id-2"
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-y font-mono"
                  />
                  <p className="text-[11px] text-white/40 pt-1">
                    Comma or newline separated list of user IDs. You can add or edit later.
                  </p>
                </div>
                <DialogFooter className="border-t border-white/5 pt-6 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCreateSegmentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Form.Submit asChild>
                    <Button type="submit">Create Segment</Button>
                  </Form.Submit>
                </DialogFooter>
              </Form.Root>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {segments.length === 0 ? (
        <Card className="text-center bg-transparent border-dashed border-white/20 relative overflow-hidden">
          <CardContent className="pt-16 pb-16 relative z-10 flex flex-col items-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 shadow-inner mb-6 border border-white/10">
              <Users className="h-8 w-8" />
            </div>
            <p className="mt-4 text-white/70 text-lg font-medium">No segments created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {segments.map((segment) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={segment.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white tracking-tight">{segment.name}</h3>
                    <p className="text-xs text-white/40 mt-1">
                      {segment.users?.length || 0} users • ID:{" "}
                      <span className="font-mono">{segment.id.slice(0, 8)}</span>
                    </p>
                  </div>
                </div>

                {canEditSegments && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                      onClick={() => openEditSegment(segment)}
                      title="Edit segment"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                      onClick={() => handleDeleteSegment(segment.id)}
                      title="Delete segment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
