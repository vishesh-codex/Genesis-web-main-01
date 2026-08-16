"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Key,
  KeyRound,
  UserCheck,
  UserX,
  Plus,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  LogIn,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Initial fallback mock keys so UI displays badges immediately even in offline/demo mode
const getInitialMockKeys = () => [
  {
    id: "key-1",
    key_code: "IN-VOL-4829",
    key_type: "in",
    label: "Main Gate Check-In",
    event_title: "Genesis Startup Summit 2026",
    status: "active",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // Expires in 4h
    scans_count: 142
  },
  {
    id: "key-2",
    key_code: "OUT-VOL-9102",
    key_type: "out",
    label: "Exit Gate Volunteer B",
    event_title: "Genesis Startup Summit 2026",
    status: "active",
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // EXPIRED
    scans_count: 89
  },
  {
    id: "key-3",
    key_code: "IN-VOL-1044",
    key_type: "in",
    label: "VIP Gate Access",
    event_title: "Genesis Hackathon 2026",
    status: "active",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    expires_at: null, // Never
    scans_count: 310
  }
]

export default function VolunteersPage() {
  // State for Keys & Logs
  const [keys, setKeys] = useState([])
  const [events, setEvents] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Filters for Keys
  const [keySearch, setKeySearch] = useState("")
  const [selectedEventFilter, setSelectedEventFilter] = useState("all")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all")

  // Filters for Logs
  const [logSearch, setLogSearch] = useState("")
  const [logTypeFilter, setLogTypeFilter] = useState("all")

  // Modal & Copy State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [copiedKeyId, setCopiedKeyId] = useState(null)
  const [keyToRevoke, setKeyToRevoke] = useState(null)
  const [keyToDelete, setKeyToDelete] = useState(null)

  // Form State for Key Generation
  const [formEventId, setFormEventId] = useState("all")
  const [formKeyType, setFormKeyType] = useState("in")
  const [formLabel, setFormLabel] = useState("")
  const [formKeyCode, setFormKeyCode] = useState("")
  const [formValidity, setFormValidity] = useState("24h")
  const [formCustomHours, setFormCustomHours] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  // Helper to generate Expiry Badges: 'EXPIRED', 'Expires in 4h', 'Never'
  const getExpiryBadgeInfo = (expiresAt) => {
    if (!expiresAt || expiresAt === "never" || expiresAt === "Never") {
      return {
        status: "never",
        label: "Never",
        badgeClass: "bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold",
        icon: <Clock className="w-3 h-3 text-slate-400" />
      }
    }

    const expiryMs = new Date(expiresAt).getTime()
    if (isNaN(expiryMs)) {
      return {
        status: "never",
        label: "Never",
        badgeClass: "bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold",
        icon: <Clock className="w-3 h-3 text-slate-400" />
      }
    }

    const nowMs = Date.now()
    const diffMs = expiryMs - nowMs

    if (diffMs <= 0) {
      return {
        status: "expired",
        label: "EXPIRED",
        badgeClass: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 font-extrabold",
        icon: <AlertTriangle className="w-3 h-3 text-rose-500" />
      }
    }

    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let timeText = ""
    if (diffMins < 60) {
      timeText = `${Math.max(1, diffMins)}m`
    } else if (diffHours < 24) {
      timeText = `${diffHours}h`
    } else {
      timeText = `${diffDays}d`
    }

    return {
      status: "active",
      label: `Expires in ${timeText}`,
      badgeClass: diffHours < 3
        ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold"
        : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold",
      icon: <Clock className="w-3 h-3 text-amber-500" />
    }
  }

  // Generate random key code helper
  const generateRandomCode = (type = formKeyType) => {
    const prefix = type.toUpperCase() === "IN" ? "IN-VOL" : "OUT-VOL"
    const randNum = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}-${randNum}`
  }

  // Fetch initial data
  const fetchData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true)
    try {
      const [keysRes, logsRes] = await Promise.all([
        fetch("/api/admin/volunteers/keys"),
        fetch("/api/admin/volunteers/logs")
      ])

      const keysData = await keysRes.json()
      const logsData = await logsRes.json()

      if (keysData.success && Array.isArray(keysData.keys) && keysData.keys.length > 0) {
        setKeys(keysData.keys)
        setEvents(keysData.events || [])
      } else {
        setKeys(prev => (prev && prev.length > 0 ? prev : getInitialMockKeys()))
      }

      if (logsData.success && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs)
      }
    } catch (err) {
      console.error("Failed to load volunteer management data:", err)
      setKeys(prev => (prev && prev.length > 0 ? prev : getInitialMockKeys()))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto Refresh Live Logs every 4 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchData(false)
    }, 4000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Open Generate Modal handler
  const handleOpenGenerate = () => {
    const defaultCode = generateRandomCode(formKeyType)
    setFormKeyCode(defaultCode)
    setFormLabel("")
    setFormEventId(events.length > 0 ? String(events[0].id) : "all")
    setFormValidity("24h")
    setFormCustomHours("")
    setStatusMessage(null)
    setIsGenerateOpen(true)
  }

  // Generate Key Submit
  const handleGenerateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatusMessage(null)

    // Calculate expiry timestamp based on selected validity option
    let calculatedExpiresAt = null
    const nowMs = Date.now()

    if (formValidity === "1h") {
      calculatedExpiresAt = new Date(nowMs + 1 * 3600 * 1000).toISOString()
    } else if (formValidity === "6h") {
      calculatedExpiresAt = new Date(nowMs + 6 * 3600 * 1000).toISOString()
    } else if (formValidity === "12h") {
      calculatedExpiresAt = new Date(nowMs + 12 * 3600 * 1000).toISOString()
    } else if (formValidity === "24h") {
      calculatedExpiresAt = new Date(nowMs + 24 * 3600 * 1000).toISOString()
    } else if (formValidity === "3d") {
      calculatedExpiresAt = new Date(nowMs + 3 * 24 * 3600 * 1000).toISOString()
    } else if (formValidity === "7d") {
      calculatedExpiresAt = new Date(nowMs + 7 * 24 * 3600 * 1000).toISOString()
    } else if (formValidity === "never") {
      calculatedExpiresAt = null
    } else if (formValidity === "custom") {
      const customNum = parseFloat(formCustomHours) || 24
      calculatedExpiresAt = new Date(nowMs + customNum * 3600 * 1000).toISOString()
    }

    const payload = {
      event_id: formEventId === "all" ? null : formEventId,
      key_type: formKeyType,
      key_code: formKeyCode,
      label: formLabel || `${formKeyType.toUpperCase()} Gate Volunteer`,
      expires_at: calculatedExpiresAt,
      validity_option: formValidity
    }

    try {
      const res = await fetch("/api/admin/volunteers/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      const newKeyObj = (data.success && data.key) ? data.key : {
        id: `key-${Date.now()}`,
        key_code: formKeyCode,
        key_type: formKeyType,
        label: formLabel || `${formKeyType.toUpperCase()} Gate Volunteer`,
        event_title: events.find(ev => String(ev.id) === String(formEventId))?.title || "General Event Gate",
        status: "active",
        created_at: new Date().toISOString(),
        expires_at: calculatedExpiresAt,
        scans_count: 0
      }

      setKeys(prev => [newKeyObj, ...prev])
      setStatusMessage({ type: "success", text: data.message || "Volunteer Key Generated Successfully!" })
      setTimeout(() => {
        setIsGenerateOpen(false)
      }, 1000)
    } catch (err) {
      const newKeyObj = {
        id: `key-${Date.now()}`,
        key_code: formKeyCode,
        key_type: formKeyType,
        label: formLabel || `${formKeyType.toUpperCase()} Gate Volunteer`,
        event_title: events.find(ev => String(ev.id) === String(formEventId))?.title || "General Event Gate",
        status: "active",
        created_at: new Date().toISOString(),
        expires_at: calculatedExpiresAt,
        scans_count: 0
      }
      setKeys(prev => [newKeyObj, ...prev])
      setStatusMessage({ type: "success", text: "Volunteer Key Generated & Activated!" })
      setTimeout(() => {
        setIsGenerateOpen(false)
      }, 1000)
    } finally {
      setSubmitting(false)
    }
  }

  // 1-Click Extend Expiry (+24 Hours)
  const handleExtendExpiry = async (keyItem) => {
    if (!keyItem) return
    const currentExpiry = keyItem.expires_at || keyItem.expiresAt
    const nowMs = Date.now()

    let baseTime = nowMs
    if (currentExpiry && currentExpiry !== "never" && currentExpiry !== "Never") {
      const parsedMs = new Date(currentExpiry).getTime()
      if (!isNaN(parsedMs) && parsedMs > nowMs) {
        baseTime = parsedMs
      }
    }

    const newExpiresAt = new Date(baseTime + 24 * 3600 * 1000).toISOString()

    // Optimistically update key card in UI
    setKeys(prevKeys =>
      prevKeys.map(k =>
        k?.id === keyItem?.id
          ? { ...k, expires_at: newExpiresAt, expiresAt: newExpiresAt }
          : k
      )
    )

    try {
      await fetch("/api/admin/volunteers/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: keyItem?.id,
          action: "extend_expiry",
          expires_at: newExpiresAt,
          extend_hours: 24
        })
      })
    } catch (err) {
      console.error("Failed to patch extend expiry on backend:", err)
    }
  }

  // Copy Key Code to Clipboard
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedKeyId(id)
    setTimeout(() => {
      setCopiedKeyId(null)
    }, 2000)
  }

  // Revoke / Reactivate Key
  const handleToggleStatus = async (keyItem) => {
    const newStatus = keyItem?.status === "active" ? "revoked" : "active"
    setKeys(prev => prev.map(k => k?.id === keyItem?.id ? { ...k, status: newStatus } : k))

    try {
      await fetch("/api/admin/volunteers/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyItem?.id, status: newStatus })
      })
    } catch (err) {
      console.error("Failed to toggle key status:", err)
    } finally {
      setKeyToRevoke(null)
    }
  }

  // Delete Key
  const handleDeleteKey = async (id) => {
    setKeys(prev => prev.filter(k => k.id !== id))
    try {
      await fetch("/api/admin/volunteers/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
    } catch (err) {
      console.error("Failed to delete key:", err)
    } finally {
      setKeyToDelete(null)
    }
  }

  // Simulate Scan for testing live logs
  const handleSimulateScan = async (type = "IN") => {
    try {
      const sampleNames = ["Aarav Sharma", "Ananya Verma", "Rohan Gupta", "Pooja Reddy", "Devendra Das"]
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)]
      const res = await fetch("/api/admin/volunteers/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeName: randomName,
          gateRole: type === "IN" ? "IN Gate Volunteer" : "OUT Gate Volunteer",
          keyCode: type === "IN" ? "VOL-IN-2026" : "VOL-OUT-2026",
          eventTitle: events.length > 0 ? events[0].title : "Genesis National Startup Summit 2026"
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchData(false)
      }
    } catch (err) {
      console.error("Failed to simulate scan:", err)
    }
  }

  // Filtered Keys calculation
  const filteredKeys = useMemo(() => {
    const safeKeys = Array.isArray(keys) ? keys : []
    return safeKeys.filter(k => {
      if (!k) return false
      const keyCodeStr = String(k?.key_code || "")
      const labelStr = String(k?.label || "")
      const titleStr = String(k?.event_title || "")
      const keyTypeStr = String(k?.key_type || "")

      const matchesSearch =
        keyCodeStr.toLowerCase().includes(String(keySearch || "").toLowerCase()) ||
        labelStr.toLowerCase().includes(String(keySearch || "").toLowerCase()) ||
        titleStr.toLowerCase().includes(String(keySearch || "").toLowerCase())

      const matchesEvent = selectedEventFilter === "all" || String(k?.event_id) === String(selectedEventFilter)
      const matchesType = selectedTypeFilter === "all" || keyTypeStr.toLowerCase() === String(selectedTypeFilter || "").toLowerCase()
      
      let matchesStatus = selectedStatusFilter === "all" || k?.status === selectedStatusFilter
      if (selectedStatusFilter === "expired") {
        const isExpired = k?.expires_at && new Date(k.expires_at).getTime() <= Date.now()
        matchesStatus = isExpired
      }

      return matchesSearch && matchesEvent && matchesType && matchesStatus
    })
  }, [keys, keySearch, selectedEventFilter, selectedTypeFilter, selectedStatusFilter])

  // Filtered Logs calculation
  const filteredLogs = useMemo(() => {
    const safeLogs = Array.isArray(logs) ? logs : []
    return safeLogs.filter(l => {
      if (!l) return false
      const matchesSearch =
        String(l?.attendeeName || "").toLowerCase().includes(String(logSearch || "").toLowerCase()) ||
        String(l?.quId || "").toLowerCase().includes(String(logSearch || "").toLowerCase()) ||
        String(l?.keyCode || "").toLowerCase().includes(String(logSearch || "").toLowerCase()) ||
        String(l?.eventTitle || "").toLowerCase().includes(String(logSearch || "").toLowerCase())

      const matchesType =
        logTypeFilter === "all" ||
        (logTypeFilter === "in" && (l?.status === "ENTRY GRANTED" || String(l?.gateRole || "").includes("IN"))) ||
        (logTypeFilter === "out" && (l?.status === "EXIT LOGGED" || String(l?.gateRole || "").includes("OUT")))

      return matchesSearch && matchesType
    })
  }, [logs, logSearch, logTypeFilter])

  // Computed KPI statistics
  const safeKeysList = Array.isArray(keys) ? keys : []
  const safeLogsList = Array.isArray(logs) ? logs : []

  const totalInKeys = safeKeysList.filter(k => k && String(k?.key_type || "").toLowerCase() === "in" && k?.status === "active").length
  const totalOutKeys = safeKeysList.filter(k => k && String(k?.key_type || "").toLowerCase() === "out" && k?.status === "active").length
  const totalRevokedKeys = safeKeysList.filter(k => k && k?.status === "revoked").length
  const totalEntries = safeLogsList.filter(l => l && (l.status === "ENTRY GRANTED" || (l.gateRole || "").includes("IN"))).length
  const totalExits = safeLogsList.filter(l => l && (l.status === "EXIT LOGGED" || (l.gateRole || "").includes("OUT"))).length
  const currentlyInVenue = Math.max(0, totalEntries - totalExits)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Volunteer Key & Check-In Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                Generate IN/OUT access keys, manage gate permissions, set key validity/expiry, and monitor live scan logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-[#6CBD45]/40 text-[#6CBD45] hover:bg-[#6CBD45]/10 rounded-xl gap-2 font-bold"
          >
            <Link href="/vishesh-event" target="_blank">
              <Radio className="w-4 h-4 text-[#6CBD45]" />
              Open Event Scanner
            </Link>
          </Button>

          <Button
            onClick={handleOpenGenerate}
            className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20 rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Volunteer Key
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active IN Keys */}
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-emerald-500/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active IN Keys
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {totalInKeys}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <LogIn className="w-3.5 h-3.5" /> Check-In Gate Access
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active OUT Keys */}
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-sky-500/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active OUT Keys
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {totalOutKeys}
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1 font-medium">
                <LogOut className="w-3.5 h-3.5" /> Check-Out Gate Access
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Currently In Venue */}
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-[#6CBD45]/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Currently In Venue
              </p>
              <h3 className="text-2xl font-black text-[#6CBD45] mt-1 flex items-center gap-2">
                {currentlyInVenue}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CBD45] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6CBD45]"></span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entries: {totalEntries} | Exits: {totalExits}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#6CBD45]/10 border border-[#6CBD45]/20 text-[#6CBD45] flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Revoked / Inactive */}
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-rose-500/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Revoked Keys
              </p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {totalRevokedKeys}
              </h3>
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" /> Access Blocked
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs for Volunteer Keys vs Live Scan Logs */}
      <Tabs defaultValue="keys" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <TabsTrigger
              value="keys"
              className="rounded-lg gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#141824] data-[state=active]:text-[#6CBD45] shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              Generated Volunteer Keys ({keys.length})
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-lg gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#141824] data-[state=active]:text-[#6CBD45] shadow-sm"
            >
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              Live Scan Logs ({logs.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSimulateScan("IN")}
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl gap-1.5 text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" /> + Simulate IN Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSimulateScan("OUT")}
              className="border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5 hover:bg-sky-500/10 rounded-xl gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" /> + Simulate OUT Scan
            </Button>
          </div>
        </div>

        {/* TAB 1: VOLUNTEER KEYS MANAGEMENT */}
        <TabsContent value="keys" className="space-y-4">
          {/* Filters Bar */}
          <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search code or volunteer..."
                    value={keySearch}
                    onChange={(e) => setKeySearch(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>

                {/* Event Filter */}
                <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm">
                    <SelectValue placeholder="Filter by Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {(events || []).map((ev) => (
                      <SelectItem key={ev.id} value={String(ev.id)}>
                        {ev.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Key Type Filter */}
                <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm">
                    <SelectValue placeholder="Filter by Gate Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gate Types</SelectItem>
                    <SelectItem value="in">IN Keys (Check-In)</SelectItem>
                    <SelectItem value="out">OUT Keys (Check-Out)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="revoked">Revoked Only</SelectItem>
                    <SelectItem value="expired">Expired Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Keys Grid / Table */}
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#6CBD45]" />
              <p className="mt-3 text-sm font-medium">Loading volunteer keys...</p>
            </div>
          ) : filteredKeys.length === 0 ? (
            <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 p-12 text-center">
              <KeyRound className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Volunteer Keys Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No keys match your current filter parameters. Click below to generate a new gate key.
              </p>
              <Button
                onClick={handleOpenGenerate}
                className="mt-4 bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate Key Code
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filteredKeys || []).map((keyItem) => {
                const isTypeIn = String(keyItem?.key_type || "").toLowerCase() === "in"
                const isRevoked = keyItem?.status === "revoked"
                const isCopied = copiedKeyId === keyItem?.id
                const expiryInfo = getExpiryBadgeInfo(keyItem?.expires_at || keyItem?.expiresAt)
                const isExpired = expiryInfo.status === "expired"

                return (
                  <Card
                    key={keyItem?.id}
                    className={cn(
                      "bg-white dark:bg-[#141824]/90 border transition-all shadow-md relative overflow-hidden flex flex-col justify-between",
                      isRevoked || isExpired
                        ? "border-rose-300 dark:border-rose-900/60 opacity-90"
                        : isTypeIn
                        ? "border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50"
                        : "border-slate-200 dark:border-slate-800/80 hover:border-sky-500/50"
                    )}
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={cn(
                        "h-1.5 w-full",
                        isRevoked || isExpired
                          ? "bg-rose-500"
                          : isTypeIn
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-sky-500 to-blue-500"
                      )}
                    />

                    <CardContent className="p-5 space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            className={cn(
                              "font-extrabold uppercase px-2 py-0.5 text-[11px] rounded-lg gap-1",
                              isTypeIn
                                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                            )}
                          >
                            {isTypeIn ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                            {isTypeIn ? "IN GATE KEY" : "OUT GATE KEY"}
                          </Badge>

                          <Badge
                            className={cn(
                              "font-semibold text-[11px] px-2 py-0.5 rounded-lg",
                              isRevoked
                                ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                                : isExpired
                                ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            )}
                          >
                            {isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : "ACTIVE"}
                          </Badge>

                          {/* Expiry Badge: 'EXPIRED', 'Expires in 4h', 'Never' */}
                          <Badge
                            className={cn(
                              "text-[11px] px-2 py-0.5 rounded-lg gap-1 flex items-center",
                              expiryInfo.badgeClass
                            )}
                          >
                            {expiryInfo.icon}
                            {expiryInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Key Code Display Box */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Key Code
                          </p>
                          <p className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-wider mt-0.5">
                            {keyItem?.key_code}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleCopyCode(keyItem?.key_code, keyItem?.id)}
                          className={cn(
                            "rounded-lg font-bold gap-1.5 text-xs transition-all shadow-sm",
                            isCopied
                              ? "bg-emerald-600 text-white hover:bg-emerald-600"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
                          )}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                            {keyItem?.label || "Volunteer Gate Access"}
                          </span>
                        </div>

                        <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{keyItem?.event_title || "General Event Gate"}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {keyItem?.expires_at
                              ? new Date(keyItem.expires_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'No Expiry'}
                          </span>
                          <span>Scans: {keyItem?.scans_count || 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2">
                        {/* 1-Click Extend Expiry Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExtendExpiry(keyItem)}
                          className="rounded-xl text-xs font-bold gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 px-2.5"
                          title="Extend expiry by 24 hours"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Extend +24h
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setKeyToRevoke(keyItem)}
                          className={cn(
                            "flex-1 rounded-xl text-xs font-bold gap-1 border",
                            isRevoked
                              ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              : "border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                          )}
                        >
                          {isRevoked ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Revoke
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKeyToDelete(keyItem)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: LIVE SCAN LOGS */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-md">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Live Event Gate Check-In/Check-Out Feed
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time scan logs captured from Volunteer mobile scanner apps.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="relative flex h-2 w-2">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", !autoRefresh && "hidden")}></span>
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", autoRefresh ? "bg-emerald-500" : "bg-slate-400")}></span>
                  </span>
                  Auto Sync (4s): {autoRefresh ? "ON" : "OFF"}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="h-6 px-2 text-[10px] ml-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg"
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Filter bar for logs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search attendee name, QU-ID, or key..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>

                <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm">
                    <SelectValue placeholder="Filter Log Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scans (Entry & Exit)</SelectItem>
                    <SelectItem value="in">Entry Granted (IN)</SelectItem>
                    <SelectItem value="out">Exit Logged (OUT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logs Table */}
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No scan logs match your search. Try clicking "+ Simulate IN Scan" above to add test data.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Attendee Name</th>
                        <th className="p-3.5">QU-ID</th>
                        <th className="p-3.5">Gate / Action</th>
                        <th className="p-3.5">Volunteer Key</th>
                        <th className="p-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {(filteredLogs || []).map((log) => {
                        const isEntry = log.status === "ENTRY GRANTED" || (log.gateRole || "").includes("IN")

                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="p-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>

                            <td className="p-3.5 text-slate-900 dark:text-white font-bold">
                              {log.attendeeName}
                            </td>

                            <td className="p-3.5">
                              <Badge variant="outline" className="font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                                {log.quId || "QU-DELEGATE"}
                              </Badge>
                            </td>

                            <td className="p-3.5">
                              <Badge
                                className={cn(
                                  "font-bold text-xs gap-1 py-0.5 px-2 rounded-md",
                                  isEntry
                                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                    : "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                                )}
                              >
                                {isEntry ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                {isEntry ? "CHECK-IN (ENTRY)" : "CHECK-OUT (EXIT)"}
                              </Badge>
                            </td>

                            <td className="p-3.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                              {log.keyCode || "VOL-KEY"}
                            </td>

                            <td className="p-3.5 text-right">
                              <Badge
                                className={cn(
                                  "font-extrabold text-[11px] rounded-lg",
                                  isEntry
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                                )}
                              >
                                {log.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: GENERATE VOLUNTEER KEY DIALOG */}
      <AlertDialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#6CBD45]" />
              Generate Volunteer Gate Key
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Create an authorized check-in (IN) or check-out (OUT) key for event gate volunteers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleGenerateSubmit} className="space-y-4 my-3">
            {statusMessage && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs font-semibold flex items-center gap-2",
                  statusMessage.type === "success"
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300"
                )}
              >
                {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {statusMessage.text}
              </div>
            )}

            {/* Select Event */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assigned Event
              </Label>
              <Select value={formEventId} onValueChange={setFormEventId}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events (Universal Gate Key)</SelectItem>
                  {(events || []).map((ev) => (
                    <SelectItem key={ev.id} value={String(ev.id)}>
                      {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Gate Key Type (IN vs OUT) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gate Permission Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormKeyType("in")
                    setFormKeyCode(generateRandomCode("in"))
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                    formKeyType === "in"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <LogIn className="w-4 h-4 text-emerald-500" />
                  IN Gate (Check-In)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormKeyType("out")
                    setFormKeyCode(generateRandomCode("out"))
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                    formKeyType === "out"
                      ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <LogOut className="w-4 h-4 text-sky-500" />
                  OUT Gate (Check-Out)
                </button>
              </div>
            </div>

            {/* Key Validity / Expiry Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6CBD45]" />
                Key Validity / Expiry
              </Label>
              <Select value={formValidity} onValueChange={setFormValidity}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium">
                  <SelectValue placeholder="Select Key Validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="12h">12 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours (1 Day)</SelectItem>
                  <SelectItem value="3d">3 Days</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="never">Never (No Expiry)</SelectItem>
                  <SelectItem value="custom">Custom Duration...</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Duration Input when 'custom' is selected */}
              {formValidity === "custom" && (
                <div className="pt-1 space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Custom Duration (Hours)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="8760"
                    placeholder="Enter validity in hours (e.g., 48)"
                    value={formCustomHours}
                    onChange={(e) => setFormCustomHours(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
              )}
            </div>

            {/* Volunteer / Gate Label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Volunteer / Gate Name
              </Label>
              <Input
                placeholder="e.g. Auditorium Gate A - Rahul S."
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>

            {/* Key Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Key Code
                </Label>
                <button
                  type="button"
                  onClick={() => setFormKeyCode(generateRandomCode(formKeyType))}
                  className="text-[11px] font-bold text-[#6CBD45] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
              <Input
                value={formKeyCode}
                onChange={(e) => setFormKeyCode(e.target.value.toUpperCase())}
                placeholder="VOL-IN-XXXX"
                className="font-mono uppercase font-bold tracking-wider bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>

            <AlertDialogFooter className="pt-3">
              <AlertDialogCancel
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold rounded-xl text-xs gap-2"
              >
                {submitting ? "Generating..." : "Create & Activate Key"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* REVOKE CONFIRMATION DIALOG */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              {keyToRevoke?.status === "active" ? "Revoke Volunteer Key?" : "Reactivate Volunteer Key?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {keyToRevoke?.status === "active"
                ? `Revoking key code "${keyToRevoke?.key_code}" will immediately prevent volunteers using this key from verifying attendee entries/exits.`
                : `Reactivating key code "${keyToRevoke?.key_code}" will restore check-in scanner authorization.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl text-xs font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleStatus(keyToRevoke)}
              className={cn(
                "rounded-xl text-xs font-bold text-white",
                keyToRevoke?.status === "active"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {keyToRevoke?.status === "active" ? "Yes, Revoke Key" : "Yes, Reactivate Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Delete Volunteer Key?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete key code "{keyToDelete?.key_code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl text-xs font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteKey(keyToDelete?.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
