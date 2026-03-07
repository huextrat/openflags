import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { api, type Project } from "@/api"

type ProjectsContextValue = {
  projects: Project[]
  loading: boolean
  refreshProjects: () => Promise<Project[]>
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProjects = useCallback(() => {
    return api.getProjects().then((list) => {
      setProjects(list)
      setLoading(false)
      return list
    })
  }, [])

  useEffect(() => {
    refreshProjects()
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [refreshProjects])

  const value = useMemo(
    () => ({ projects, loading, refreshProjects }),
    [projects, loading, refreshProjects]
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider")
  return ctx
}
