import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextFieldRoot, TextFieldLabel, TextFieldInput } from "@/components/ui/text-field"
import { useAuth } from "@/context/AuthContext"

export default function Login() {
  const { user, login, error, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const ok = await login(email.trim(), password)
    if (ok) navigate("/", { replace: true })
  }

  if (user) return <Navigate to="/" replace />
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card className="border-white/10 bg-gray-800/90">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-gray-100">Sign in to OpenFlags</CardTitle>
            <p className="text-sm text-gray-400">Use your email and password.</p>
          </CardHeader>
          <CardContent>
            <Form.Root
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
            >
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <TextFieldRoot name="email">
                <TextFieldLabel>Email</TextFieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <TextFieldInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </TextFieldRoot>
              <TextFieldRoot name="password">
                <TextFieldLabel>Password</TextFieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <TextFieldInput
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </TextFieldRoot>
              <Button type="submit" className="w-full" size="lg">
                Sign in
              </Button>
            </Form.Root>
            <p className="mt-6 text-center text-sm text-gray-400">
              No account?{" "}
              <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
