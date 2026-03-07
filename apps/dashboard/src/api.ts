const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

function baseFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
}

export interface User {
  id: string
  email: string
  role: string
}

export interface Project {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Flag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  users?: string[]
}

export interface CreateFlagInput {
  key: string
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}

export interface UpdateFlagInput {
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}

export const api = {
  async getMe(): Promise<{ user: User } | { error: string }> {
    const res = await baseFetch("/auth/me")
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? "Unauthorized" }
    return data as { user: User }
  },

  async signup(email: string, password: string): Promise<{ user?: User; error?: string }> {
    const res = await baseFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: (data as { error?: string }).error ?? "Signup failed" }
    return data as { user: User }
  },

  async login(email: string, password: string): Promise<{ user?: User; error?: string }> {
    const res = await baseFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: (data as { error?: string }).error ?? "Login failed" }
    return data as { user: User }
  },

  async logout(): Promise<void> {
    await baseFetch("/auth/logout", { method: "POST" })
  },

  async getProjects(): Promise<Project[]> {
    const res = await baseFetch("/projects")
    if (!res.ok) throw new Error("Failed to fetch projects")
    return res.json()
  },

  async getProject(idOrSlug: string): Promise<Project | null> {
    const res = await baseFetch(`/projects/${encodeURIComponent(idOrSlug)}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error("Failed to fetch project")
    return res.json()
  },

  async createProject(name: string, slug?: string): Promise<Project> {
    const res = await baseFetch("/projects", {
      method: "POST",
      body: JSON.stringify({ name, slug }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to create project")
    }
    return res.json()
  },

  async deleteProject(projectId: string): Promise<void> {
    const res = await baseFetch(`/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to delete project")
    }
  },

  async getFlags(projectIdOrSlug: string): Promise<Flag[]> {
    const res = await fetch(`${API_URL}/projects/${encodeURIComponent(projectIdOrSlug)}/flags`, {
      credentials: "include",
    })
    if (!res.ok) throw new Error("Failed to fetch flags")
    return res.json()
  },

  async createFlag(projectIdOrSlug: string, body: CreateFlagInput): Promise<Flag> {
    const res = await baseFetch(`/projects/${encodeURIComponent(projectIdOrSlug)}/flags`, {
      method: "POST",
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to create flag")
    }
    return res.json()
  },

  async updateFlag(projectId: string, flagId: string, body: UpdateFlagInput): Promise<Flag> {
    const res = await baseFetch(
      `/projects/${encodeURIComponent(projectId)}/flags/${encodeURIComponent(flagId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    )
    if (!res.ok) throw new Error("Failed to update flag")
    return res.json()
  },

  async deleteFlag(projectId: string, flagId: string): Promise<void> {
    const res = await baseFetch(
      `/projects/${encodeURIComponent(projectId)}/flags/${encodeURIComponent(flagId)}`,
      { method: "DELETE" }
    )
    if (!res.ok) throw new Error("Failed to delete flag")
  },

  async getUsers(): Promise<User[]> {
    const res = await baseFetch("/users")
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
  },

  async inviteUser(email: string, role: string): Promise<User> {
    const res = await baseFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to invite user")
    }
    return res.json()
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    const res = await baseFetch(`/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to update role")
    }
    return res.json()
  },

  async removeUser(userId: string): Promise<void> {
    const res = await baseFetch(`/users/${encodeURIComponent(userId)}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "Failed to remove user")
    }
  },
}
