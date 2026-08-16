"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Building2,
  Coins,
  FileText,
  PhoneCall
} from "lucide-react"
import Link from "next/link"

// Types
interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: string
  suggestionPills?: string[]
  actionLink?: {
    label: string
    url: string
  }
  isError?: boolean
}

// Knowledge Base Data & Intelligent Resolver
const KNOWLEDGE_BASE: Record<string, { text: string; pills?: string[]; link?: { label: string; url: string } }> = {
  apply: {
    text: `To apply for the **Genesis Incubation Program** at **QUIC** (Quantum University Innovation Council), follow these simple steps:

1. **Submit Application**: Fill out the online application form with your pitch deck & startup summary.
2. **Initial Screening**: Our expert panel reviews your innovation, market feasibility, and team capability.
3. **Pitch Deck Presentation**: Present your vision to the QUIC Selection Committee.
4. **Onboarding & Induction**: Selected startups gain immediate access to lab facilities, co-working space, and seed grant funding.`,
    pills: ["Incubation Track", "Funding & Grants", "Contact QUIC"],
    link: { label: "Go to Application Form", url: "/apply" }
  },
  track: {
    text: `**Genesis Incubation Programs** cater to startups at all stages:

• 💡 **Pre-Incubation Track (Idea Stage)**: Turn raw ideas into validated prototypes with hands-on technical guidance.
• 🚀 **Incubation Track (MVP / Early Stage)**: 12 to 18-month intensive incubator program providing seed funding, legal/IP assistance, dedicated lab equipment, and 1-on-1 mentorship.
• 📈 **Scaling & Growth Track**: Market linkage, VC investor pitch days, corporate partnerships, and international acceleration opportunities.`,
    pills: ["How to Apply?", "Funding & Grants", "Contact QUIC"],
    link: { label: "Explore Programs", url: "/pre-incubation" }
  },
  funding: {
    text: `**Funding & Financial Support at QUIC**:

💰 **Seed Grants**: Financial grants up to **₹10 Lakhs+** for high-impact innovation & prototype development.
🏛️ **Govt. Schemes**: Access to SISFS, NIDHI-PRAYAS, BIRAC, and MSME incubation grants.
🤝 **Investor Pitch Days**: Quarterly pitching sessions with Top VC Funds, Angel Networks, and HNI Investors.
🛠️ **Perks & Credits**: \$100k+ in Cloud credits (AWS, Azure, GCP), software licenses (GitHub, Notion), and fee waivers for IP filing.`,
    pills: ["How to Apply?", "Incubation Track", "Contact QUIC"],
    link: { label: "View Portfolio Startups", url: "/portfolio" }
  },
  contact: {
    text: `Reach out to the **QUIC Team**:

📧 **Email**: quic@quantumuniversity.edu.in
📍 **Location**: Quantum University Campus, Roorkee, Uttarakhand, India
🕒 **Office Hours**: Monday to Saturday | 9:00 AM - 5:00 PM
📞 **Helpline**: +91-7300511155 / +91-7300511166`,
    pills: ["How to Apply?", "Incubation Track", "Funding & Grants"],
    link: { label: "Contact Us Page", url: "/contact" }
  },
  eligibility: {
    text: `**Who can apply to Genesis QUIC?**

✅ University Students, Researchers & Alumni
✅ Early-Stage Tech & Deep-Tech Founders
✅ Innovators with a working prototype or validated business model
✅ Micro, Small & Medium Enterprises (MSMEs) seeking R&D acceleration`,
    pills: ["How to Apply?", "Funding & Grants"],
    link: { label: "Start Application", url: "/apply" }
  },
  facility: {
    text: `**QUIC World-Class Infrastructure & Facilities**:

🏢 24/7 Co-working Space & Executive Boardrooms
🔬 Advanced 3D Printing, IoT, Robotics & Fabrication Labs
⚖️ Legal, IP & Patent Filing Cell
🌐 Gigabit Fiber Wi-Fi & Cloud Supercomputing Access`,
    pills: ["Incubation Track", "Contact QUIC"],
    link: { label: "About QUIC", url: "/about" }
  }
}

