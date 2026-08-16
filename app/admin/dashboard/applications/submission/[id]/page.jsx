// app/admin/dashboard/applications/submission/[id]/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft, CheckCircle, XCircle, Clock, Eye, AlertCircle,
    Mail, Calendar, FileText, User, RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig = {
    accepted: { label: "Accepted", icon: CheckCircle, className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80" },
    submitted: { label: "Submitted", icon: Clock, className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80" },
    under_review: { label: "Under Review", icon: Eye, className: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800/80" },
    rejected: { label: "Rejected", icon: XCircle, className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80" },
}

function Toast({ message, type = "success", onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
    return (
        <div className={cn(
            "fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
            type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
            {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message}
        </div>
    )
}

export default function SubmissionDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { id } = params

    const [submission, setSubmission] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = "success") => setToast({ message, type })

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/admin/applications/submissions/${id}`)
                const json = await res.json()
                if (json.success) setSubmission(json.data)
                else showToast("Failed to load submission", "error")
            } catch { showToast("Failed to load submission", "error") }
            finally { setLoading(false) }
        }
        load()
    }, [id])

    const updateStatus = async (status) => {
        setUpdating(true)
        try {
            const res = await fetch(`/api/admin/applications/submissions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            const json = await res.json()
            if (json.success) {
                setSubmission(prev => ({ ...prev, status }))
                showToast("Status updated")
            } else {
                showToast(json.error || "Failed to update", "error")
            }
        } catch { showToast("Failed to update", "error") }
        finally { setUpdating(false) }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-[#6CBD45] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Submission not found</p>
                <Button variant="outline" className="mt-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        )
    }

    const sc = statusConfig[submission.status] || statusConfig.submitted
    const StatusIcon = sc.icon

    return (
        <div className="space-y-5 pb-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Submission #{submission.id}</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{submission.form_title}</p>
                    </div>
                </div>

                {/* Status actions */}
                <div className="flex items-center gap-2">
                    <Badge className={cn("flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium border", sc.className)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {sc.label}
                    </Badge>
                    {submission.status !== "accepted" && (
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 h-9 font-bold"
                            onClick={() => updateStatus("accepted")}
                            disabled={updating}
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </Button>
                    )}
                    {submission.status !== "rejected" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 rounded-xl text-xs gap-1.5 h-9"
                            onClick={() => updateStatus("rejected")}
                            disabled={updating}
                        >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                    )}
                    {(submission.status === "accepted" || submission.status === "rejected") && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-xs gap-1.5 h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => updateStatus("under_review")}
                            disabled={updating}
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset to Review
                        </Button>
                    )}
                </div>
            </div>

            {/* Applicant Info Card */}
            <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Name</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white">{submission.applicant_name || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Email</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white">{submission.applicant_email || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Submitted</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white">{submission.submitted_at || "—"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Changer */}
            <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(statusConfig).map(([key, sc]) => {
                            const Icon = sc.icon
                            return (
                                <button
                                    key={key}
                                    onClick={() => updateStatus(key)}
                                    disabled={submission.status === key || updating}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                        submission.status === key
                                            ? cn(sc.className, "cursor-default")
                                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {sc.label}
                                    {submission.status === key && " (current)"}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Answers */}
            <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                        Responses ({submission.answers?.length || 0} fields)
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    {!submission.answers || submission.answers.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No answers recorded</p>
                    ) : (
                        <div className="space-y-4">
                            {submission.answers.map((ans, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                                        {ans.label}
                                    </p>
                                    <div className={cn(
                                        "px-3 py-2.5 rounded-lg text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80",
                                        !ans.answer && "text-slate-400 dark:text-slate-500 italic"
                                    )}>
                                        {ans.answer || "No answer provided"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}
