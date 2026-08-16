"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 800)
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-400">Genesis Admin Account Recovery</p>
        </div>

        {/* Card */}
        <div className="bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 border-t-4 border-t-[#6CBD45]">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-[#6CBD45]/30 rounded-2xl flex items-center justify-center mx-auto text-[#6CBD45]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Reset Link Sent</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                If an account with email <span className="text-[#6CBD45] font-mono">{email}</span> exists, password reset instructions have been dispatched.
              </p>
              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Admin Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <span>Enter your registered administrative email to receive recovery instructions.</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Admin Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-800 rounded-xl focus:outline-none focus:border-[#6CBD45] focus:ring-2 focus:ring-[#6CBD45]/20 transition-all bg-slate-900/90 text-white placeholder:text-slate-500"
                    placeholder="admin@quantumuniversity.edu.in"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6CBD45]/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-slate-500">
            Internal Portal • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}
