// app/admin/dashboard/admins/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { UserCog, Plus, Edit2, Trash2, Check, Search, RefreshCw, Shield, Star, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"

function AdminModal({ admin, roles, onClose, onSave }) {
    const editing = !!admin?.id
    const [form, setForm] = useState({
        username: admin?.username || "",
        first_name: admin?.first_name || "",
        last_name: admin?.last_name || "",
        password: "",
        role_id: admin?.role_id || "",
        status: admin?.status === 1 ? 1 : editing ? admin?.status : 1,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username.trim()) { setError("Username is required"); return }
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
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                onSave(data.id, body)
            } else {
                setError(data.message || "Failed to save admin")
            }
        } catch {
            setError("Network error")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-[#6CBD45]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit Admin" : "Create Admin"}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Assign a role to control access</p>
                        </div>
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
                                placeholder="John"
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                            <input
                                value={form.last_name}
                                onChange={(e) => set("last_name", e.target.value)}
                                placeholder="Doe"
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username *</label>
                        <input
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                            placeholder="johndoe"
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
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
                            placeholder={editing ? "••••••••" : "At least 6 chars"}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned Role</label>
                        <select
                            value={form.role_id}
                            onChange={(e) => set("role_id", e.target.value ? Number(e.target.value) : "")}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        >
                            <option value="" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">No role assigned</option>
                            {(Array.isArray(roles) ? roles : []).map((r) => (
                                <option key={r.id} value={r.id} className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">
                                    {r.name} {r.is_super ? "(Super Admin)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                        <button
                            type="button"
                            onClick={() => set("status", form.status === 1 ? 0 : 1)}
                            className={cn(
                                "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all",
                                form.status === 1
                                    ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                            )}
                        >
                            <span>{form.status === 1 ? "Active — Admin can log in" : "Inactive — Account disabled"}</span>
                            {form.status === 1 ? <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                        </button>
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
                            {saving ? "Saving…" : editing ? "Update Admin" : "Create Admin"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function DeleteDialog({ admin, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false)
    const handleDelete = async () => {
        setDeleting(true)
        await onConfirm()
        setDeleting(false)
    }
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Remove Admin?</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                    Remove admin account <strong>"{admin.username}"</strong>? They will lose access to the admin panel immediately.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                        {deleting ? "Removing…" : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [modal, setModal] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [aRes, rRes] = await Promise.all([
                fetch("/api/admin/admins"),
                fetch("/api/admin/roles"),
            ])
            const aData = await aRes.json()
            const rData = await rRes.json()
            if (aData.success) setAdmins(aData.data)
            if (rData.success) setRoles(rData.data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleDelete = async () => {
        const res = await fetch(`/api/admin/admins/${deleteTarget.id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
            showToast("Admin removed")
            setAdmins(prev => (Array.isArray(prev) ? prev : []).filter(a => a.id !== deleteTarget.id))
        } else {
            showToast(data.message, "error")
        }
        setDeleteTarget(null)
    }

    const handleSave = (newId, formData) => {
        const role = (Array.isArray(roles) ? roles : []).find(r => r.id === formData.role_id)
        const updatedData = { ...formData, role_name: role ? role.name : null, is_super: role ? role.is_super : 0 }
        
        if (modal?.admin?.id) {
            setAdmins(prev => (Array.isArray(prev) ? prev : []).map(a => a.id === modal.admin.id ? { ...a, ...updatedData } : a))
        } else if (newId) {
            setAdmins(prev => [{ id: newId, ...updatedData }, ...prev])
        }
        setModal(null)
        showToast(modal?.admin?.id ? "Admin updated" : "Admin created")
    }

    const filtered = (Array.isArray(admins) ? admins : []).filter((a) => {
        const term = search.toLowerCase()
        return (
            a.username?.toLowerCase().includes(term) ||
            a.first_name?.toLowerCase().includes(term) ||
            a.last_name?.toLowerCase().includes(term) ||
            a.role_name?.toLowerCase().includes(term)
        )
    })

    const initials = (a) => {
        if (a.first_name) return (a.first_name[0] + (a.last_name?.[0] || "")).toUpperCase()
        return a.username?.[0]?.toUpperCase() || "A"
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2",
                    toast.type === "error" ? "bg-rose-600 text-white" : "bg-[#6CBD45] text-white"
                )}>
                    <Check className="w-4 h-4" /> {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admins</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Manage admin accounts and their role assignments</p>
                </div>
                <button
                    onClick={() => setModal({ type: "create" })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New Admin
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Admins", value: (Array.isArray(admins) ? admins : []).length, color: "text-slate-900 dark:text-white" },
                    { label: "Active", value: (Array.isArray(admins) ? admins : []).filter(a => a.status === 1).length, color: "text-[#6CBD45]" },
                    { label: "Inactive", value: (Array.isArray(admins) ? admins : []).filter(a => a.status !== 1).length, color: "text-rose-600 dark:text-rose-400" },
                    { label: "Roles in Use", value: new Set((Array.isArray(admins) ? admins : []).map(a => a.role_id).filter(Boolean)).size, color: "text-blue-600 dark:text-blue-400" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                        <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search admins…"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#141824] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Loading admins…</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserCog className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-900 dark:text-white font-medium">No admins found</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Create your first admin to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-100/80 dark:bg-slate-900/90 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            <div className="col-span-5 sm:col-span-4">Admin</div>
                            <div className="col-span-4 hidden sm:block">Role</div>
                            <div className="col-span-3 hidden sm:block">Status</div>
                            <div className="col-span-7 sm:col-span-1 text-right">Actions</div>
                        </div>
                        {(Array.isArray(filtered) ? filtered : []).map((adm) => (
                            <div key={adm.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                {/* Admin Info */}
                                <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6CBD45] to-[#4a9e32] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <span className="text-white text-sm font-bold">{initials(adm)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {adm.first_name ? `${adm.first_name} ${adm.last_name || ""}`.trim() : adm.username}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{adm.username}</p>
                                    </div>
                                </div>
                                {/* Role */}
                                <div className="col-span-4 hidden sm:block">
                                    {adm.role_name ? (
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                                            adm.is_super ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80" : "bg-[#6CBD45]/10 text-[#4a9e32] border border-[#6CBD45]/20"
                                        )}>
                                            {adm.is_super ? <Star className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {adm.role_name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">No role</span>
                                    )}
                                </div>
                                {/* Status */}
                                <div className="col-span-3 hidden sm:block">
                                    <span className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
                                        adm.status === 1
                                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80"
                                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", adm.status === 1 ? "bg-emerald-500" : "bg-slate-400")} />
                                        {adm.status === 1 ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                {/* Actions */}
                                <div className="col-span-7 sm:col-span-1 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setModal({ type: "edit", admin: adm })}
                                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#6CBD45] hover:bg-[#6CBD45]/10 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(adm)}
                                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal && (
                <AdminModal
                    admin={modal.admin}
                    roles={roles}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
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
