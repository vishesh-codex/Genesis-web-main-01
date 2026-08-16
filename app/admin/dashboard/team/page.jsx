// app/admin/dashboard/team/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Shield,
    UserCog,
    Plus,
    Edit2,
    Trash2,
    Check,
    Search,
    RefreshCw,
    Star,
    KeyRound,
    Lock,
    Unlock,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    Copy,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Key,
    Download,
    Bot,
    FileText,
    Users,
    Sparkles,
    ShieldAlert,
    ShieldCheck,
    ChevronRight,
    UserCheck,
    UserX,
    SlidersHorizontal,
    Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

// 6 Required Granular Permissions
const GRANULAR_PERMISSIONS = [
    {
        key: "events",
        label: "Events Management",
        description: "Create, edit, schedule, and publish summits, workshops & pitch events",
        icon: Calendar,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
        key: "volunteers",
        label: "Volunteer Keys",
        description: "Generate, assign, and manage gate scanner volunteer access keys",
        icon: Key,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
        key: "registrations_export",
        label: "Registrations Export",
        description: "Export student & attendee event registrations to CSV / Excel spreadsheets",
        icon: Download,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
        key: "ai_settings",
        label: "AI Settings",
        description: "Configure Genesis AI assistant models, system prompts & knowledge base",
        icon: Bot,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    {
        key: "blogs",
        label: "Blogs & News",
        description: "Draft, edit, publish, and delete news articles, announcements & press releases",
        icon: FileText,
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    {
        key: "team",
        label: "Team Control",
        description: "Manage sub-admin accounts, toggle granular permissions & reset passwords",
        icon: ShieldCheck,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    }
]

// Permission Presets
const PRESETS = [
    {
        name: "Super Admin",
        role_slug: "super_admin",
        permissions: { events: true, volunteers: true, registrations_export: true, ai_settings: true, blogs: true, team: true }
    },
    {
        name: "Event Lead",
        role_slug: "event-lead",
        permissions: { events: true, volunteers: true, registrations_export: true, ai_settings: false, blogs: false, team: false }
    },
    {
        name: "Content Manager",
        role_slug: "content-lead",
        permissions: { events: false, volunteers: false, registrations_export: false, ai_settings: false, blogs: true, team: false }
    },
    {
        name: "Volunteer Lead",
        role_slug: "scanner-lead",
        permissions: { events: true, volunteers: true, registrations_export: false, ai_settings: false, blogs: false, team: false }
    },
    {
        name: "Custom",
        role_slug: "custom",
        permissions: {}
    }
]

// Modal to Edit Granular Permissions
function PermissionsModal({ admin, onClose, onSave }) {
    const [perms, setPerms] = useState(() => {
        if (!admin?.permissions) return {}
        if (typeof admin.permissions === "object") return { ...admin.permissions }
        try { return JSON.parse(admin.permissions) } catch { return {} }
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const togglePerm = (key) => {
        setPerms((prev) => ({ ...(prev || {}), [key]: !prev?.[key] }))
    }

    const applyPreset = (presetPerms) => {
        setPerms({ ...(presetPerms || {}) })
    }

    const handleSave = async () => {
        if (!admin?.id) return
        setSaving(true)
        setError("")
        try {
            const res = await fetch(`/api/admin/admins/${admin.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: admin.username || "",
                    first_name: admin.first_name || "",
                    last_name: admin.last_name || "",
                    role_id: admin.role_id ?? null,
                    status: admin.status ?? 1,
                    permissions: perms || {}
                })
            })
            const data = await res.json()
            if (data?.success) {
                onSave(admin.id, perms || {})
            } else {
                setError(data?.message || "Failed to update permissions")
            }
        } catch {
            setError("Network error updating permissions")
        } finally {
            setSaving(false)
        }
    }

    const safeGranular = Array.isArray(GRANULAR_PERMISSIONS) ? GRANULAR_PERMISSIONS : []
    const activeCount = safeGranular.filter((p) => p && perms?.[p.key]).length
    const safePresets = Array.isArray(PRESETS) ? PRESETS : []

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 flex items-center justify-center border border-[#6CBD45]/30">
                            <SlidersHorizontal className="w-5 h-5 text-[#6CBD45]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Edit Permissions: <span className="text-[#6CBD45]">@{admin?.username || "admin"}</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Toggle granular access modules for {admin?.first_name || admin?.username || "sub-admin"} ({activeCount} / {safeGranular.length} active)
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#6CBD45]/10 text-[#4a9e32] border border-[#6CBD45]/20">
                        {activeCount} Active
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-sm text-rose-800 dark:text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Presets */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Quick Permission Presets
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {safePresets.map((preset) => (
                                <button
                                    key={preset?.name || preset?.role_slug}
                                    type="button"
                                    onClick={() => applyPreset(preset?.permissions)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs font-medium hover:border-[#6CBD45] hover:text-[#6CBD45] transition-colors"
                                >
                                    {preset?.name || "Preset"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Granular Permission Toggles */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Granular Access Controls
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {safeGranular.map((perm) => {
                                if (!perm) return null
                                const active = !!perms?.[perm.key]
                                const IconComponent = perm.icon || Info
                                return (
                                    <div
                                        key={perm.key}
                                        onClick={() => togglePerm(perm.key)}
                                        className={cn(
                                            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none",
                                            active
                                                ? "border-[#6CBD45] bg-[#6CBD45]/10 text-slate-900 dark:text-white shadow-sm"
                                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center", perm.color)}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{perm.label}</span>
                                            </div>
                                            {active ? (
                                                <ToggleRight className="w-6 h-6 text-[#6CBD45]" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{perm.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2.5 bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {saving ? "Saving…" : <><Check className="w-4 h-4" /> Save Permissions</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Modal to Reset Password
function ResetPasswordModal({ admin, onClose, onSave }) {
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
        let pwd = ""
        for (let i = 0; i < 10; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setNewPassword(pwd)
    }

    const copyToClipboard = () => {
        if (!newPassword) return
        navigator.clipboard.writeText(newPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()
        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (!admin?.id) return
        setSaving(true)
        setError("")
        try {
            const res = await fetch(`/api/admin/admins/${admin.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: admin.username || "",
                    first_name: admin.first_name || "",
                    last_name: admin.last_name || "",
                    role_id: admin.role_id ?? null,
                    status: admin.status ?? 1,
                    password: newPassword
                })
            })
            const data = await res.json()
            if (data?.success) {
                onSave(admin.username || "")
            } else {
                setError(data?.message || "Failed to reset password")
            }
        } catch {
            setError("Network error resetting password")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                        <KeyRound className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reset Sub-Admin Password</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Reset password for <span className="font-semibold text-slate-900 dark:text-white">@{admin?.username || "admin"}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-sm text-rose-800 dark:text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 6 chars)"
                                className="w-full pl-3.5 pr-20 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {newPassword && (
                                    <button
                                        type="button"
                                        onClick={copyToClipboard}
                                        className="p-1 text-slate-400 hover:text-[#6CBD45]"
                                        title="Copy password"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-[#6CBD45]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-xs font-semibold text-[#6CBD45] hover:underline flex items-center gap-1"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Auto-generate strong secure password
                    </button>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !newPassword}
                            className="flex-1 px-4 py-2.5 bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? "Resetting…" : "Reset Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal to Create or Edit Admin
function AdminModal({ admin, roles = [], onClose, onSave }) {
    const editing = !!admin?.id
    const [form, setForm] = useState(() => {
        let initialPerms = {
            events: true,
            volunteers: true,
            registrations_export: true,
            ai_settings: false,
            blogs: false,
            team: false
        }
        if (admin?.permissions) {
            if (typeof admin.permissions === "object") {
                initialPerms = { ...admin.permissions }
            } else if (typeof admin.permissions === "string") {
                try { initialPerms = JSON.parse(admin.permissions) } catch {}
            }
        }
        return {
            username: admin?.username || "",
            first_name: admin?.first_name || "",
            last_name: admin?.last_name || "",
            password: "",
            role_id: admin?.role_id || "",
            status: admin?.status === 1 ? 1 : editing ? (admin?.status ?? 1) : 1,
            permissions: initialPerms
        }
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

    const togglePerm = (permKey) => {
        setForm((f) => ({
            ...f,
            permissions: { ...(f?.permissions || {}), [permKey]: !f?.permissions?.[permKey] }
        }))
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()
        if (typeof form.username !== "string" || !form.username.trim()) { setError("Username is required"); return }
        if (!editing && (!form.password || form.password.length < 6)) {
            setError("Password must be at least 6 characters"); return
        }
        if (editing && form.password && form.password.length < 6) {
            setError("New password must be at least 6 characters"); return
        }
        setSaving(true)
        setError("")
        try {
            const url = editing ? `/api/admin/admins/${admin.id}` : "/api/admin/admins"
            const method = editing ? "PUT" : "POST"
            const body = { ...form, role_id: form.role_id || null }
            if (editing && !form.password) delete body.password

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (data?.success) {
                onSave(data?.id || admin?.id, body)
            } else {
                setError(data?.message || "Failed to save admin")
            }
        } catch {
            setError("Network error saving admin")
        } finally {
            setSaving(false)
        }
    }

    const safeRoles = Array.isArray(roles) ? roles : []
    const safeGranular = Array.isArray(GRANULAR_PERMISSIONS) ? GRANULAR_PERMISSIONS : []

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 flex items-center justify-center border border-[#6CBD45]/30">
                        <UserCog className="w-5 h-5 text-[#6CBD45]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit Sub-Admin" : "Create Sub-Admin Account"}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configure login credentials & assigned permissions</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-sm text-rose-800 dark:text-rose-400">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                            <input
                                value={form.first_name}
                                onChange={(e) => set("first_name", e.target.value)}
                                placeholder="Aarav"
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                            <input
                                value={form.last_name}
                                onChange={(e) => set("last_name", e.target.value)}
                                placeholder="Sharma"
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username *</label>
                        <input
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                            placeholder="event_lead"
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            {editing ? "New Password (leave blank to keep current)" : "Password *"}
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => set("password", e.target.value)}
                            placeholder={editing ? "••••••••" : "Min 6 characters"}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned Role</label>
                        <select
                            value={form.role_id}
                            onChange={(e) => set("role_id", e.target.value ? Number(e.target.value) : "")}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        >
                            <option value="" className="bg-white dark:bg-[#141824]">Standard Sub-Admin</option>
                            {safeRoles.map((r) => (
                                <option key={r?.id} value={r?.id} className="bg-white dark:bg-[#141824]">
                                    {r?.name || "Role"} {r?.is_super ? "(Super Admin)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Status</label>
                        <button
                            type="button"
                            onClick={() => set("status", form.status === 1 ? 0 : 1)}
                            className={cn(
                                "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all",
                                form.status === 1
                                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                            )}
                        >
                            <span>{form.status === 1 ? "Active — Account enabled for login" : "Inactive — Account suspended"}</span>
                            {form.status === 1 ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                        </button>
                    </div>

                    {/* Quick Permissions Toggle */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Granular Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {safeGranular.map((perm) => {
                                if (!perm) return null
                                const active = !!form.permissions?.[perm.key]
                                return (
                                    <button
                                        key={perm.key}
                                        type="button"
                                        onClick={() => togglePerm(perm.key)}
                                        className={cn(
                                            "flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all",
                                            active
                                                ? "border-[#6CBD45] bg-[#6CBD45]/10 text-[#4a9e32]"
                                                : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <span>{perm.label}</span>
                                        {active ? <Check className="w-3.5 h-3.5 text-[#6CBD45]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? "Saving…" : editing ? "Update Sub-Admin" : "Create Sub-Admin"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Dialog for Deleting Sub-Admin
function DeleteDialog({ admin, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false)
    const handleDelete = async () => {
        setDeleting(true)
        await onConfirm()
        setDeleting(false)
    }
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Remove Sub-Admin?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                    Are you sure you want to remove sub-admin account <strong className="text-slate-900 dark:text-white">"@{admin?.username || "admin"}"</strong>? They will lose access to the admin portal immediately.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                        {deleting ? "Removing…" : "Remove Account"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// MAIN PAGE COMPONENT
export default function TeamControlPage() {
    const { admin: currentLoggedIn, isSuper } = useAdminAuth()
    const [admins, setAdmins] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [modal, setModal] = useState(null)
    const [permissionsModal, setPermissionsModal] = useState(null)
    const [resetPasswordModal, setResetPasswordModal] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [aRes, rRes] = await Promise.all([
                fetch("/api/admin/admins"),
                fetch("/api/admin/roles")
            ])
            const aData = await aRes.json()
            const rData = await rRes.json()
            if (aData?.success && Array.isArray(aData?.data)) setAdmins(aData.data)
            else setAdmins([])
            if (rData?.success && Array.isArray(rData?.data)) setRoles(rData.data)
            else setRoles([])
        } catch (e) {
            console.error("Failed fetching team admins:", e)
            setAdmins([])
            setRoles([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Toggle Active/Inactive Status directly
    const toggleAdminStatus = async (targetAdmin) => {
        if (!targetAdmin?.id) return
        const newStatus = targetAdmin.status === 1 ? 0 : 1
        try {
            const res = await fetch(`/api/admin/admins/${targetAdmin.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: targetAdmin.username || "",
                    first_name: targetAdmin.first_name || "",
                    last_name: targetAdmin.last_name || "",
                    role_id: targetAdmin.role_id ?? null,
                    status: newStatus
                })
            })
            const data = await res.json()
            if (data?.success) {
                setAdmins((prev) =>
                    (Array.isArray(prev) ? prev : []).map((a) => (a?.id === targetAdmin.id ? { ...a, status: newStatus } : a))
                )
                showToast(`Account @${targetAdmin.username || "admin"} ${newStatus === 1 ? "activated" : "deactivated"}`)
            } else {
                showToast(data?.message || "Failed to update status", "error")
            }
        } catch {
            showToast("Network error updating status", "error")
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget?.id) return
        try {
            const res = await fetch(`/api/admin/admins/${deleteTarget.id}`, { method: "DELETE" })
            const data = await res.json()
            if (data?.success) {
                showToast(`Sub-admin @${deleteTarget.username || "admin"} removed successfully`)
                setAdmins((prev) => (Array.isArray(prev) ? prev : []).filter((a) => a?.id !== deleteTarget.id))
            } else {
                showToast(data?.message || "Failed to remove admin", "error")
            }
        } catch {
            showToast("Error deleting sub-admin", "error")
        }
        setDeleteTarget(null)
    }

    const handleSaveAdmin = (savedId, formData) => {
        const safeRoles = Array.isArray(roles) ? roles : []
        const role = safeRoles.find((r) => r?.id === formData?.role_id)
        const updatedData = {
            ...formData,
            role_name: role ? role.name : "Sub Admin",
            is_super: role ? role.is_super : 0
        }

        if (modal?.admin?.id) {
            setAdmins((prev) => (Array.isArray(prev) ? prev : []).map((a) => (a?.id === modal.admin.id ? { ...a, ...updatedData } : a)))
            showToast(`Sub-admin @${formData?.username || "admin"} updated`)
        } else {
            setAdmins((prev) => [{ id: savedId || Date.now(), ...updatedData }, ...(Array.isArray(prev) ? prev : [])])
            showToast(`New sub-admin @${formData?.username || "admin"} created successfully`)
        }
        setModal(null)
    }

    const handleSavePermissions = (adminId, newPerms) => {
        setAdmins((prev) =>
            (Array.isArray(prev) ? prev : []).map((a) => (a?.id === adminId ? { ...a, permissions: newPerms } : a))
        )
        setPermissionsModal(null)
        showToast("Granular permissions updated successfully")
    }

    const handleSavePassword = (username) => {
        setResetPasswordModal(null)
        showToast(`Password for @${username || "admin"} reset successfully`)
    }

    // Filters
    const safeAdmins = Array.isArray(admins) ? admins : []
    const filteredAdmins = safeAdmins.filter((a) => {
        if (!a) return false
        const term = typeof search === "string" ? search.toLowerCase() : ""
        const matchesSearch =
            (typeof a.username === "string" && a.username.toLowerCase().includes(term)) ||
            (typeof a.first_name === "string" && a.first_name.toLowerCase().includes(term)) ||
            (typeof a.last_name === "string" && a.last_name.toLowerCase().includes(term)) ||
            (typeof a.role_name === "string" && a.role_name.toLowerCase().includes(term))

        if (statusFilter === "active") return matchesSearch && a.status === 1
        if (statusFilter === "inactive") return matchesSearch && a.status !== 1
        return matchesSearch
    })

    const initials = (a) => {
        if (!a) return "A"
        if (typeof a.first_name === "string" && a.first_name.trim()) {
            const fn = a.first_name.trim()
            const ln = typeof a.last_name === "string" ? a.last_name.trim() : ""
            return (fn[0] + (ln[0] || "")).toUpperCase()
        }
        if (typeof a.username === "string" && a.username.trim()) {
            return a.username.trim()[0].toUpperCase()
        }
        return "A"
    }

    const getPermCount = (perms) => {
        if (!perms) return 0
        let obj = perms
        if (typeof perms === "string") {
            try { obj = JSON.parse(perms) } catch { obj = {} }
        }
        if (!obj || typeof obj !== "object") return 0
        const safeGranular = Array.isArray(GRANULAR_PERMISSIONS) ? GRANULAR_PERMISSIONS : []
        return safeGranular.filter((p) => p && obj[p.key]).length
    }

    const safeGranular = Array.isArray(GRANULAR_PERMISSIONS) ? GRANULAR_PERMISSIONS : []

    return (
        <div className="space-y-6 pb-12">
            {/* Toast Banner */}
            {toast && (
                <div
                    className={cn(
                        "fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2.5 border animate-in slide-in-from-top-3 duration-200",
                        toast.type === "error"
                            ? "bg-rose-600 text-white border-rose-500"
                            : "bg-[#6CBD45] text-white border-[#5ba83a]"
                    )}
                >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Top Super Admin Header */}
            <div className="bg-gradient-to-r from-[#141824] via-[#1a2032] to-[#141824] p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#6CBD45]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6CBD45]/20 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" /> Super Admin Portal (`admin` / `admin123`)
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Team & Permissions Control
                        </h1>
                        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Manage all sub-admin accounts, toggle granular module permissions (Events, Volunteer Keys, Registrations Export, AI Settings, Blogs, Team Control), reset passwords, and toggle account activation.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setModal({ type: "create" })}
                            className="flex items-center gap-2 px-5 py-3 bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#6CBD45]/25 hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Add Sub-Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Admin Accounts",
                        value: safeAdmins.length,
                        subText: "Registered accounts",
                        icon: Users,
                        color: "text-slate-900 dark:text-white"
                    },
                    {
                        label: "Active Accounts",
                        value: safeAdmins.filter((a) => a && a.status === 1).length,
                        subText: "Access enabled",
                        icon: UserCheck,
                        color: "text-[#6CBD45]"
                    },
                    {
                        label: "Inactive / Suspended",
                        value: safeAdmins.filter((a) => a && a.status !== 1).length,
                        subText: "Access disabled",
                        icon: UserX,
                        color: "text-rose-500"
                    },
                    {
                        label: "Super Admins",
                        value: safeAdmins.filter((a) => a && (a.is_super === 1 || a.username === "admin")).length,
                        subText: "Full access level",
                        icon: Star,
                        color: "text-amber-500"
                    }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</span>
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                        </div>
                        <div className="mt-3">
                            <p className={cn("text-2xl sm:text-3xl font-black", stat.color)}>{stat.value}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{stat.subText}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Granular Permissions Reference Bar */}
            <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#6CBD45]" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">6 Granular Permission Modules</h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin configurable per account</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                    {safeGranular.map((gp) => {
                        if (!gp) return null
                        const IconComp = gp.icon || Info
                        return (
                            <div key={gp.key} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border", gp.color)}>
                                    <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{gp.label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">key: {gp.key}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Controls Bar: Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search accounts by name, username, or role…"
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141824] text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        />
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141824] rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                        title="Refresh list"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#6CBD45]")} />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
                    {[
                        { id: "all", label: "All Accounts" },
                        { id: "active", label: "Active Only" },
                        { id: "inactive", label: "Inactive Only" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 sm:flex-none",
                                statusFilter === tab.id
                                    ? "bg-white dark:bg-[#141824] text-[#6CBD45] shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Team Accounts Table */}
            <div className="bg-white dark:bg-[#141824] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#6CBD45]" />
                        <span>Loading team admin accounts…</span>
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="p-16 text-center">
                        <UserCog className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-900 dark:text-white font-bold">No admin accounts found</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Try adjusting your search filter or add a new sub-admin.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <div className="col-span-4 sm:col-span-3">Admin Account</div>
                            <div className="col-span-3 hidden sm:block">Role</div>
                            <div className="col-span-4 sm:col-span-3">Granular Permissions</div>
                            <div className="col-span-3 sm:col-span-1 text-center">Status</div>
                            <div className="col-span-5 sm:col-span-2 text-right">Super Admin Actions</div>
                        </div>

                        {/* Admin Rows */}
                        {filteredAdmins.map((adm) => {
                            if (!adm) return null
                            const isMainSuper = adm.username === "admin" || adm.is_super === 1
                            const permCount = getPermCount(adm.permissions)

                            return (
                                <div
                                    key={adm.id || adm.username}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                                >
                                    {/* Admin Profile Info */}
                                    <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm flex-shrink-0",
                                                isMainSuper
                                                    ? "bg-gradient-to-br from-amber-500 to-amber-600 ring-2 ring-amber-500/30"
                                                    : "bg-gradient-to-br from-[#6CBD45] to-[#4a9e32]"
                                            )}
                                        >
                                            {initials(adm)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {typeof adm.first_name === "string" && adm.first_name.trim()
                                                        ? `${adm.first_name.trim()} ${typeof adm.last_name === "string" ? adm.last_name.trim() : ""}`.trim()
                                                        : (adm.username || "Admin")}
                                                </p>
                                                {isMainSuper && (
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" title="Super Admin Account" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">@{adm.username || "admin"}</p>
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="col-span-3 hidden sm:block">
                                        {isMainSuper ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                <Star className="w-3 h-3" /> Super Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#6CBD45]/10 text-[#4a9e32] border border-[#6CBD45]/20">
                                                <Shield className="w-3 h-3" /> {adm.role_name || "Sub Admin"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Granular Permissions Badges */}
                                    <div className="col-span-4 sm:col-span-3">
                                        {isMainSuper ? (
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> All Modules Unlocked
                                            </span>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-1">
                                                {safeGranular.map((gp) => {
                                                    if (!gp) return null
                                                    let permsObj = adm.permissions
                                                    if (typeof permsObj === "string") {
                                                        try { permsObj = JSON.parse(permsObj || "{}") } catch { permsObj = {} }
                                                    }
                                                    if (!permsObj || typeof permsObj !== "object") permsObj = {}
                                                    const active = !!permsObj[gp.key]
                                                    if (!active) return null
                                                    const labelText = typeof gp.label === "string" ? gp.label.split(" ")[0] : gp.key
                                                    return (
                                                        <span
                                                            key={gp.key}
                                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                                            title={gp.label || gp.key}
                                                        >
                                                            {labelText}
                                                        </span>
                                                    )
                                                })}
                                                {permCount === 0 && (
                                                    <span className="text-xs text-rose-500 italic">No modules granted</span>
                                                )}
                                                <button
                                                    onClick={() => setPermissionsModal(adm)}
                                                    className="ml-1 text-[11px] font-bold text-[#6CBD45] hover:underline"
                                                >
                                                    ({permCount}/6 Edit)
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Switch */}
                                    <div className="col-span-3 sm:col-span-1 text-center">
                                        <button
                                            onClick={() => !isMainSuper && toggleAdminStatus(adm)}
                                            disabled={isMainSuper}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                                                adm.status === 1
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                                                isMainSuper && "cursor-not-allowed opacity-90"
                                            )}
                                            title={isMainSuper ? "Super admin account cannot be deactivated" : "Click to toggle active status"}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full", adm.status === 1 ? "bg-emerald-500" : "bg-rose-500")} />
                                            {adm.status === 1 ? "Active" : "Inactive"}
                                        </button>
                                    </div>

                                    {/* Super Admin Actions */}
                                    <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-1.5">
                                        {/* Edit Granular Permissions Button */}
                                        <button
                                            onClick={() => setPermissionsModal(adm)}
                                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#6CBD45] hover:bg-[#6CBD45]/10 transition-colors"
                                            title="Edit Granular Permissions"
                                        >
                                            <SlidersHorizontal className="w-4 h-4" />
                                        </button>

                                        {/* Reset Password Button */}
                                        <button
                                            onClick={() => setResetPasswordModal(adm)}
                                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                            title="Reset Password"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                        </button>

                                        {/* Edit Account Details */}
                                        <button
                                            onClick={() => setModal({ type: "edit", admin: adm })}
                                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                            title="Edit Account Details"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>

                                        {/* Delete Sub-Admin (Disabled for Main Super Admin) */}
                                        {!isMainSuper && (
                                            <button
                                                onClick={() => setDeleteTarget(adm)}
                                                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                                                title="Remove Account"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {permissionsModal && (
                <PermissionsModal
                    admin={permissionsModal}
                    onClose={() => setPermissionsModal(null)}
                    onSave={handleSavePermissions}
                />
            )}

            {resetPasswordModal && (
                <ResetPasswordModal
                    admin={resetPasswordModal}
                    onClose={() => setResetPasswordModal(null)}
                    onSave={handleSavePassword}
                />
            )}

            {modal && (
                <AdminModal
                    admin={modal.admin}
                    roles={roles}
                    onClose={() => setModal(null)}
                    onSave={handleSaveAdmin}
                />
            )}

            {deleteTarget && (
                <DeleteDialog
                    admin={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}

