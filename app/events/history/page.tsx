"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toast } from "@/components/custom-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Search,
  History,
  QrCode,
  LogIn,
  LogOut,
  Download,
  Clock,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Copy,
  Info,
  Ticket
} from "lucide-react"

export interface EventHistoryRecord {
  id: number | string
  event_id: number | string
  event_title: string
  event_slug?: string
  event_date: string
  event_time: string
  event_location: string
  qu_id: string
  full_name: string
  email: string
  phone: string
  confirmation_token: string
  status: string
  in_time?: string | null
  out_time?: string | null
  in_qr_code?: string
  out_qr_code?: string
}

export default function EventHistoryPage() {
  const [quId, setQuId] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [records, setRecords] = useState<EventHistoryRecord[]>([])
  
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error">("success")

  const [activeQrTabs, setActiveQrTabs] = useState<Record<string, "in" | "out">>({})
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg)
    setToastType(type)
    setToastVisible(true)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedQu = String(quId || '').trim()
    const trimmedPhone = String(phone || '').trim()
    const trimmedEmail = String(email || '').trim()

    if (!trimmedQu && !trimmedPhone && !trimmedEmail) {
      showToast("Please enter at least one identifier (QU ID, Phone, or Email) to retrieve history.", "error")
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch("/api/events/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qu_id: trimmedQu,
          phone: trimmedPhone,
          email: trimmedEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        let fetchedRecords: EventHistoryRecord[] = data.records || []

        // If backend returned records without QR images, generate them client side
        fetchedRecords = await Promise.all(
          (fetchedRecords || [])?.map(async (rec) => {
            let inQr = rec.in_qr_code || ""
            let outQr = rec.out_qr_code || ""

            if (!inQr) {
              const inPayload = JSON.stringify({
                type: "IN_GATE",
                ticket: rec.confirmation_token,
                qu_id: rec.qu_id,
                event: rec.event_title,
                gate: "ENTRY_GATE_MAIN"
              })
              inQr = await QRCode.toDataURL(inPayload, { width: 280, margin: 2, color: { dark: '#064e3b', light: '#ffffff' } })
            }

            if (!outQr) {
              const outPayload = JSON.stringify({
                type: "OUT_GATE",
                ticket: rec.confirmation_token,
                qu_id: rec.qu_id,
                event: rec.event_title,
                gate: "EXIT_GATE_MAIN"
              })
              outQr = await QRCode.toDataURL(outPayload, { width: 280, margin: 2, color: { dark: '#1e3a8a', light: '#ffffff' } })
            }

            return {
              ...rec,
              in_qr_code: inQr,
              out_qr_code: outQr,
            }
          })
        )

        setRecords(fetchedRecords)
        showToast(`Found ${fetchedRecords.length} event registration pass(es).`)

        // Default tab to 'in' for each record
        const initialTabs: Record<string, "in" | "out"> = {}
        fetchedRecords.forEach((r) => {
          initialTabs[String(r.id)] = "in"
        })
        setActiveQrTabs(initialTabs)
      } else {
        const errData = await response.json().catch(() => ({}))
        showToast(errData.error || "Failed to search event history", "error")
        setRecords([])
      }
    } catch (err) {
      console.error("Search error:", err)
      showToast("An error occurred while fetching history. Showing local records.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFillDemo = (demoQu: string, demoPhone: string, demoEmail: string) => {
    setQuId(demoQu)
    setPhone(demoPhone)
    setEmail(demoEmail)
  }

  const handleCopyRef = (token: string) => {
    typeof window !== 'undefined' && navigator?.clipboard && navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const downloadQr = (dataUrl?: string, filename?: string) => {
    if (typeof window === 'undefined') return;
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename || "GENESIS-QR-PASS.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return null
    try {
      const d = new Date(ts)
      if (isNaN(d.getTime())) return ts
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ts
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />

      {/* Top Banner & Hero Section */}
      <section className="relative pt-12 pb-16 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-50 dark:from-[#141824] dark:via-[#0f1117] dark:to-[#0f1117] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/15 text-[#6CBD45] dark:text-[#7ee852] border border-[#6CBD45]/30 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(108,189,69,0.25)]">
              <History className="w-4 h-4" />
              <span>ATTENDEE PORTAL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Event History & Dual QR Retrieval
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Enter your <span className="text-[#6CBD45] font-semibold">QU ID</span>, <span className="text-[#6CBD45] font-semibold">Phone Number</span>, or <span className="text-[#6CBD45] font-semibold">Email</span> to inspect past event attendance timestamps (In/Out Time) and download your official entry & exit QR passes.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-10 container mx-auto px-4 lg:px-6 max-w-5xl space-y-10">
        {/* Search Form Card */}
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border-t-4 border-t-[#6CBD45]">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-6 h-6 text-[#6CBD45]" />
                  Attendee Verification & Pass Lookup
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                  Fill in any or all identifiers to query your registered event history
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-2">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* QU ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="qu_id" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6CBD45]" /> QU ID / Student ID
                  </Label>
                  <Input
                    id="qu_id"
                    type="text"
                    placeholder="e.g. QU20261001"
                    value={quId}
                    onChange={(e) => setQuId(e.target.value)}
                    className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-[#6CBD45] focus:ring-[#6CBD45] rounded-xl h-11"
                  />
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#6CBD45]" /> Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-[#6CBD45] focus:ring-[#6CBD45] rounded-xl h-11"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6CBD45]" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-[#6CBD45] focus:ring-[#6CBD45] rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#6CBD45]" />
                  Dual QR codes (IN/OUT passes) will be fetched instantly.
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setQuId("")
                      setPhone("")
                      setEmail("")
                      setSearched(false)
                      setRecords([])
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl"
                  >
                    Clear Search
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-3.5 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Searching Database...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Retrieve Passes & History</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searched && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#6CBD45]" />
                Event Passes Found ({records.length})
              </h2>
              <Badge className="bg-[#6CBD45]/15 text-[#6CBD45] border border-[#6CBD45]/30">
                VERIFIED ATTENDEE RECORD
              </Badge>
            </div>

            {records.length === 0 ? (
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141824] p-12 text-center rounded-3xl">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Event History Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  We could not find any event registrations matching your search details. Please double-check your QU ID, Phone, or Email.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(records || [])?.map((rec) => {
                  const recId = String(rec.id)
                  const activeTab = activeQrTabs[recId] || "in"

                  return (
                    <Card key={rec.id} className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#141824] shadow-lg rounded-3xl overflow-hidden hover:border-[#6CBD45]/50 transition-colors">
                      <div className="p-6 sm:p-8 space-y-6">
                        {/* Event Title & Badge Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-[#6CBD45] text-white text-[10px]">
                                CONFIRMED PASS
                              </Badge>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                TOKEN: {rec.confirmation_token}
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                              {rec.event_title}
                            </h3>
                          </div>

                          {/* Ref ID & Copy Button */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyRef(rec.confirmation_token)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] transition-colors flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#6CBD45]" />
                              <span>{rec.confirmation_token}</span>
                              {copiedToken === rec.confirmation_token ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Grid: Event Info & Timestamps vs Dual QR Code Box */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Event & Attendance Metadata (Left 7 Cols) */}
                          <div className="md:col-span-7 space-y-5">
                            {/* Details List */}
                            <div className="space-y-2.5 text-sm">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Calendar className="w-4 h-4 text-[#6CBD45] shrink-0" />
                                <span className="font-semibold text-slate-900 dark:text-white">Date:</span>
                                <span>{rec.event_date}</span>
                              </div>

                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Clock className="w-4 h-4 text-[#6CBD45] shrink-0" />
                                <span className="font-semibold text-slate-900 dark:text-white">Schedule:</span>
                                <span>{rec.event_time}</span>
                              </div>

                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <MapPin className="w-4 h-4 text-[#6CBD45] shrink-0" />
                                <span className="font-semibold text-slate-900 dark:text-white">Venue:</span>
                                <span>{rec.event_location}</span>
                              </div>

                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <User className="w-4 h-4 text-[#6CBD45] shrink-0" />
                                <span className="font-semibold text-slate-900 dark:text-white">Attendee:</span>
                                <span>{rec.full_name} ({rec.qu_id})</span>
                              </div>
                            </div>

                            {/* TIMESTAMPS BOX (In Time / Out Time) */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#6CBD45]" /> Verified Gate Timestamps
                              </h4>

                              <div className="grid grid-cols-2 gap-3 pt-1">
                                {/* IN TIME */}
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-300">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                                    <LogIn className="w-3.5 h-3.5" /> IN TIME (CHECK-IN)
                                  </div>
                                  <div className="text-xs font-mono font-bold">
                                    {formatTimestamp(rec.in_time) || "Not Checked In Yet"}
                                  </div>
                                </div>

                                {/* OUT TIME */}
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-300">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                                    <LogOut className="w-3.5 h-3.5" /> OUT TIME (CHECK-OUT)
                                  </div>
                                  <div className="text-xs font-mono font-bold">
                                    {formatTimestamp(rec.out_time) || "Active / Pending Exit"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dual QR Code Interactive Container (Right 5 Cols) */}
                          <div className="md:col-span-5 flex flex-col items-center bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1">
                                <QrCode className="w-3.5 h-3.5 text-[#6CBD45]" /> Dual Gate QR Pass
                              </span>
                              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                                LIVE QR
                              </Badge>
                            </div>

                            {/* IN / OUT Tab Toggle */}
                            <div className="grid grid-cols-2 gap-1.5 w-full p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
                              <button
                                onClick={() => setActiveQrTabs((prev) => ({ ...prev, [recId]: "in" }))}
                                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  activeTab === "in"
                                    ? "bg-emerald-600 text-white shadow"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                <LogIn className="w-3.5 h-3.5" /> IN QR
                              </button>

                              <button
                                onClick={() => setActiveQrTabs((prev) => ({ ...prev, [recId]: "out" }))}
                                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  activeTab === "out"
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                <LogOut className="w-3.5 h-3.5" /> OUT QR
                              </button>
                            </div>

                            {/* Active QR View */}
                            {activeTab === "in" ? (
                              <div className="flex flex-col items-center space-y-2.5 w-full animate-in fade-in duration-200">
                                <div className="p-2 bg-white rounded-xl shadow border-2 border-emerald-500/40">
                                  {rec.in_qr_code ? (
                                    <img src={rec.in_qr_code} alt="IN QR Code" className="w-36 h-36 object-contain rounded-lg" />
                                  ) : (
                                    <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">IN QR</div>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <LogIn className="w-3 h-3" /> ENTRY GATE PASS
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadQr(rec.in_qr_code, `GENESIS-IN-PASS-${rec.confirmation_token}.png`)}
                                  className="w-full text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download IN QR
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-2.5 w-full animate-in fade-in duration-200">
                                <div className="p-2 bg-white rounded-xl shadow border-2 border-blue-500/40">
                                  {rec.out_qr_code ? (
                                    <img src={rec.out_qr_code} alt="OUT QR Code" className="w-36 h-36 object-contain rounded-lg" />
                                  ) : (
                                    <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">OUT QR</div>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  <LogOut className="w-3 h-3" /> EXIT GATE PASS
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadQr(rec.out_qr_code, `GENESIS-OUT-PASS-${rec.confirmation_token}.png`)}
                                  className="w-full text-xs border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download OUT QR
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
