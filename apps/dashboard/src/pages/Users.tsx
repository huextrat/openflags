import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Users as UsersIcon, Mail, UserMinus, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { api, type User } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const PLATFORM_ROLES = ["member", "developer", "admin"] as const

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("member")
  const [error, setError] = useState<string | null>(null)

  const isPlatformAdmin = currentUser?.role === "admin"

  function loadUsers() {
    api
      .getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleInvite(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      const newUser = await api.inviteUser(email.trim(), role)
      setUsers((prev) => [...prev, newUser])
      setEmail("")
      toast.success(`${newUser.email} invited. They can use “Forgot password” to set a password.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite")
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const updated = await api.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success("Role updated")
    } catch {
      loadUsers()
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this user from the platform? They will lose access to all projects."))
      return
    try {
      await api.removeUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success("User removed")
    } catch {
      loadUsers()
    }
  }

  if (authLoading) return null
  if (loading) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 relative">
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Team Details</h2>
          <p className="text-white/50 text-sm">Manage the members and their platform roles.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 shadow-inner">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Platform users</CardTitle>
                <CardDescription>People with access to OpenFlags.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-2">
            {isPlatformAdmin && (
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-[40px] pointer-events-none" />
                <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-400" />
                  Invite new member
                </h4>
                <Form.Root
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleInvite(e)
                  }}
                  className="space-y-4 relative z-10"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <TextFieldRoot name="invite-email" className="flex-1 gap-2!">
                      <TextFieldLabel className="text-white/60">Email address</TextFieldLabel>
                      <div className="relative group/input">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within/input:text-violet-400 transition-colors" />
                        <TextFieldInput
                          id="invite-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="teammate@example.com"
                          className="h-11 pl-10"
                          required
                        />
                      </div>
                    </TextFieldRoot>
                    <div className="w-full sm:w-[160px] space-y-2">
                      <Label htmlFor="invite-role" className="text-white/60">
                        Role
                      </Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger
                          className="h-11 border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                          id="invite-role"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
                          {PLATFORM_ROLES.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="h-11 px-8 sm:w-auto w-full shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    >
                      Send Invite
                    </Button>
                  </div>
                </Form.Root>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white/70">Directory ({users.length})</h4>
              </div>

              <ul className="flex flex-col gap-2">
                {users.map((u, i) => {
                  const isAdmin = u.role === "admin"
                  return (
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                      key={u.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-inner border",
                            isAdmin
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}
                        >
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-white text-[15px]">{u.email}</p>
                            {u.id === currentUser?.id && (
                              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                                You
                              </span>
                            )}
                            {isAdmin && <ShieldAlert className="h-3.5 w-3.5 text-amber-400/70" />}
                          </div>
                          <p className="text-xs text-white/40 font-mono mt-0.5 tracking-wider opacity-60">
                            ID: {u.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                        {isPlatformAdmin ? (
                          <>
                            <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                              <SelectTrigger
                                className={cn(
                                  "h-9 w-[130px] border-white/10 hover:bg-white/5 transition-colors capitalize text-xs font-medium",
                                  u.role === "admin" ? "text-amber-400" : "text-white/80"
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
                                {PLATFORM_ROLES.map((r) => (
                                  <SelectItem key={r} value={r} className="capitalize text-xs">
                                    {r === "admin" ? (
                                      <span className="text-amber-400">{r}</span>
                                    ) : (
                                      r
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {u.id !== currentUser?.id ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white/40 hover:text-red-400 hover:bg-red-500/10 shrink-0 rounded-full"
                                onClick={() => handleRemove(u.id)}
                                title="Remove user"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <div className="h-9 w-9" /> // spacer
                            )}
                          </>
                        ) : (
                          <span
                            className={cn(
                              "text-sm capitalize px-3 py-1 rounded-full border",
                              isAdmin
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-white/5 text-white/60 border-white/10"
                            )}
                          >
                            {u.role}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
