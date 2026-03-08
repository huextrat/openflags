import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { ArrowLeft, Rocket, Code2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { api } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"
import { useProjects } from "@/context/ProjectsContext"
import { slugify } from "@/lib/utils"

export default function NewProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshProjects } = useProjects()
  const canCreateProject = user?.role === "admin" || user?.role === "developer"
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!canCreateProject) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <Link
          to="/"
          className="mb-6 inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
           <h3 className="text-xl font-medium text-red-400 mb-2">Access Denied</h3>
           <p className="text-white/70">You don't have permission to create projects. Contact an administrator.</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      const project = await api.createProject(name.trim(), slug.trim() || undefined)
      await refreshProjects()
      navigate(`/projects/${project.id}`, { replace: true })
      toast.success("Project created")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }

  return (
    <div className="mx-auto max-w-xl pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 text-white shadow-inner">
                  <Rocket className="h-6 w-6 text-violet-300" />
               </div>
               <div>
                  <CardTitle className="text-2xl">Create New Project</CardTitle>
                  <CardDescription className="text-white/50 text-base mt-1">Get started by naming your new feature flag environment.</CardDescription>
               </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form.Root
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
            >
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-5 rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner">
                <TextFieldRoot name="name">
                  <TextFieldLabel className="text-white/70">Project Name</TextFieldLabel>
                  <TextFieldInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const v = e.target.value
                      setName(v)
                      setSlug((prev) => (prev === slugify(name) || !prev ? slugify(v) : prev))
                    }}
                    placeholder="e.g. Acme Corp Frontend"
                    className="h-12 text-lg transition-shadow focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-white/[0.03]"
                    required
                    autoFocus
                  />
                </TextFieldRoot>
                
                <TextFieldRoot name="slug" className="relative">
                  <TextFieldLabel className="text-white/70">Project Slug <span className="text-white/40 text-xs font-normal ml-2">(Used in API)</span></TextFieldLabel>
                  <div className="relative group/input">
                    <Code2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within/input:text-violet-400 transition-colors" />
                    <TextFieldInput
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="acme-corp-frontend"
                      className="h-11 pl-10 font-mono text-sm tracking-wide bg-white/[0.02]"
                    />
                  </div>
                </TextFieldRoot>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/5 mt-8">
                <Link to="/" className="w-full sm:w-auto">
                  <Button type="button" variant="ghost" className="w-full h-11 hover:bg-white/5 text-white/70 hover:text-white">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="w-full sm:w-auto h-11 px-8 shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all">
                  Create Project
                </Button>
              </div>
            </Form.Root>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
