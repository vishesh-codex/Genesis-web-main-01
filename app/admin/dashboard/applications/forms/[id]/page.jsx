// app/admin/dashboard/applications/forms/[id]/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft, Plus, Save, Trash2, GripVertical, ChevronUp, ChevronDown,
    Eye, EyeOff, CheckCircle, AlertCircle, Copy, ExternalLink, Settings2
} from "lucide-react"
import { cn } from "@/lib/utils"

const FIELD_TYPES = [
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "url", label: "URL" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Multiple Choice" },
    { value: "checkbox", label: "Checkboxes" },
]

const NEEDS_OPTIONS = ["select", "radio", "checkbox"]

function genId() { return Math.random().toString(36).slice(2) }

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

export default function FormBuilderPage() {
    const router = useRouter()
    const params = useParams()
    const isNew = params.id === "new"

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("draft")
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [preview, setPreview] = useState(false)
    const [toast, setToast] = useState(null)
    const [activeField, setActiveField] = useState(null)

    const showToast = (message, type = "success") => setToast({ message, type })

    // Load existing form
    useEffect(() => {
        if (isNew) return
        const load = async () => {
            try {
                const res = await fetch(`/api/admin/applications/forms/${params.id}`)
                const json = await res.json()
                if (json.success) {
                    setTitle(json.data.title)
                    setDescription(json.data.description || "")
                    setStatus(json.data.status)
                    setFields(json.data.fields.map(f => ({ ...f, _key: genId() })))
                }
            } catch { showToast("Failed to load form", "error") }
            finally { setLoading(false) }
        }
        load()
    }, [params.id, isNew])

    // Add a new field
    const addField = (type = "text") => {
        const newField = {
            _key: genId(),
            label: "",
            field_type: type,
            options: NEEDS_OPTIONS.includes(type) ? ["Option 1", "Option 2"] : [],
            required: false,
            placeholder: "",
        }
        setFields(f => [...f, newField])
        setActiveField(newField._key)
    }

    const updateField = (key, changes) => {
        setFields(f => f.map(field => field._key === key ? { ...field, ...changes } : field))
    }

    const removeField = (key) => {
        setFields(f => f.filter(field => field._key !== key))
        if (activeField === key) setActiveField(null)
    }

    const moveField = (key, dir) => {
        setFields(prev => {
            const idx = prev.findIndex(f => f._key === key)
            const next = [...prev]
            const swap = dir === "up" ? idx - 1 : idx + 1
            if (swap < 0 || swap >= next.length) return prev
                ;[next[idx], next[swap]] = [next[swap], next[idx]]
            return next
        })
    }

    // Save
    const save = async () => {
        if (!title.trim()) { showToast("Form title is required", "error"); return }
        const invalidFields = fields.filter(f => !f.label.trim())
        if (invalidFields.length) { showToast("All fields must have a label", "error"); return }

        setSaving(true)
        try {
            const payload = {
                title, description, status,
                fields: fields.map(f => ({
                    label: f.label,
                    field_type: f.field_type,
                    options: f.options,
                    required: f.required,
                    placeholder: f.placeholder,
                })),
            }
            const url = isNew ? "/api/admin/applications/forms" : `/api/admin/applications/forms/${params.id}`
            const method = isNew ? "POST" : "PUT"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (json.success) {
                showToast("Form saved successfully!")
                if (isNew && json.id) router.replace(`/admin/dashboard/applications/forms/${json.id}`)
            } else {
                showToast(json.error || "Failed to save", "error")
            }
        } catch { showToast("Failed to save", "error") }
        finally { setSaving(false) }
    }

    const copyPublicLink = () => {
        const url = `${window.location.origin}/apply/${params.id}`
        navigator.clipboard.writeText(url)
        showToast("Public link copied!")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-[#6CBD45] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-5 pb-8">
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
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{isNew ? "New Form" : "Edit Form"}</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Build your application form</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && (
                        <>
                            <Button
                                variant="outline" size="sm"
                                className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9"
                                onClick={copyPublicLink}
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy Link
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9"
                                onClick={() => window.open(`/apply/${params.id}`, "_blank")}
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Preview
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline" size="sm"
                        className={cn("rounded-xl text-xs gap-1.5 h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800", preview && "bg-slate-100 dark:bg-slate-800")}
                        onClick={() => setPreview(p => !p)}
                    >
                        {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {preview ? "Edit" : "Preview"}
                    </Button>
                    <Button
                        onClick={save}
                        disabled={saving}
                        className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl text-xs gap-1.5 h-9 px-4 shadow-md shadow-[#6CBD45]/25 font-bold"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "Saving…" : "Save Form"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left — Editor */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Form metadata */}
                    <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                        <CardContent className="p-5 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Form Title *</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Incubation Program Application 2025"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45] bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description shown to applicants at the top of the form"
                                    rows={2}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45] bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45] bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none"
                                >
                                    <option value="draft" className="bg-white dark:bg-[#141824]">Draft (not visible to applicants)</option>
                                    <option value="active" className="bg-white dark:bg-[#141824]">Active (accepting submissions)</option>
                                    <option value="closed" className="bg-white dark:bg-[#141824]">Closed (form closed)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fields */}
                    {fields.length === 0 && !preview && (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
                            <Plus className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No fields yet</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Use the panel on the right to add fields</p>
                        </div>
                    )}

                    {fields.map((field, idx) => (
                        <Card
                            key={field._key}
                            className={cn(
                                "shadow-sm transition-all cursor-pointer bg-white dark:bg-[#141824]/90 border",
                                activeField === field._key ? "border-[#6CBD45] ring-2 ring-[#6CBD45]/20" : "border-slate-200 dark:border-slate-800/80"
                            )}
                            onClick={() => setActiveField(field._key)}
                        >
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    {/* Drag handle / order */}
                                    <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                                        <button
                                            onClick={e => { e.stopPropagation(); moveField(field._key, "up") }}
                                            disabled={idx === 0}
                                            className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20"
                                        ><ChevronUp className="w-4 h-4" /></button>
                                        <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                                        <button
                                            onClick={e => { e.stopPropagation(); moveField(field._key, "down") }}
                                            disabled={idx === fields.length - 1}
                                            className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20"
                                        ><ChevronDown className="w-4 h-4" /></button>
                                    </div>

                                    {/* Main field editor */}
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <input
                                                value={field.label}
                                                onChange={e => updateField(field._key, { label: e.target.value })}
                                                placeholder="Question / Field label"
                                                onClick={e => e.stopPropagation()}
                                                className="flex-1 min-w-32 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 focus:border-[#6CBD45] bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            />
                                            <select
                                                value={field.field_type}
                                                onChange={e => {
                                                    const ft = e.target.value
                                                    updateField(field._key, {
                                                        field_type: ft,
                                                        options: NEEDS_OPTIONS.includes(ft) && !field.options?.length
                                                            ? ["Option 1", "Option 2"]
                                                            : field.options,
                                                    })
                                                }}
                                                onClick={e => e.stopPropagation()}
                                                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30"
                                            >
                                                {FIELD_TYPES.map(t => (
                                                    <option key={t.value} value={t.value} className="bg-white dark:bg-[#141824]">{t.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Placeholder (for text-like fields) */}
                                        {!NEEDS_OPTIONS.includes(field.field_type) && (
                                            <input
                                                value={field.placeholder}
                                                onChange={e => updateField(field._key, { placeholder: e.target.value })}
                                                placeholder="Placeholder text (optional)"
                                                onClick={e => e.stopPropagation()}
                                                className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            />
                                        )}

                                        {/* Options for select/radio/checkbox */}
                                        {NEEDS_OPTIONS.includes(field.field_type) && (
                                            <div className="space-y-1.5">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Options (one per line)</p>
                                                <textarea
                                                    value={(field.options || []).join("\n")}
                                                    onChange={e => updateField(field._key, { options: e.target.value.split("\n") })}
                                                    onClick={e => e.stopPropagation()}
                                                    rows={Math.min(6, (field.options?.length || 2) + 1)}
                                                    placeholder={"Option 1\nOption 2\nOption 3"}
                                                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/30 resize-none font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        )}

                                        {/* Required toggle + delete */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()}>
                                                <div
                                                    className={cn(
                                                        "w-9 h-5 rounded-full transition-colors relative cursor-pointer",
                                                        field.required ? "bg-[#6CBD45]" : "bg-slate-200 dark:bg-slate-800"
                                                    )}
                                                    onClick={() => updateField(field._key, { required: !field.required })}
                                                >
                                                    <div className={cn(
                                                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
                                                        field.required ? "left-4" : "left-0.5"
                                                    )} />
                                                </div>
                                                <span className="text-xs text-slate-600 dark:text-slate-400">Required</span>
                                            </label>
                                            <button
                                                onClick={e => { e.stopPropagation(); removeField(field._key) }}
                                                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right — Add fields panel / preview */}
                <div className="space-y-4">
                    {!preview ? (
                        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm sticky top-6">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-[#6CBD45]" /> Add Field
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="grid grid-cols-1 gap-1.5">
                                    {FIELD_TYPES.map(ft => (
                                        <button
                                            key={ft.value}
                                            onClick={() => addField(ft.value)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#6CBD45] bg-white dark:bg-slate-900 hover:bg-[#6CBD45]/10 text-sm text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] transition-all text-left group"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#6CBD45]" />
                                            {ft.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        <span>{fields.length} fields · {fields.filter(f => f.required).length} required</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        // Preview panel
                        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Form Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{title || "Untitled Form"}</h2>
                                    {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
                                </div>
                                {fields.map((field) => (
                                    <div key={field._key} className="space-y-1">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {field.label || "Untitled Field"}
                                            {field.required && <span className="text-rose-500 ml-1">*</span>}
                                        </label>
                                        {field.field_type === "textarea" ? (
                                            <textarea rows={3} placeholder={field.placeholder} disabled className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 resize-none" />
                                        ) : field.field_type === "select" ? (
                                            <select disabled className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 appearance-none">
                                                <option value="">Select an option…</option>
                                                {(field.options || []).map((o, i) => <option key={i}>{o}</option>)}
                                            </select>
                                        ) : field.field_type === "radio" ? (
                                            <div className="space-y-1">
                                                {(field.options || []).map((o, i) => (
                                                    <label key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <input type="radio" disabled /> {o}
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.field_type === "checkbox" ? (
                                            <div className="space-y-1">
                                                {(field.options || []).map((o, i) => (
                                                    <label key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <input type="checkbox" disabled /> {o}
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <input type={field.field_type} placeholder={field.placeholder} disabled className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                                        )}
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No fields added yet</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}
