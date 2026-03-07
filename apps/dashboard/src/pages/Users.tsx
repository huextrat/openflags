import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Users as UsersIcon, Mail, UserMinus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { api, type User } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  if (authLoading) return <p className="text-gray-400">Loading…</p>
  if (loading) return <p className="text-gray-400">Loading users…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h2 className="text-2xl font-semibold text-gray-100">Users</h2>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-gray-100">Platform users</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {isPlatformAdmin && (
              <Form.Root
                onSubmit={(e) => {
                  e.preventDefault()
                  handleInvite(e)
                }}
                className="space-y-4"
              >
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 sm:items-end">
                  <TextFieldRoot
                    name="invite-email"
                    className="min-w-0 flex-1 gap-2! sm:min-w-[200px]"
                  >
                    <TextFieldLabel>Invite by email</TextFieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <TextFieldInput
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teammate@example.com"
                        className="h-10 pl-10"
                      />
                    </div>
                  </TextFieldRoot>
                  <div className="w-full space-y-0 sm:w-[140px]">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="mt-2" id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-auto">
                    <Button type="submit" className="h-10">
                      Invite
                    </Button>
                  </div>
                </div>
              </Form.Root>
            )}

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-400">All users</h4>
              <ul className="divide-y divide-white/5 rounded-xl border border-white/5">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-4 last:pb-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-700 text-sm font-medium text-gray-300">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-100">{u.email}</p>
                        {u.id === currentUser?.id && <p className="text-xs text-gray-500">You</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isPlatformAdmin ? (
                        <>
                          <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                            <SelectTrigger className="h-9 w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLATFORM_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {u.id !== currentUser?.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1 shrink-0"
                              onClick={() => handleRemove(u.id)}
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="text-sm capitalize text-gray-500">{u.role}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
