"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User, AlertCircle, Shield, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function LoginForm({ className, ...props }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const router = useRouter()

  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = "Username is required"
    else if (username.length < 3) newErrors.username = "Username must be at least 3 characters"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [username, password])

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()
      if (data.success) {
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get("redirect") || "/admin/dashboard"
        router.push(redirectTo)
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setIsLoading(true)
      setError("")
      if (!validateForm()) { setIsLoading(false); return }
      try {
        const result = await handleLogin({ username: username.trim(), password, rememberMe })
        if (!result.success) setError(result.message || "Invalid credentials. Please try again.")
      } catch (error) {
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    },
    [username, password, rememberMe, validateForm]
  )

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value)
    if (errors.username) setErrors((prev) => ({ ...prev, username: "" }))
  }, [errors.username])

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
  }, [errors.password])

  return (
    <form className={cn("space-y-5", className)} onSubmit={handleSubmit} {...props}>
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 text-sm text-red-400 bg-red-950/40 rounded-xl border border-red-800/80 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
          Username
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <User className={cn("h-4 w-4 transition-colors", errors.username ? "text-red-400" : "text-slate-400")} />
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className={cn(
              "w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none transition-all bg-slate-900/90 text-white placeholder:text-slate-500",
              errors.username
                ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                : "border-slate-800 focus:border-[#6CBD45] focus:ring-2 focus:ring-[#6CBD45]/20"
            )}
            placeholder="Enter admin username"
            required
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        {errors.username && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.username}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className={cn("h-4 w-4 transition-colors", errors.password ? "text-red-400" : "text-slate-400")} />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            className={cn(
              "w-full pl-10 pr-12 py-3 text-sm border rounded-xl focus:outline-none transition-all bg-slate-900/90 text-white placeholder:text-slate-500",
              errors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                : "border-slate-800 focus:border-[#6CBD45] focus:ring-2 focus:ring-[#6CBD45]/20"
            )}
            placeholder="Enter password"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3.5 text-slate-400 hover:text-white transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            disabled={isLoading}
            className="border-slate-700 data-[state=checked]:bg-[#6CBD45] data-[state=checked]:border-[#6CBD45]"
          />
          <Label htmlFor="remember-me" className="text-xs text-slate-400 cursor-pointer select-none">
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-xs text-[#6CBD45] hover:underline font-semibold transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6CBD45]/25 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Authenticating...</span>
          </div>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/verify")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const urlParams = new URLSearchParams(window.location.search)
          const redirectTo = urlParams.get("redirect") || "/admin/dashboard"
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.log("User not authenticated")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#6CBD45] selection:text-white">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6CBD45]/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Developer Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="px-3 py-1.5 bg-white dark:bg-white rounded-xl shadow-md border border-slate-200 dark:border-white">
              <img src="/qu-logo-name.svg" alt="Quantum University" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
            <div className="h-6 w-[1px] bg-slate-400/40 shrink-0" />
            <div className="px-3.5 py-1.5 bg-white dark:bg-white rounded-xl shadow-md border border-slate-200 dark:border-white">
              <img src="/white-logo.svg" alt="Genesis Logo" className="h-9 sm:h-10 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Genesis Admin Portal</h1>
          <p className="text-sm text-slate-400">Quantum University Innovation Council</p>
        </div>

        {/* Card */}
        <div className="bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 border-t-4 border-t-[#6CBD45]">
          <LoginForm />
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-slate-500">
            Internal Portal • Authorized Personnel Only
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6CBD45] hover:underline font-semibold">
            ← Back to Main Website
          </Link>
        </div>
      </div>
    </div>
  )
}