// Quick Suggestion Pills required by the prompt
const QUICK_SUGGESTIONS = [
  "How to Apply?",
  "Incubation Track",
  "Funding & Grants",
  "Contact QUIC"
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [unreadCount, setUnreadCount] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initial Welcome Message
  useEffect(() => {
    const welcomeMsg: Message = {
      id: "welcome-1",
      sender: "ai",
      text: "Greetings! 👋 Welcome to **Genesis QUIC** (Quantum University Innovation Council). I am your 3D AI Concierge. How can I assist your startup journey today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestionPills: QUICK_SUGGESTIONS
    }
    setMessages([welcomeMsg])
  }, [])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [messages, isTyping, isOpen])

  // Play subtle sound effect
  const playAudioFeedback = (type: "send" | "receive") => {
    if (!soundEnabled || typeof window === "undefined") return
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      if (type === "send") {
        osc.frequency.setValueAtTime(520, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.start()
        osc.stop(ctx.currentTime + 0.08)
      } else {
        osc.frequency.setValueAtTime(780, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
        osc.start()
        osc.stop(ctx.currentTime + 0.12)
      }
    } catch {
      // Ignore audio context restriction errors
    }
  }

  // Handle Query Resolution
  const resolveAIResponse = (userText: string): { text: string; pills?: string[]; link?: { label: string; url: string } } => {
    const textLower = userText.toLowerCase()

    if (textLower.includes("apply") || textLower.includes("how to apply") || textLower.includes("registration") || textLower.includes("join")) {
      return KNOWLEDGE_BASE.apply
    }
    if (textLower.includes("track") || textLower.includes("incubation") || textLower.includes("program") || textLower.includes("pre-incubation")) {
      return KNOWLEDGE_BASE.track
    }
    if (textLower.includes("fund") || textLower.includes("grant") || textLower.includes("money") || textLower.includes("invest") || textLower.includes("seed")) {
      return KNOWLEDGE_BASE.funding
    }
    if (textLower.includes("contact") || textLower.includes("email") || textLower.includes("phone") || textLower.includes("address") || textLower.includes("location") || textLower.includes("quic")) {
      return KNOWLEDGE_BASE.contact
    }
    if (textLower.includes("eligible") || textLower.includes("eligibility") || textLower.includes("who can")) {
      return KNOWLEDGE_BASE.eligibility
    }
    if (textLower.includes("facility") || textLower.includes("lab") || textLower.includes("space") || textLower.includes("office")) {
      return KNOWLEDGE_BASE.facility
    }

    // Default intelligent response fallback
    return {
      text: `Thank you for asking! **Genesis Incubator** at Quantum University provides complete end-to-end support for ambitious founders.

You can ask me about:
• 🚀 **How to Apply** & selection criteria
• 💡 **Incubation & Pre-Incubation Tracks**
• 💰 **Seed Funding & Grants**
• 📞 **Direct QUIC Contact Details**`,
      pills: QUICK_SUGGESTIONS,
      link: { label: "Learn More About Us", url: "/about" }
    }
  }

  // Send Message Logic
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputValue).trim()
    if (!content) return

    setError(null)
    setHasInteracted(true)

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInputValue("")
    playAudioFeedback("send")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, messages: [...messages, userMsg] })
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.message || data.choices?.[0]?.message?.content || "Thank you for reaching out to Genesis - QUIC!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestionPills: data.suggestionPills,
          actionLink: data.actionLink
        }
        setMessages(prev => [...prev, aiMsg])
        setIsTyping(false)
        playAudioFeedback("receive")
        return
      }
    } catch {
      // Fallback gracefully to offline resolver if fetch fails
    }

    // Client-side fallback if server API is unavailable
    setTimeout(() => {
      try {
        const response = resolveAIResponse(content)
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestionPills: response.pills,
          actionLink: response.link
        }
        setMessages(prev => [...prev, aiMsg])
        setIsTyping(false)
        playAudioFeedback("receive")
      } catch {
        setIsTyping(false)
        setError("Unable to process your request. Please try again or check your internet connection.")
      }
    }, 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: "ai",
        text: "Conversation refreshed! 🔄 How else can Genesis AI assist your startup today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestionPills: QUICK_SUGGESTIONS
      }
    ])
    setError(null)
  }

  // Render message content with bold & bullet point formatting safely
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n")
    return lines.map((line, idx) => {
      // Format bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g)
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-emerald-400 dark:text-emerald-300">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })

      return (
        <React.Fragment key={idx}>
          {formattedLine}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-auto">
      {/* Floating Trigger Widget Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Glowing Green Gradient Accent Rings */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#4e9e32] opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="absolute -inset-3 rounded-full bg-[#6CBD45]/20 animate-ping pointer-events-none duration-1000" />

          {/* Main 3D Glass Trigger Button */}
          <button
            onClick={() => {
              setIsOpen(true)
              setIsMinimized(false)
              setUnreadCount(0)
            }}
            className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-950/85 backdrop-blur-xl border border-[#6CBD45]/50 shadow-[0_0_30px_rgba(108,189,69,0.35)] hover:shadow-[0_0_45px_rgba(108,189,69,0.6)] transform hover:scale-108 active:scale-95 transition-all duration-300 group"
            aria-label="Open Genesis AI Assistant"
          >
            {/* Inner Glowing Core */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-500/20 via-transparent to-[#6CBD45]/10 border border-white/10" />

            {/* 3D Robot AI Icon Badge */}
            <div className="relative flex items-center justify-center text-white">
              <svg className="w-8 h-8 md:w-9 md:h-9 drop-shadow-[0_0_10px_rgba(108,189,69,0.8)]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Robot Head Outer Frame */}
                <rect x="8" y="14" width="32" height="24" rx="8" fill="url(#botGradient)" stroke="#6CBD45" strokeWidth="2.5"/>
                {/* Antenna */}
                <path d="M24 6V14" stroke="#6CBD45" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="5" r="3" fill="#6CBD45" className="animate-pulse"/>
                {/* Visor / Screen */}
                <rect x="13" y="19" width="22" height="11" rx="5" fill="#09130D" stroke="#6CBD45" strokeWidth="1.5"/>
                {/* Glowing Eyes */}
                <circle cx="19" cy="24.5" r="2.5" fill="#6CBD45" className="animate-pulse"/>
                <circle cx="29" cy="24.5" r="2.5" fill="#6CBD45" className="animate-pulse"/>
                {/* Smile / Grid */}
                <path d="M20 33H28" stroke="#6CBD45" strokeWidth="2" strokeLinecap="round"/>
                {/* Gradients */}
                <defs>
                  <linearGradient id="botGradient" x1="8" y1="14" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E293B"/>
                    <stop offset="1" stopColor="#0F172A"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Unread Badge Indicator */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-[#6CBD45] text-[10px] font-bold text-slate-950 ring-2 ring-slate-950 animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Floating Hover Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md shadow-xl text-xs font-semibold text-emerald-400 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Ask Genesis AI</span>
          </div>
        </div>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div
          className={`relative flex flex-col w-[92vw] sm:w-[390px] md:w-[430px] rounded-3xl backdrop-blur-2xl bg-slate-950/95 border border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(108,189,69,0.25)] overflow-hidden transition-all duration-300 ease-out ${
            isMinimized ? "h-[70px]" : "h-[85vh] max-h-[620px] sm:max-h-[640px]"
          }`}
        >
          {/* Top Glass Accent Ring Lighting */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#4e9e32]" />
          
          {/* Header Section */}
          <div className="relative flex items-center justify-between px-4 py-3.5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              {/* 3D AI Robot Badge Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-[#6CBD45]/40 shadow-inner">
                <div className="absolute -inset-0.5 rounded-2xl bg-[#6CBD45]/30 blur-xs" />
                <Bot className="relative w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(108,189,69,0.8)]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#6CBD45] ring-2 ring-slate-950 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">Genesis AI</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#6CBD45]/15 text-[#6CBD45] border border-[#6CBD45]/30 text-[10px] font-bold uppercase tracking-wider">
                    QUIC 3D
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-medium text-slate-400">Concierge • Online</span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title={soundEnabled ? "Mute audio" : "Enable audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body (When not minimized) */}
          {!isMinimized && (
            <>
              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1.5`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[88%]">
                      {msg.sender === "ai" && (
                        <div className="shrink-0 w-7 h-7 rounded-xl bg-slate-900 border border-[#6CBD45]/30 flex items-center justify-center text-emerald-400 mt-1 shadow-md">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-[#6CBD45] to-[#4e9e32] text-white font-medium rounded-tr-xs shadow-[0_4px_14px_rgba(108,189,69,0.3)]"
                            : "bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-xs shadow-md backdrop-blur-md"
                        }`}
                      >
                        {renderFormattedText(msg.text)}

                        {/* Action Link inside message bubble if available */}
                        {msg.actionLink && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                            <Link
                              href={msg.actionLink.url}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6CBD45]/20 text-emerald-300 hover:bg-[#6CBD45]/30 text-xs font-semibold transition-all group"
                            >
                              <span>{msg.actionLink.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {msg.sender === "user" && (
                        <div className="shrink-0 w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mt-1 shadow-md">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Quick Suggestion Pills attached to AI message */}
                    {msg.sender === "ai" && msg.suggestionPills && msg.suggestionPills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pl-9">
                        {msg.suggestionPills.map((pill, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(pill)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-emerald-400 border border-[#6CBD45]/30 hover:bg-[#6CBD45]/20 hover:border-[#6CBD45]/60 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1 group"
                          >
                            <Zap className="w-3 h-3 text-emerald-400 group-hover:rotate-12 transition-transform" />
                            <span>{pill}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator Animation */}
                {isTyping && (
                  <div className="flex items-start gap-2.5 max-w-[80%]">
                    <div className="shrink-0 w-7 h-7 rounded-xl bg-slate-900 border border-[#6CBD45]/30 flex items-center justify-center text-emerald-400 mt-1">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-xs bg-slate-900/90 border border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-[#6CBD45] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#6CBD45] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#6CBD45] animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => handleSendMessage(messages[messages.length - 1]?.text)}
                      className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-[11px] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Quick Toolbar (If user hasn't typed yet) */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/60">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#6CBD45]" />
                    <span>Popular Suggestions:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-[#6CBD45]/20 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-[#6CBD45]/40 transition-all cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md shrink-0">
                <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-[#6CBD45]/60 focus-within:ring-1 focus-within:ring-[#6CBD45]/40 rounded-2xl px-3 py-1.5 transition-all shadow-inner">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Genesis AI..."
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs md:text-sm focus:outline-none px-1 py-1.5"
                    disabled={isTyping}
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-[#6CBD45] to-[#4e9e32] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(108,189,69,0.5)] active:scale-95 transition-all ml-1 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between px-2 mt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#6CBD45]" />
                    QUIC Secured AI
                  </span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
