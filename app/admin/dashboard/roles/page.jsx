// app/admin/dashboard/roles/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, Plus, Edit2, Trash2, Check, ChevronDown, Search, RefreshCw, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_PERMISSIONS = [
    { key: "events", label: "Events Management" },
    { key: "volunteers", label: "Volunteer Keys & Scanner" },
    { key: "registrations_export", label: "Registrations Export" },
    { key: "ai_settings", label: "AI Settings & Assistant" },
    { key: "blogs", label: "Blogs & News" },
    { key: "team", label: "Team & Admin Control" },
    { key: "dashboard", label: "Dashboard Overview" },
    { key: "applications", label: "Startup Applications" },
    { key: "startups", label: "Incubated Startups" },
    { key: "portfolio", label: "Portfolio Showcase" },
    { key: "gallery", label: "Media Gallery" },
    { key: "contact", label: "Contact Inquiries" },
    { key: "users", label: "Registered Users" },
    { key: "settings", label: "Platform Settings" },
    { key: "roles", label: "Roles Management" },
    { key: "admins", label: "Admins Control" },
]

function PermissionGrid({ value = {}, onChange, disabled }) {
    const safePermissions = Array.isArray(value) ? value : []
    const isChecked = (key) => Array.isArray(value) ? safePermissions.includes(key) : !!value[key]

    const toggle = (key) => {
        if (disabled) return
        if (Array.isArray(value)) {
            const nextArray = (Array.isArray(safePermissions) ? safePermissions : []).filter((k) => k !== key)
            onChange(safePermissions.includes(key) ? nextArray : [...safePermissions, key])
        } else {
            onChange({ ...value, [key]: !value[key] })
        }
    }

    const safeAllPermissions = Array.isArray(ALL_PERMISSIONS) ? ALL_PERMISSIONS : []
    const allOn = safeAllPermissions.length > 0 && safeAllPermissions.every((p) => isChecked(p.key))

    const toggleAll = () => {
        if (disabled) return
        if (Array.isArray(value)) {
            onChange(allOn ? [] : safeAllPermissions.map((p) => p.key))
        } else {
            const next = {}
            safeAllPermissions.forEach((p) => (next[p.key] = !allOn))
            onChange(next)
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={toggleAll}
                disabled={disabled}
                className="mb-3 text-xs font-medium text-[#6CBD45] hover:underline disabled:opacity-50"
            >
                {allOn ? "Deselect All" : "Select All"}
            </button>
            <div className="grid grid-cols-2 gap-2">
                {safeAllPermissions.map((perm) => {
                    const checked = isChecked(perm.key)
                    return (
                        <button
                            key={perm.key}
                            type="button"
                            onClick={() => toggle(perm.key)}
                            disabled={disabled}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                                checked
                                    ? "border-[#6CBD45] bg-[#6CBD45]/10 text-[#4a9e32]"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700",
                                disabled && "opacity-60 cursor-default"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                                    checked ? "border-[#6CBD45] bg-[#6CBD45]" : "border-slate-300 dark:border-slate-700"
                                )}
                            >
                                {checked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            {perm.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function RoleModal({ role, onClose, onSave }) {
    const editing = !!role?.id
    const [name, setName] = useState(role?.name || "")
    const [description, setDescription] = useState(role?.description || "")
    const [permissions, setPermissions] = useState(() => {
        if (role?.permissions && typeof role.permissions === "object") return role.permissions
        try { return JSON.parse(role?.permissions || "{}") } catch { return {} }
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) { setError("Role name is required"); return }
        setSaving(true)
        setError("")
        try {
            const url = editing ? `/api/admin/roles/${role.id}` : "/api/admin/roles"
            const method = editing ? "PUT" : "POST"
            const safePerms = Array.isArray(permissions) ? permissions : permissions
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), description: description.trim(), permissions: safePerms }),
            })
            const data = await res.json()
            if (data.success) {
                onSave(data.id, { 
                    name, slug: role?.slug || name.toLowerCase().replace(/\s+/g, '-'), description, is_super: role?.is_super || 0, permissions: safePerms 
                })
            } else {
                setError(data.message || "Failed to save role")
            }
        } catch {
            setError("Network error")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141824] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#6CBD45]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit Role" : "Create Role"}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Configure name and permissions</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-sm text-rose-800 dark:text-rose-400">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role Name *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Content Editor"
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description of what this role can do…"
                            rows={2}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45] resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Permissions</label>
                        <PermissionGrid value={permissions} onChange={setPermissions} />
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
                            {saving ? "Saving…" : editing ? "Update Role" : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function DeleteDialog({ role, onClose, onConfirm }) {
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
                        <h3 className="font-bold text-slate-900 dark:text-white">Delete Role?</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                    Delete <strong>"{role.name}"</strong>? Admins assigned to this role will lose their role assignment.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function RolesPage() {
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

    const fetchRoles = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/roles")
            const data = await res.json()
            if (data.success) setRoles(Array.isArray(data.data) ? data.data : [])
            else setRoles([])
        } catch {
            setRoles([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchRoles() }, [fetchRoles])

    const handleDelete = async () => {
        const res = await fetch(`/api/admin/roles/${deleteTarget.id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
            showToast("Role deleted")
            setRoles(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== deleteTarget.id))
        } else {
            showToast(data.message, "error")
        }
        setDeleteTarget(null)
    }

    const handleSave = (newId, formData) => {
        if (modal?.role?.id) {
            setRoles(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === modal.role.id ? { ...r, ...formData } : r))
        } else if (newId) {
            setRoles(prev => [{ id: newId, ...formData }, ...(Array.isArray(prev) ? prev : [])])
        }
        setModal(null)
        showToast(modal?.role?.id ? "Role updated" : "Role created")
    }

    const countPermissions = (perms) => {
        if (!perms) return 0
        let obj = perms
        if (typeof perms === "string") {
            try { obj = JSON.parse(perms) } catch { return 0 }
        }
        if (Array.isArray(obj)) {
            return (Array.isArray(obj) ? obj : []).filter(Boolean).length
        }
        if (typeof obj === "object" && obj !== null) {
            const values = Object.values(obj)
            return (Array.isArray(values) ? values : []).filter(Boolean).length
        }
        return 0
    }

    const filtered = (Array.isArray(roles) ? roles : []).filter((r) =>
        r?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r?.description?.toLowerCase().includes(search.toLowerCase())
    )

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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Roles</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Create and manage admin roles with custom permissions</p>
                </div>
                <button
                    onClick={() => setModal({ type: "create" })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New Role
                </button>
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roles…"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45]"
                    />
                </div>
                <button
                    onClick={fetchRoles}
                    className="p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Roles Table */}
            <div className="bg-white dark:bg-[#141824] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Loading roles…</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Shield className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-900 dark:text-white font-medium">No roles found</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Create your first role to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-100/80 dark:bg-slate-900/90 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            <div className="col-span-4">Role</div>
                            <div className="col-span-4 hidden sm:block">Description</div>
                            <div className="col-span-2 hidden sm:block">Permissions</div>
                            <div className="col-span-4 sm:col-span-2 text-right">Actions</div>
                        </div>
                        {(Array.isArray(filtered) ? filtered : []).map((role) => {
                            const permCount = countPermissions(role.permissions)
                            return (
                                <div key={role.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            role.is_super ? "bg-amber-100 dark:bg-amber-950/60" : "bg-[#6CBD45]/10"
                                        )}>
                                            {role.is_super
                                                ? <Star className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                                : <Shield className="w-4 h-4 text-[#6CBD45]" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{role.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{role.slug}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-4 hidden sm:block">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{role.description || <span className="italic text-slate-400">No description</span>}</p>
                                    </div>
                                    <div className="col-span-2 hidden sm:block">
                                        {role.is_super ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80">
                                                <Star className="w-3 h-3" /> Full Access
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#6CBD45]/10 text-[#4a9e32] border border-[#6CBD45]/20">
                                                {permCount}/{(Array.isArray(ALL_PERMISSIONS) ? ALL_PERMISSIONS : []).length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setModal({ type: "edit", role })}
                                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#6CBD45] hover:bg-[#6CBD45]/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {!role.is_super && (
                                            <button
                                                onClick={() => setDeleteTarget(role)}
                                                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                                                title="Delete"
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

            {/* Modals */}
            {modal && (
                <RoleModal
                    role={modal.role}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
            {deleteTarget && (
                <DeleteDialog
                    role={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}
