import * as Form from "@radix-ui/react-form"
import { motion } from "framer-motion"
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-white/50 tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-[#09090b] relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                 <LogIn className="h-5 w-5" />
               </div>
               <span className="text-2xl font-bold tracking-tight text-white">OpenFlags</span>
            </div>
        </div>

        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle top glare */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <CardHeader className="space-y-2 pb-6 text-center pt-8">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-base text-white/50">
              Sign in to manage your feature flags.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Form.Root
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
            >
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium"
                >
                  {error}
                </motion.div>
              )}
              <TextFieldRoot name="email">
                <TextFieldLabel className="text-white/70">Email address</TextFieldLabel>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <TextFieldInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    placeholder="you@example.com"
                  />
                </div>
              </TextFieldRoot>
              <TextFieldRoot name="password">
                <div className="flex items-center justify-between mb-2">
                   <TextFieldLabel className="mb-0 text-white/70">Password</TextFieldLabel>
                   <Link to="#" className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <TextFieldInput
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    placeholder="••••••••"
                  />
                </div>
              </TextFieldRoot>
              <Button type="submit" className="w-full h-12 text-base mt-2 group relative overflow-hidden" size="lg">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-all" />
                </span>
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </Button>
            </Form.Root>
          </CardContent>
          
          <div className="border-t border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-white/50">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-white hover:text-violet-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
