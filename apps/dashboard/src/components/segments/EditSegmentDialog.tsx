import * as Form from "@radix-ui/react-form"

import type { Segment } from "@/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TextFieldRoot, TextFieldInput, TextFieldLabel } from "@/components/ui/text-field"

interface EditSegmentDialogProps {
  editSegment: Segment | null
  setEditSegment: (segment: Segment | null) => void
  editSegmentName: string
  setEditSegmentName: (name: string) => void
  editSegmentUsersInput: string
  setEditSegmentUsersInput: (users: string) => void
  segmentError: string | null
  handleEditSegmentSave: (e: React.FormEvent) => void
}

export function EditSegmentDialog({
  editSegment,
  setEditSegment,
  editSegmentName,
  setEditSegmentName,
  editSegmentUsersInput,
  setEditSegmentUsersInput,
  segmentError,
  handleEditSegmentSave,
}: EditSegmentDialogProps) {
  return (
    <Dialog open={!!editSegment} onOpenChange={(open) => !open && setEditSegment(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Segment</DialogTitle>
        </DialogHeader>
        <Form.Root className="space-y-6 mt-4" onSubmit={handleEditSegmentSave}>
          {segmentError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium">
              {segmentError}
            </div>
          )}

          <div className="space-y-2">
            <TextFieldRoot name="edit-name">
              <TextFieldLabel>Segment Name</TextFieldLabel>
              <TextFieldInput
                id="edit-name"
                type="text"
                value={editSegmentName}
                onChange={(e) => setEditSegmentName(e.target.value)}
                placeholder="e.g. Premium Users"
                required
              />
            </TextFieldRoot>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-segment-users">User IDs</Label>
            <textarea
              id="edit-segment-users"
              value={editSegmentUsersInput}
              onChange={(e) => setEditSegmentUsersInput(e.target.value)}
              placeholder="user-id-1&#10;user-id-2"
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-y font-mono"
            />
          </div>
          <DialogFooter className="border-t border-white/5 pt-6 mt-6">
            <Button type="button" variant="ghost" onClick={() => setEditSegment(null)}>
              Cancel
            </Button>
            <Form.Submit asChild>
              <Button type="submit">Save Changes</Button>
            </Form.Submit>
          </DialogFooter>
        </Form.Root>
      </DialogContent>
    </Dialog>
  )
}
