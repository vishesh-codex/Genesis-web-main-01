// app/admin/dashboard/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText, Building, Calendar, Users, TrendingUp, Plus, Eye,
  ArrowUpRight, Activity, Rocket, Star, AlertCircle, RefreshCw, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const statusConfig = {
  accepted: { label: "Accepted", className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80" },
  submitted: { label: "Submitted", className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/80" },
  under_review: { label: "In Review", className: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800/80" },
  rejected: { label: "Rejected", className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80" },
}

const avatarColors = [
  "from-blue-600 to-indigo-600", "from-violet-600 to-purple-600",
  "from-[#6CBD45] to-[#4a9e32]", "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
]

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg">
      <CardContent className="p-5 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800/80 rounded-2xl" />
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl w-16 mb-2" />
        <div className="h-4 bg-slate-200/80 dark:bg-slate-800/60 rounded-lg w-32 mb-3" />
        <div className="h-3 bg-slate-200/60 dark:bg-slate-800/40 rounded-lg w-40 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80" />
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/dashboard")
      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Failed to load")
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const stats = data?.stats || {}
  const recentSubmissions = data?.recentSubmissions || []

  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications ?? "--",
      icon: FileText,
      iconGradient: "from-blue-500/25 via-blue-500/10 to-transparent border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.2)]",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      trendText: "All time submissions",
    },
    {
      title: "Active Startups",
      value: stats.activeStartups ?? "--",
      icon: Building,
      iconGradient: "from-[#6CBD45]/30 via-[#6CBD45]/15 to-transparent border-[#6CBD45]/40 text-[#6CBD45] shadow-[0_4px_15px_rgba(108,189,69,0.25)]",
      badgeClass: "bg-[#6CBD45]/10 text-[#6CBD45] border-[#6CBD45]/30",
      trendText: "Currently active",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents ?? "--",
      icon: Calendar,
      iconGradient: "from-purple-500/25 via-purple-500/10 to-transparent border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-[0_4px_15px_rgba(168,85,247,0.2)]",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      trendText: "Scheduled from today",
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins ?? "--",
      icon: Users,
      iconGradient: "from-amber-500/25 via-amber-500/10 to-transparent border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.2)]",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      trendText: "Active admin accounts",
    },
  ]

  const quickActions = [
    { label: "New Application Form", icon: FileText, href: "/admin/dashboard/applications", color: "text-sky-600 dark:text-sky-400 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-sky-500/10 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50" },
    { label: "Add Event", icon: Calendar, href: "/admin/dashboard/events", color: "text-purple-600 dark:text-purple-400 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-purple-500/10 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/50" },
    { label: "Add Startup", icon: Rocket, href: "/admin/dashboard/startups", color: "text-[#6CBD45] bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-[#6CBD45]/10 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/50" },
    { label: "Add Blog", icon: Star, href: "/admin/dashboard/blogs", color: "text-amber-600 dark:text-amber-400 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-amber-500/10 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50" },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{getGreeting()}, Admin 👋</h1>
            <Badge className="bg-[#6CBD45]/15 text-[#6CBD45] border border-[#6CBD45]/30 text-xs px-3 py-1 rounded-full font-mono shadow-[0_0_15px_rgba(108,189,69,0.2)]">
              PRO PORTAL
            </Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Overview and live activity metrics at Genesis Incubation Centre</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-2xl gap-1.5 border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 h-10 px-4"
          >
            <RefreshCw className={cn("w-4 h-4 text-[#6CBD45]", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/admin/dashboard/applications">
            <Button className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-lg shadow-[#6CBD45]/25 rounded-2xl gap-2 h-10 px-5">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-rose-100/90 dark:bg-rose-950/80 backdrop-blur-xl border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-800 dark:text-rose-300 text-sm shadow-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-500" />
          <span>{error}</span>
          <button onClick={fetchDashboard} className="ml-auto underline text-xs font-semibold hover:text-slate-900 dark:hover:text-white">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : (statCards || []).map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.2)] transition-all duration-300 overflow-hidden group rounded-3xl shadow-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-300 group-hover:scale-110", stat.iconGradient)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={cn("text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm", stat.badgeClass)}>
                    <TrendingUp className="w-3 h-3" />
                    Live
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value.toLocaleString?.() ?? stat.value}
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{stat.title}</p>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6CBD45]" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{stat.trendText}</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 lg:col-span-1 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/30 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#6CBD45]" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-2.5">
            {(quickActions || []).map((action, i) => (
              <Link key={i} href={action.href} className="block">
                <div className={cn("flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 shadow-sm", action.color)}>
                  <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center">
                    <action.icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="text-sm font-semibold">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 lg:col-span-2 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/30 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#6CBD45]" />
              </div>
              Recent Applications
            </CardTitle>
            <Link href="/admin/dashboard/applications">
              <Button variant="outline" size="sm" className="text-xs rounded-2xl h-8 px-3 gap-1.5 border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                View All
                <ArrowUpRight className="w-3 h-3 text-[#6CBD45]" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl animate-pulse bg-slate-100/80 dark:bg-slate-900/50">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
                      <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded-lg w-1/2" />
                    </div>
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-[#6CBD45]" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No applications received yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(recentSubmissions || []).map((app, idx) => {
                  const status = statusConfig[app.status] || statusConfig.submitted
                  return (
                    <div key={app.id} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 hover:border-[#6CBD45]/50 transition-all group shadow-sm">
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br shadow-md ring-2 ring-white/10",
                        avatarColors[idx % avatarColors.length]
                      )}>
                        {app.applicant_name?.[0]?.toUpperCase() || "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{app.applicant_name}</p>
                          {app.form_title && (
                            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 rounded-md shrink-0 border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400">
                              {app.form_title}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{app.applicant_email} · {app.submitted_at}</p>
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={cn("text-[11px] px-3 py-1 rounded-full font-semibold border backdrop-blur-md shadow-sm", status.className)}>
                          {status.label}
                        </Badge>
                        <Link
                          href={`/admin/dashboard/applications/submission/${app.id}`}
                          className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-[#6CBD45]/60 transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}