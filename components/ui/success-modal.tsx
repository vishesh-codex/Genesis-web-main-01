"use client"

import * as React from "react"
import QRCode from "qrcode"
import { useRouter } from "next/navigation"
import {
  Check,
  Sparkles,
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  QrCode,
  LogIn,
  LogOut,
  Download,
  History,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  referenceId?: string
  type?: "event" | "application" | "contact" | "general"
  details?: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  actionText?: string
  onAction?: () => void
  // Dual QR Support
  inQrCode?: string
  outQrCode?: string
  attendeeInfo?: {
    qu_id?: string
    name?: string
    email?: string
    phone?: string
  }
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "Registration Successful!",
  subtitle = "Your application has been received. Our incubation team will get in touch shortly.",
  referenceId,
  type = "general",
  details = [],
  actionText = "Done & Continue",
  onAction,
  inQrCode,
  outQrCode,
  attendeeInfo,
}: SuccessModalProps) {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)
  const [activeQrTab, setActiveQrTab] = React.useState<"in" | "out">("in")
  const [inQrDataUrl, setInQrDataUrl] = React.useState<string>("")
  const [outQrDataUrl, setOutQrDataUrl] = React.useState<string>("")
  const [generatingQr, setGeneratingQr] = React.useState<boolean>(false)

  // Generate Dual QR codes whenever modal opens or referenceId/inQrCode/outQrCode changes
  React.useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const generateQrs = async () => {
      try {
        setGeneratingQr(true)

        // IN QR Code generation
        const inPayload = inQrCode || JSON.stringify({
          type: "IN_GATE",
          refId: referenceId || "REF-GENESIS",
          qu_id: attendeeInfo?.qu_id || "QU-PENDING",
          name: attendeeInfo?.name || "Attendee",
          timestamp: new Date().toISOString()
        })

        // OUT QR Code generation
        const outPayload = outQrCode || JSON.stringify({
          type: "OUT_GATE",
          refId: referenceId || "REF-GENESIS",
          qu_id: attendeeInfo?.qu_id || "QU-PENDING",
          name: attendeeInfo?.name || "Attendee",
          timestamp: new Date().toISOString()
        })

        // Check if string is already a data URL
        if (inPayload.startsWith("data:image")) {
          if (isMounted) setInQrDataUrl(inPayload)
        } else {
          const inUrl = await QRCode.toDataURL(inPayload, {
            width: 300,
            margin: 2,
            color: {
              dark: "#064e3b", // Deep emerald green for IN
              light: "#ffffff"
            }
          })
          if (isMounted) setInQrDataUrl(inUrl)
        }

        if (outPayload.startsWith("data:image")) {
          if (isMounted) setOutQrDataUrl(outPayload)
        } else {
          const outUrl = await QRCode.toDataURL(outPayload, {
            width: 300,
            margin: 2,
            color: {
              dark: "#1e3a8a", // Deep blue for OUT
              light: "#ffffff"
            }
          })
          if (isMounted) setOutQrDataUrl(outUrl)
        }
      } catch (err) {
        console.error("Error generating Dual QR codes:", err)
      } finally {
        if (isMounted) setGeneratingQr(false)
      }
    }

    generateQrs()

    return () => {
      isMounted = false
    }
  }, [isOpen, referenceId, inQrCode, outQrCode, attendeeInfo])

  if (!isOpen) return null

  const handleCopy = () => {
    if (referenceId) {
      typeof window !== 'undefined' && navigator?.clipboard && navigator.clipboard.writeText(referenceId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQrImage = (dataUrl: string, filename: string) => {
    if (typeof window === 'undefined') return;
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // 1-CLICK COMBINED DUAL PASS DOWNLOAD (BOTH IN & OUT QR IN ONE IMAGE/PDF)
  const downloadCombinedDualPass = () => {
    if (typeof window === 'undefined' || !inQrDataUrl || !outQrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark Card Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, 650, 700);

    // Top Accent Glow Bar
    ctx.fillStyle = '#6CBD45';
    ctx.fillRect(0, 0, 650, 12);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GENESIS VISHESH EVENT DUAL GATE PASS', 325, 50);

    // Delegate Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`DELEGATE: ${attendeeInfo?.name || 'Attendee'}  |  QU_ID: ${attendeeInfo?.qu_id || 'QU-PASS'}`, 325, 80);
    ctx.fillText(`REF: ${referenceId || 'GENESIS-CONF-PASS'}`, 325, 102);

    // Divider Line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(620, 120);
    ctx.stroke();

    // Load IN Image first
    const inImg = new Image();
    inImg.onload = () => {
      // Left IN Pass Box (Emerald)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(40, 140, 260, 480);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('ENTRY PASS (IN QR)', 170, 175);

      ctx.drawImage(inImg, 60, 195, 220, 220);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = '12px sans-serif';
      ctx.fillText('Scan at Entrance Gate', 170, 445);
      ctx.fillText('Valid for Entry Check-In', 170, 470);

      // Load OUT Image second
      const outImg = new Image();
      outImg.onload = () => {
        // Right OUT Pass Box (Blue)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(350, 140, 260, 480);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('EXIT PASS (OUT QR)', 480, 175);

        ctx.drawImage(outImg, 370, 195, 220, 220);

        ctx.fillStyle = '#bfdbfe';
        ctx.font = '12px sans-serif';
        ctx.fillText('Scan at Exit Gate', 480, 445);
        ctx.fillText('Valid for Exit Check-Out', 480, 470);

        // Footer Text
        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.fillText('Generated by Genesis Event Management Portal', 325, 665);

        // Trigger Download
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `GENESIS-COMBINED-DUAL-PASS-${referenceId || '2026'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      outImg.src = outQrDataUrl;
    };
    inImg.src = inQrDataUrl;
  };

  const isEventModal = type === "event" || Boolean(inQrCode || outQrCode || referenceId?.startsWith("EVT") || referenceId?.startsWith("CONF"))

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      {/* Container Box */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(108,189,69,0.25)] text-slate-900 dark:text-white overflow-hidden transition-all duration-300 scale-100 max-h-[92vh] flex flex-col">
        
        {/* Top Edge Gradient Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] shadow-[0_0_15px_#6CBD45]" />
        
        {/* Ambient Glow Blobs */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#6CBD45]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 transition-all hover:scale-105 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-1 space-y-5 custom-scrollbar">
          {/* Animated 3D Checkmark Badge */}
          <div className="text-center">
            <div className="relative inline-block mx-auto pt-2">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-green-600 opacity-60 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-1 shadow-[0_15px_35px_rgba(108,189,69,0.4)] flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[22px] flex items-center justify-center border border-white/40 shadow-inner">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-in zoom-in-50 duration-500" />
                </div>
              </div>
              {/* Sparkle Badge */}
              <div className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg border border-amber-200 animate-bounce">
                <Sparkles className="w-4 h-4 fill-amber-950" />
              </div>
            </div>

            {/* Header Title & Subtitle */}
            <div className="mt-4 space-y-1.5">
              <Badge className="bg-[#6CBD45]/15 text-[#6CBD45] dark:text-[#7ee852] border border-[#6CBD45]/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(108,189,69,0.2)]">
                CONFIRMED & VERIFIED
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Reference ID Pill */}
          {referenceId && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono w-full max-w-xs mx-auto shadow-inner">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate">
                <ShieldCheck className="w-4 h-4 text-[#6CBD45] shrink-0" />
                <span>REF:</span>
                <span className="font-extrabold text-slate-900 dark:text-white truncate">{referenceId}</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-[#6CBD45] hover:text-emerald-500 transition-colors p-1 font-sans font-semibold flex items-center gap-1 shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}

          {/* DUAL QR CODE GENERATION SECTION */}
          {isEventModal && (
            <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#6CBD45]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Dual Pass QR Codes
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  IN & OUT PASS
                </Badge>
              </div>

              {/* 1-CLICK COMBINED DOWNLOAD DUAL PASS BUTTON */}
              <Button
                onClick={downloadCombinedDualPass}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs gap-2 shadow-lg flex items-center justify-center transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download Combined Dual Pass (IN & OUT QR)</span>
              </Button>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
                <button
                  onClick={() => setActiveQrTab("in")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeQrTab === "in"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>IN QR (Entry)</span>
                </button>

                <button
                  onClick={() => setActiveQrTab("out")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeQrTab === "out"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>OUT QR (Exit)</span>
                </button>
              </div>

              {/* QR Code Display Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                {generatingQr ? (
                  <div className="py-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[#6CBD45] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-mono">Generating Pass QR...</span>
                  </div>
                ) : activeQrTab === "in" ? (
                  <div className="flex flex-col items-center space-y-3 animate-in fade-in duration-300">
                    <div className="relative p-2 bg-white rounded-xl shadow-md border-2 border-emerald-500/40">
                      {inQrDataUrl ? (
                        <img src={inQrDataUrl} alt="IN QR Code (Entry Pass)" className="w-44 h-44 object-contain rounded-lg" />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">Generating...</div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        IN GATE
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <LogIn className="w-3.5 h-3.5" /> ENTRY PASS (IN QR CODE)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan at entrance gate for timestamp check-in</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQrImage(inQrDataUrl, `GENESIS-IN-QR-${referenceId || 'PASS'}.png`)}
                      className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs gap-1.5 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5" /> Download IN QR
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 animate-in fade-in duration-300">
                    <div className="relative p-2 bg-white rounded-xl shadow-md border-2 border-blue-500/40">
                      {outQrDataUrl ? (
                        <img src={outQrDataUrl} alt="OUT QR Code (Exit Pass)" className="w-44 h-44 object-contain rounded-lg" />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">Generating...</div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        OUT GATE
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        <LogOut className="w-3.5 h-3.5" /> EXIT PASS (OUT QR CODE)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan at exit gate for timestamp check-out</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQrImage(outQrDataUrl, `GENESIS-OUT-QR-${referenceId || 'PASS'}.png`)}
                      className="border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs gap-1.5 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5" /> Download OUT QR
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Details List */}
          {details.length > 0 && (
            <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-left text-xs font-mono">
              {details.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={index} className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-1 border-b last:border-b-0 border-slate-200/60 dark:border-slate-800/60">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      {IconComponent && <IconComponent className="w-3.5 h-3.5 text-[#6CBD45]" />}
                      {item.label}:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.value}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Portal Navigation Link & Action Button */}
          <div className="pt-2 space-y-2">
            <Button
              onClick={() => {
                if (onAction) onAction()
                onClose()
              }}
              className="w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-3.5 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] cursor-pointer"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                onClose()
                router.push("/events/history")
              }}
              className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] flex items-center justify-center gap-1.5 py-2"
            >
              <History className="w-3.5 h-3.5 text-[#6CBD45]" />
              <span>Retrieve Past QR Passes & Attendance History Portal</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
