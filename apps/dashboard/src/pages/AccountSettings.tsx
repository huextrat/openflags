import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Shield, Key, AlertCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

import { api } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TextFieldRoot, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"

export default function AccountSettings() {
  const { user } = useAuth()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.changePassword(oldPassword, newPassword)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Account Settings
          </h1>
          <p className="text-white/50 text-base max-w-[600px] leading-relaxed">
            Manage your personal account settings and security.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Profile Info Card */}
        <Card className="md:col-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal account details.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1 p-4 rounded-xl border border-white/5 bg-black/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Email Address
                </p>
                <p className="text-lg font-medium text-white">{user?.email}</p>
              </div>
              <div className="space-y-1 p-4 rounded-xl border border-white/5 bg-black/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Role
                </p>
                <p className="text-lg font-medium text-white capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="md:col-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Form.Root onSubmit={handleSubmit} className="space-y-6 max-w-md">
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-200">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-200">
                    Password updated successfully.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Current Password</label>
                  <TextFieldRoot name="oldPassword">
                    <TextFieldInput
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/20"
                    />
                  </TextFieldRoot>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">New Password</label>
                  <TextFieldRoot name="newPassword">
                    <TextFieldInput
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/20"
                    />
                  </TextFieldRoot>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Confirm New Password</label>
                  <TextFieldRoot name="confirmPassword">
                    <TextFieldInput
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/20"
                    />
                  </TextFieldRoot>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </Form.Root>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
