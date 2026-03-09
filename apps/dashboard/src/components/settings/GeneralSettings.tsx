import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Settings2, Code, Shield, AlertTriangle, Trash2 } from "lucide-react"

import type { Project } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TextFieldRoot, TextFieldInput } from "@/components/ui/text-field"

interface GeneralSettingsProps {
  project: Project | null
  isPlatformAdmin: boolean
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  deleteConfirmSlug: string
  setDeleteConfirmSlug: (slug: string) => void
  handleDeleteProject: () => void
}

export function GeneralSettings({
  project,
  isPlatformAdmin,
  deleteDialogOpen,
  setDeleteDialogOpen,
  deleteConfirmSlug,
  setDeleteConfirmSlug,
  handleDeleteProject,
}: GeneralSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 md:grid-cols-2"
    >
      <Card className="md:col-span-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about this project.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1 p-4 rounded-xl border border-white/5 bg-black/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Project Name
              </p>
              <p className="text-lg font-medium text-white">{project?.name || "Loading..."}</p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-white/5 bg-black/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Project Slug
              </p>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-400" />
                <p className="text-lg font-mono text-white/90">{project?.slug || "..."}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isPlatformAdmin && project && (
        <Card className="md:col-span-2 border-red-500/20 bg-red-500/[0.02] overflow-hidden relative group shadow-[0_4px_30px_rgba(239,68,68,0.05)]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
                <CardDescription className="text-white/50">
                  Irreversible, destructive actions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-xl border border-red-500/10 bg-black/40">
              <div className="space-y-1 max-w-lg">
                <h4 className="font-medium text-white">Delete Project</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Permanently delete this project and all of its feature flags. This action is not
                  reversible and will immediately break any apps depending on these flags.
                </p>
              </div>
              <Button
                variant="destructive"
                className="gap-2 shrink-0 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
                onClick={() => {
                  setDeleteConfirmSlug("")
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          <Form.Root onSubmit={(e) => e.preventDefault()}>
            <DialogHeader>
              <div className="mx-auto mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-center text-2xl text-red-400">
                Delete project
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                <p className="text-sm text-red-200/80 leading-relaxed">
                  This action will permanently delete{" "}
                  <strong className="text-red-100 font-mono tracking-tight">{project?.name}</strong>{" "}
                  and remove all associated data.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <span>Type</span>
                  <strong className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono text-xs select-all">
                    {project?.slug}
                  </strong>
                  <span>to confirm</span>
                </label>
                <TextFieldRoot name="delete-confirm">
                  <TextFieldInput
                    type="text"
                    value={deleteConfirmSlug}
                    onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                    placeholder={project?.slug}
                    className="font-mono bg-black/40 border-red-500/30 focus-visible:ring-red-500/50"
                  />
                </TextFieldRoot>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Form.Submit asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 focus:ring-red-500/50"
                    disabled={deleteConfirmSlug !== project?.slug}
                    onClick={handleDeleteProject}
                  >
                    Yes, delete project
                  </Button>
                </Form.Submit>
              </DialogFooter>
            </div>
          </Form.Root>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
