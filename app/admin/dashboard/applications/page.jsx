// app/admin/dashboard/applications/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search, Download, Eye, CheckCircle, XCircle, Clock, FileText,
  Plus, Filter, Trash2, LayoutList, FormInput, ExternalLink,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Edit2, Copy
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Status Config ──────────────────────────────────────────────────────────
const statusConfig = {
  accepted: { label: "Accepted", icon: CheckCircle, className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80" },
  submitted: { label: "Submitted", icon: Clock, className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/80" },
  under_review: { label: "Under Review", icon: Eye, className: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800/80" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80" },
}

const formStatusConfig = {
  active: { label: "Active", className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80" },
  draft: { label: "Draft", className: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800" },
  closed: { label: "Closed", className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80" },
}

const avatarColors = [
  "from-blue-600 to-indigo-600", "from-violet-600 to-purple-600",
  "from-[#6CBD45] to-[#4a9e32]", "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
]

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonRow({ cols = 6 }) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-800/80">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={cn(
      "fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold border",
      type === "success" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800"
    )}>
      {type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
      {message}
    </div>
  )
}

// ─── Export CSV ──────────────────────────────────────────────────────────────
function exportCSV(data) {
  const headers = ["ID", "Form", "Applicant", "Email", "Status", "Submitted At"]
  const rows = data.map(a => [a.id, a.form_title, a.applicant_name, a.applicant_email, a.status, a.submitted_at])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = "applications.csv"; a.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function ApplicationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("forms") // "forms" | "submissions"
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => setToast({ message, type })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Applications</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Manage application forms and review submissions</p>
        </div>
        {activeTab === "forms" ? (
          <Button
            onClick={() => router.push("/admin/dashboard/applications/forms/new")}
            className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20 rounded-xl gap-2 w-fit"
          >
            <Plus className="w-4 h-4" /> New Form
          </Button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-fit">
        {[
          { key: "forms", label: "Forms", icon: FormInput },
          { key: "submissions", label: "Submissions", icon: LayoutList },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-[#6CBD45] text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "forms"
        ? <FormsTab router={router} showToast={showToast} setActiveTab={setActiveTab} />
        : <SubmissionsTab router={router} showToast={showToast} />
      }

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMS TAB
// ═══════════════════════════════════════════════════════════════════════════
function FormsTab({ router, showToast, setActiveTab }) {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/applications/forms")
      const json = await res.json()
      setForms(json.data || [])
    } catch { showToast("Failed to load forms", "error") }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { fetchForms() }, [fetchForms])

  const deleteForm = async (id, title) => {
    if (!confirm(`Delete "${title}" and all its submissions?`)) return
    try {
      await fetch(`/api/admin/applications/forms/${id}`, { method: "DELETE" })
      showToast("Form deleted")
      fetchForms()
    } catch { showToast("Failed to delete", "error") }
  }

  const copyLink = (id) => {
    const url = `${window.location.origin}/apply/${id}`
    navigator.clipboard.writeText(url)
    showToast("Public link copied!")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm animate-pulse">
            <CardContent className="p-5">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded w-full mb-1" />
              <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded w-2/3" />
            </CardContent>
          </Card>
        ))
        : forms.length === 0
          ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-slate-500">
              <FormInput className="w-12 h-12 mb-3 opacity-30 text-[#6CBD45]" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No forms yet</p>
              <p className="text-xs text-slate-500 mt-1">Click "New Form" to create your first application form</p>
            </div>
          )
          : forms.map((form, idx) => {
            const sc = formStatusConfig[form.status] || formStatusConfig.draft
            return (
              <Card key={form.id} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg hover:border-[#6CBD45]/50 transition-all group rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br shadow-sm", avatarColors[idx % avatarColors.length])}>
                      {form.title[0]?.toUpperCase()}
                    </div>
                    <Badge className={cn("text-[11px] rounded-full border font-semibold", sc.className)}>
                      {sc.label}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1">{form.title}</h3>
                  {form.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{form.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
                    <span>{form.field_count} fields</span>
                    <span>·</span>
                    <span>{form.submission_count} submissions</span>
                    <span>·</span>
                    <span>{form.created_at}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 gap-1"
                      onClick={() => router.push(`/admin/dashboard/applications/forms/${form.id}`)}
                    >
                      <Edit2 className="w-3 h-3 text-[#6CBD45]" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 gap-1"
                      onClick={() => { router.push(`/admin/dashboard/applications?form_id=${form.id}`); setActiveTab?.("submissions") }}
                    >
                      <LayoutList className="w-3 h-3 text-[#6CBD45]" /> Submissions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 gap-1"
                      onClick={() => copyLink(form.id)}
                    >
                      <Copy className="w-3 h-3 text-[#6CBD45]" /> Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border-slate-200 dark:border-rose-800 gap-1"
                      onClick={() => deleteForm(form.id, form.title)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
      }
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMISSIONS TAB
// ═══════════════════════════════════════════════════════════════════════════
function SubmissionsTab({ router, showToast }) {
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({ submitted: 0, under_review: 0, accepted: 0, rejected: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)

      const res = await fetch(`/api/admin/applications/submissions?${params}`)
      const json = await res.json()
      setSubmissions(json.data || [])
      setStats(json.stats || { submitted: 0, under_review: 0, accepted: 0, rejected: 0 })
      setPagination(json.pagination || {})
    } catch { showToast("Failed to load submissions", "error") }
    finally { setLoading(false) }
  }, [page, statusFilter, debouncedSearch, showToast])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/applications/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      showToast("Status updated")
      fetchSubmissions()
    } catch { showToast("Failed to update status", "error") }
  }

  const deleteSubmission = async (id) => {
    if (!confirm("Delete this submission?")) return
    try {
      await fetch(`/api/admin/applications/submissions/${id}`, { method: "DELETE" })
      showToast("Submission deleted")
      fetchSubmissions()
    } catch { showToast("Failed to delete", "error") }
  }

  const statCards = [
    { label: "Total", value: pagination.total || 0, icon: FileText, color: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700" },
    { label: "Submitted", value: stats.submitted, icon: Clock, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20" },
    { label: "Under Review", value: stats.under_review, icon: Eye, color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-[#6CBD45] bg-[#6CBD45]/10 border border-[#6CBD45]/20" },
  ]

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(statCards || []).map((s, i) => (
          <Card key={i} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
        <CardHeader className="pb-4 pt-5 px-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">All Submissions</CardTitle>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white w-48 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              {/* Status Filter */}
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                  className="pl-8 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <Button
                variant="outline" size="sm"
                className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white h-9"
                onClick={() => exportCSV(submissions)}
              >
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
              <Button
                variant="outline" size="sm"
                className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white h-9"
                onClick={fetchSubmissions}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Form</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th className="py-3 px-5 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  : submissions.length === 0
                    ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <FileText className="w-10 h-10 mb-3 opacity-30 text-[#6CBD45]" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No submissions found</p>
                            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : submissions.map((sub, idx) => {
                      const sc = statusConfig[sub.status] || statusConfig.submitted
                      const StatusIcon = sc.icon
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br shadow-sm", avatarColors[idx % avatarColors.length])}>
                                {sub.applicant_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.applicant_name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{sub.applicant_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <Badge variant="outline" className="text-[11px] rounded-md border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                              {sub.form_title}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className={cn("flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold border w-fit", sc.className)}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="hidden sm:inline">{sc.label}</span>
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 hidden sm:table-cell">
                            <span className="text-sm text-slate-500 dark:text-slate-400">{sub.submitted_at}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => router.push(`/admin/dashboard/applications/submission/${sub.id}`)}
                                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {sub.status === "submitted" || sub.status === "under_review" ? (
                                <>
                                  <button
                                    onClick={() => updateStatus(sub.id, "accepted")}
                                    className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 transition-colors"
                                    title="Accept"
                                  ><CheckCircle className="w-3.5 h-3.5" /></button>
                                  <button
                                    onClick={() => updateStatus(sub.id, "rejected")}
                                    className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 transition-colors"
                                    title="Reject"
                                  ><XCircle className="w-3.5 h-3.5" /></button>
                                </>
                              ) : null}
                              <button
                                onClick={() => deleteSubmission(sub.id)}
                                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                                title="Delete"
                              ><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {submissions.length} of {pagination.total} submissions
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline" size="sm"
                  className="h-8 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1"
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="h-8 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}