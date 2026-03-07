import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { api, type User } from "../api"

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    const result = await api.getMe()
    if ("user" in result) {
      setUser(result.user)
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    const result = await api.login(email, password)
    if (result.error) {
      setError(result.error)
      return false
    }
    if (result.user) {
      setUser(result.user)
      return true
    }
    return false
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    setError(null)
    const result = await api.signup(email, password)
    if (result.error) {
      setError(result.error)
      return false
    }
    if (result.user) {
      setUser(result.user)
      return true
    }
    return false
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      signup,
      logout,
      refresh,
    }),
    [user, loading, error, login, signup, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
