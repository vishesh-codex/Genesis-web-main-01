"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, Clock, Copy, Check, X, Sparkles, ShieldCheck, ArrowRight, Zap, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SuccessCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  trackingId?: string
  title?: string
  subtitle?: string
  category?: string
  senderName?: string
  senderEmail?: string
  timeline?: string
  details?: Array<{ label: string; value: string }>
}

export default function SuccessCelebrationModal({
  isOpen,
  onClose,
  trackingId = "GEN-2026-X89F2",
  title = "Submission Successful!",
  subtitle = "Your details have been received by the Genesis Innovation Hub team.",
  category = "Application",
  senderName,
  senderEmail,
  timeline = "Within 24 Hours",
  details,
}: SuccessCelebrationModalProps) {
  const [copied, setCopied] = useState(false)
  const [generatedId, setGeneratedId] = useState(trackingId)

  useEffect(() => {
    if (isOpen && trackingId === "GEN-2026-X89F2") {
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
      const year = new Date().getFullYear()
      setGeneratedId(`GEN-${year}-${randomCode}`)
    } else if (trackingId) {
      setGeneratedId(trackingId)
    }
  }, [isOpen, trackingId])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300 selection:bg-[#6CBD45] selection:text-white">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#6CBD45]/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-80 h-80 bg-emerald-500/15 blur-[110px] rounded-full pointer-events-none" />

      {/* Main 3D Glass Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-gradient-to-b from-[#161a26]/95 via-[#111420]/95 to-[#0d0f17]/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_60px_rgba(108,189,69,0.35)] rounded-3xl p-6 sm:p-9 overflow-hidden text-white transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top 3D Sheen Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent shadow-[0_0_20px_#6CBD45]" />
        
        {/* Corner Ambient Radial Gradient */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#6CBD45]/25 blur-3xl rounded-full pointer-events-none" />
        
        {/* Shiny Glass Close Button (Top-Right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-[#6CBD45] text-slate-400 hover:text-white border border-slate-700/80 hover:border-[#6CBD45] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[#6CBD45]/30 hover:scale-105 active:scale-95 group/x z-20"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 transition-transform duration-300 group-hover/x:rotate-90" />
        </button>

        <div className="text-center space-y-6 relative z-10">
          
          {/* Animated 3D Glass Checkmark Celebration Icon */}
          <div className="relative inline-flex items-center justify-center">
            {/* Outer Glowing Pulsing Rings */}
            <div className="absolute -inset-4 rounded-full bg-[#6CBD45]/25 blur-xl animate-pulse" />
            <div className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping opacity-60" />
            
            {/* Particle Sparkles */}
            <Sparkles className="absolute -top-3 -left-3 w-6 h-6 text-[#6CBD45] animate-bounce duration-1000" />
            <Zap className="absolute -bottom-2 -right-3 w-5 h-5 text-emerald-400 animate-pulse duration-700" />

            {/* 3D Gradient Icon Badge Container */}
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] p-[2px] shadow-[0_15px_40px_rgba(108,189,69,0.55)] transform hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-white/30 via-transparent to-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]">
                <CheckCircle2 className="w-12 h-12 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate-in zoom-in duration-500 ease-out" />
              </div>
            </div>
          </div>

          {/* Celebration Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6CBD45]/15 border border-[#6CBD45]/40 text-[#6CBD45] text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(108,189,69,0.2)]">
              <ShieldCheck className="w-4 h-4" />
              <span>{category} Confirmed</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Reference Tracking ID Box (Ultra-Premium Glass Card) */}
          <div className="relative rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] space-y-2 group/ref overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#6CBD45]/60 to-transparent" />
            
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider font-semibold text-emerald-400/90 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Reference Tracking ID
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans font-medium">
                Official Receipt
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-[#6CBD45] tracking-widest drop-shadow-sm select-all">
                {generatedId}
              </span>

              <Button
                onClick={handleCopy}
                size="sm"
                className={`h-9 px-3.5 text-xs font-semibold rounded-xl border transition-all duration-300 flex items-center gap-1.5 ${
                  copied
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30"
                    : "bg-slate-800/90 hover:bg-[#6CBD45] text-slate-200 hover:text-white border-slate-700 hover:border-[#6CBD45] shadow"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Response Timeline Box */}
          <div className="rounded-2xl bg-gradient-to-r from-[#6CBD45]/15 via-emerald-500/10 to-transparent border border-[#6CBD45]/30 p-4 text-left flex items-start gap-3.5 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/20 border border-[#6CBD45]/40 flex items-center justify-center text-[#6CBD45] shrink-0 mt-0.5 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">Response Timeline Guarantee</h4>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#6CBD45] text-slate-950">
                  {timeline}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                An incubation officer has been assigned to your request. You will receive an official update or confirmation email within 24 hours.
              </p>
            </div>
          </div>

          {/* Submitted Details Grid (if passed) */}
          {((details && details.length > 0) || senderName || senderEmail) && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 text-left text-xs space-y-2">
              <div className="text-slate-400 font-mono font-semibold uppercase text-[10px] tracking-wider mb-1">
                Submission Summary
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-slate-300">
                {senderName && (
                  <div>
                    <span className="text-slate-500">Applicant:</span> <strong className="text-white font-medium">{senderName}</strong>
                  </div>
                )}
                {senderEmail && (
                  <div>
                    <span className="text-slate-500">Email:</span> <strong className="text-white font-medium">{senderEmail}</strong>
                  </div>
                )}
                {details?.map((item, idx) => (
                  <div key={idx}>
                    <span className="text-slate-500">{item.label}:</span> <strong className="text-white font-medium">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shiny 3D Close Button */}
          <div className="pt-2">
            <Button
              onClick={onClose}
              className="relative group/btn overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] text-white font-extrabold text-base shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_32px_-4px_rgba(108,189,69,0.55)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_16px_40px_-4px_rgba(108,189,69,0.7)] border border-emerald-400/40 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {/* Shiny Light Sheen Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <span className="tracking-wide">Done & Back to Portal</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-mono">
            🔒 Confirmation receipt archived in Genesis Innovation Hub records.
          </p>

        </div>
      </div>
    </div>
  )
}
