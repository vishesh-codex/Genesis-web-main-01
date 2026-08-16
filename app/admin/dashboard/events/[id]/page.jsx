// app/admin/dashboard/events/[id]/page.jsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useParams } from "next/navigation"
import {
  Calendar, MapPin, Users, Plus, Edit, Trash2, Clock,
  Upload, X, ArrowLeft, UserCheck, UserX, Download,
  Image as ImageIcon, BarChart3, Settings, CheckCircle,
  XCircle, AlertCircle, Star, RefreshCw, Eye, FileText,
  MoveUp, MoveDown, Check, Sparkles, Layers, ListPlus,
  FileSpreadsheet, Printer, Table, Filter
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// ─── Constants ────────────────────────────────────────────
const STATUS_CFG = {
  upcoming: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Upcoming' },
  ongoing: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Ongoing' },
  completed: { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
}

const REG_STATUS_CFG = {
  confirmed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Confirmed' },
  pending: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
}

const CATEGORIES = [
  'Technology', 'Business', 'Health', 'Education', 'Entertainment',
  'Workshop', 'Summit', 'Competition', 'Bootcamp', 'Networking'
]

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'registrations', label: 'Registrations', icon: Users },
  { id: 'form-fields', label: 'Form Fields', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'highlights', label: 'Highlights', icon: ImageIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const PRESET_TEMPLATES = [
  {
    key: 'qu_id',
    name: 'QU_ID',
    field_name: 'qu_id',
    field_label: 'QU Registration ID',
    field_type: 'text',
    required: true,
    placeholder: 'e.g. QU20261234',
    icon: '🆔'
  },
  {
    key: 'full_name',
    name: 'Name',
    field_name: 'full_name',
    field_label: 'Full Name',
    field_type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    icon: '👤'
  },
  {
    key: 'email',
    name: 'Email',
    field_name: 'email',
    field_label: 'Email Address',
    field_type: 'email',
    required: true,
    placeholder: 'name@example.com',
    icon: '✉️'
  },
  {
    key: 'phone',
    name: 'Phone',
    field_name: 'phone',
    field_label: 'Phone Number',
    field_type: 'phone',
    required: true,
    placeholder: '+91 98765 43210',
    icon: '📞'
  },
  {
    key: 'organization',
    name: 'Company/Institution',
    field_name: 'organization',
    field_label: 'Company / Institution',
    field_type: 'text',
    required: false,
    placeholder: 'Your startup or university',
    icon: '🏢'
  }
]

// ─── Small helpers ─────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
      <p className={cn("text-2xl font-bold", accent ?? "text-slate-900 dark:text-white")}>{value}</p>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  )
}

function getAttendeeDetails(reg) {
  const data = reg.registration_data || {}
  const name = data.full_name || data.name || data.Name || data['Full Name'] || reg.name || reg.user_name || 'N/A'
  const qu_id = data.qu_id || data.QU_ID || data.qu_registration_id || data['QU Registration ID'] || data.student_id || reg.qu_id || 'N/A'
  const email = data.email || data.Email || data['Email Address'] || reg.email || reg.user_email || 'N/A'
  const phone = data.phone || data.Phone || data['Phone Number'] || data.mobile || reg.phone || 'N/A'
  const company = data.organization || data.company_institution || data.company || data.institution || data['Company / Institution'] || data['Company/Institution'] || data['Organization'] || 'N/A'
  
  return { name, qu_id, email, phone, company }
}

// ─── Main Component ───────────────────────────────────────
export default function EventDetailsPage() {
  const params = useParams()
  const eventId = useMemo(() => {
    const id = params?.id
    return Number(Array.isArray(id) ? id[0] : id)
  }, [params])

  // State
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [formFields, setFormFields] = useState([])
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportOptions, setExportOptions] = useState({ format: 'xlsx', status: 'all', fieldScope: 'standard' })
  const [exporting, setExporting] = useState(false)
  const [valuePagesMap, setValuePagesMap] = useState({})
  const [showHighlightModal, setShowHighlightModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newHighlight, setNewHighlight] = useState({ event_id: eventId, title: '', description: '', image_url: '', order_index: 0 })
  const [editEvent, setEditEvent] = useState({ title: '', description: '', date: '', time: '', location: '', max_attendees: 0, category: '', featured: false, status: 'upcoming' })
  const { toast } = useToast()

  // Form Fields Modal State
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [fieldForm, setFieldForm] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    required: true,
    placeholder: '',
    field_options: '',
    order_index: 0
  })
  const [savingField, setSavingField] = useState(false)

  // ── API calls ──────────────────────────────────────────
  const fetchEvent = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}/details`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setEvent(d)
      setEditEvent({ title: d.title, description: d.description, date: d.date, time: d.time, location: d.location, max_attendees: d.max_attendees, category: d.category, featured: d.featured, status: d.status })
    } catch { toast({ title: "Error", description: "Failed to fetch event", variant: "destructive" }) }
  }, [eventId, toast])

  const fetchRegistrations = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}/participants`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setRegistrations(Array.isArray(d) ? d : (d.registrations ?? []))
    } catch { toast({ title: "Error", description: "Failed to fetch registrations", variant: "destructive" }) }
  }, [eventId, toast])

  const fetchFormFields = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}/form-fields`)
      if (r.ok) setFormFields(await r.json())
    } catch { }
  }, [eventId])

  const fetchHighlights = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}/highlights`)
      if (r.ok) setHighlights(await r.json())
    } catch { }
  }, [eventId])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchEvent(), fetchRegistrations(), fetchFormFields(), fetchHighlights()])
      setLoading(false)
    }
    init()
  }, [fetchEvent, fetchRegistrations, fetchFormFields, fetchHighlights])

  // Form Field Actions
  const handleOpenAddField = useCallback(() => {
    setEditingField(null)
    setFieldForm({
      field_name: '',
      field_label: '',
      field_type: 'text',
      required: true,
      placeholder: '',
      field_options: '',
      order_index: formFields.length + 1
    })
    setShowFieldModal(true)
  }, [formFields.length])

  const handleOpenEditField = useCallback((field) => {
    setEditingField(field)
    setFieldForm({
      field_name: field.field_name || '',
      field_label: field.field_label || '',
      field_type: field.field_type || 'text',
      required: !!field.required,
      placeholder: field.placeholder || '',
      field_options: Array.isArray(field.field_options) ? field.field_options.join(', ') : (field.field_options || ''),
      order_index: field.order_index || 0
    })
    setShowFieldModal(true)
  }, [])

  const handleSaveField = useCallback(async () => {
    if (!fieldForm.field_label.trim()) {
      toast({ title: "Validation Error", description: "Field label is required", variant: "destructive" })
      return
    }
    const fieldName = String(fieldForm.field_name || "").trim() || String(fieldForm.field_label || "").toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
    
    setSavingField(true)
    try {
      const optionsArray = (fieldForm.field_type === 'select' || fieldForm.field_type === 'radio')
        ? (typeof fieldForm.field_options === 'string' ? String(fieldForm.field_options || "").split(",").map(s => s.trim()).filter(Boolean) : fieldForm.field_options)
        : null

      const payload = {
        field_name: fieldName,
        field_label: fieldForm.field_label.trim(),
        field_type: fieldForm.field_type,
        required: fieldForm.required,
        placeholder: fieldForm.placeholder.trim(),
        field_options: optionsArray,
        order_index: fieldForm.order_index || (formFields.length + 1)
      }

      let res
      if (editingField?.id) {
        res = await fetch(`/api/admin/events/${eventId}/form-fields/${editingField.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`/api/admin/events/${eventId}/form-fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error()
      toast({ title: editingField ? "Form field updated" : "Form field created" })
      setShowFieldModal(false)
      fetchFormFields()
    } catch {
      toast({ title: "Error", description: "Failed to save form field", variant: "destructive" })
    } finally {
      setSavingField(false)
    }
  }, [fieldForm, editingField, eventId, formFields.length, fetchFormFields, toast])

  const handleDeleteFormField = useCallback(async (fieldId) => {
    if (!confirm('Are you sure you want to delete this form field?')) return
    try {
      const res = await fetch(`/api/admin/events/${eventId}/form-fields/${fieldId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error()
      toast({ title: "Form field deleted" })
      fetchFormFields()
    } catch {
      toast({ title: "Error", description: "Failed to delete form field", variant: "destructive" })
    }
  }, [eventId, fetchFormFields, toast])

  const handleLoadTemplates = useCallback(async (presetOrAll, mode = 'append') => {
    try {
      let fieldsToLoad = []
      if (Array.isArray(presetOrAll)) {
        fieldsToLoad = presetOrAll
      } else if (presetOrAll) {
        fieldsToLoad = [presetOrAll]
      } else {
        fieldsToLoad = PRESET_TEMPLATES
      }

      const res = await fetch(`/api/admin/events/${eventId}/form-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load_templates',
          fields: fieldsToLoad,
          mode: mode
        })
      })
      if (!res.ok) throw new Error()
      toast({ title: "Pre-set templates loaded" })
      fetchFormFields()
    } catch {
      toast({ title: "Error", description: "Failed to load pre-set templates", variant: "destructive" })
    }
  }, [eventId, fetchFormFields, toast])

  const handleMoveField = useCallback(async (index, direction) => {
    const newFields = [...formFields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFields.length) return

    const temp = newFields[index]
    newFields[index] = newFields[targetIndex]
    newFields[targetIndex] = temp

    const updatedWithOrder = (Array.isArray(newFields) ? newFields : []).map((f, idx) => ({ ...f, order_index: idx + 1 }))
    setFormFields(updatedWithOrder)

    try {
      await fetch(`/api/admin/events/${eventId}/form-fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updatedWithOrder })
      })
      toast({ title: "Field order updated" })
    } catch {
      fetchFormFields()
    }
  }, [formFields, eventId, fetchFormFields, toast])

  // Highlight image upload
  const handleImageUpload = useCallback(async (file) => {
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/admin/events/upload', { method: 'POST', body: fd })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setNewHighlight(p => ({ ...p, image_url: d.url }))
      toast({ title: "Image uploaded" })
    } catch { toast({ title: "Error", description: "Failed to upload image", variant: "destructive" }) }
  }, [toast])

  const handleAddHighlight = useCallback(async () => {
    if (!newHighlight.title || !newHighlight.description) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" }); return
    }
    try {
      const r = await fetch(`/api/admin/events/${eventId}/highlights`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newHighlight) })
      if (!r.ok) throw new Error()
      toast({ title: "Highlight added" })
      setShowHighlightModal(false)
      setNewHighlight({ event_id: eventId, title: '', description: '', image_url: '', order_index: highlights.length })
      fetchHighlights()
    } catch { toast({ title: "Error", description: "Failed to add highlight", variant: "destructive" }) }
  }, [eventId, newHighlight, highlights.length, toast, fetchHighlights])

  const handleDeleteHighlight = useCallback(async (id) => {
    if (!confirm('Delete this highlight?')) return
    try {
      const r = await fetch(`/api/admin/events/${eventId}/highlights/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      toast({ title: "Highlight deleted" }); fetchHighlights()
    } catch { toast({ title: "Error", description: "Failed to delete highlight", variant: "destructive" }) }
  }, [eventId, toast, fetchHighlights])

  const handleUpdateEvent = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editEvent) })
      if (!r.ok) throw new Error()
      toast({ title: "Event updated" }); setShowEditModal(false); fetchEvent()
    } catch { toast({ title: "Error", description: "Failed to update event", variant: "destructive" }) }
  }, [eventId, editEvent, toast, fetchEvent])

  const handleDeleteEvent = useCallback(async () => {
    if (!confirm('Delete this event? All registrations will be lost.')) return
    try {
      const r = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      toast({ title: "Event deleted" }); typeof window !== 'undefined' && window.history.back()
    } catch { toast({ title: "Error", description: "Failed to delete event", variant: "destructive" }) }
  }, [eventId, toast])

  const handleExportRegistrations = useCallback(async () => {
    setExporting(true)
    try {
      const regs = exportOptions.status === 'all'
        ? (registrations || [])
        : (Array.isArray(registrations) ? registrations : []).filter(r => r.status === exportOptions.status)

      let exportRows = []
      if (regs.length === 0) {
        exportRows = [{
          'S.No': 1,
          'Registration ID': '#SAMPLE-0',
          'Name': 'No registrations recorded yet',
          'QU_ID': 'N/A',
          'Email': 'N/A',
          'Phone': 'N/A',
          'Company/Institution': 'N/A',
          'Status': String(exportOptions.status || '').toUpperCase(),
          'Registration Date': new Date().toLocaleString('en-IN')
        }]
      } else {
        exportRows = (Array.isArray(regs) ? regs : []).map((reg, index) => {
          const att = getAttendeeDetails(reg)
          const row = {
            'S.No': index + 1,
            'Registration ID': reg.id ? `#${reg.id}` : 'N/A',
            'Name': att.name,
            'QU_ID': att.qu_id,
            'Email': att.email,
            'Phone': att.phone,
            'Company/Institution': att.company,
            'Status': String(reg.status || 'pending').toUpperCase(),
            'Registration Date': reg.registration_date ? new Date(reg.registration_date).toLocaleString('en-IN') : 'N/A'
          }

          if (exportOptions.fieldScope === 'all' && reg.registration_data) {
            Object.entries(reg.registration_data).forEach(([key, val]) => {
              const colName = String(key || '').replace(/_/g, ' ').toUpperCase()
              if (!row[colName]) {
                row[colName] = Array.isArray(val) ? val.join(', ') : String(val ?? '—')
              }
            })
          }
          return row
        })
      }

      const titleClean = (event?.title || `Event_${eventId}`).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
      const fileBase = `${titleClean}_Attendee_List`

      if (exportOptions.format === 'xlsx' || exportOptions.format === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(exportRows)
        const colWidths = Object.keys(exportRows[0] || {}).map(key => {
          const maxLen = Math.max(
            key.length,
            ...(Array.isArray(exportRows) ? exportRows : []).map(row => String(row[key] || "").length)
          )
          return { wch: Math.min(Math.max(maxLen + 3, 12), 45) }
        })
        worksheet['!cols'] = colWidths

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees")

        if (exportOptions.format === 'xlsx') {
          XLSX.writeFile(workbook, `${fileBase}.xlsx`)
          toast({ title: 'Excel Export Complete', description: 'Downloaded .xlsx file successfully' })
        } else {
          const csvOutput = XLSX.utils.sheet_to_csv(worksheet)
          const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${fileBase}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast({ title: 'CSV Export Complete', description: 'Downloaded .csv file successfully' })
        }
        setShowExportModal(false)
      } else if (exportOptions.format === 'pdf') {
        const headers = Object.keys(exportRows[0] || {})
        const headerCells = (Array.isArray(headers) ? headers : []).map(h => 
          `<th style="padding:9px 10px;background:#6CBD45;color:#ffffff;font-size:11px;font-weight:700;text-align:left;border:1px solid #4f9a2e;text-transform:uppercase;">${h}</th>`
        ).join('')

        const bodyRows = (Array.isArray(exportRows) ? exportRows : []).map((row, i) => {
          const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
          const cells = (Array.isArray(headers) ? headers : []).map(h => {
            let val = row[h] || '—'
            if (h === 'Status') {
              const stColor = val === 'CONFIRMED' ? '#166534;background:#dcfce7;border:1px solid #bbf7d0;' : val === 'CANCELLED' ? '#991b1b;background:#fee2e2;border:1px solid #fecaca;' : '#92400e;background:#fef3c7;border:1px solid #fde68a;'
              val = `<span style="padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;color:${stColor}">${val}</span>`
            }
            return `<td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:11px;color:#1e293b;">${val}</td>`
          }).join('')
          return `<tr style="background:${bg}">${cells}</tr>`
        }).join('')

        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Attendee Report — ${event?.title || 'Event'}</title>
  <meta charset="utf-8" />
  <style>
    @media print {
      body { margin: 0; padding: 12px; }
      @page { size: A4 landscape; margin: 10mm; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
    .header-box { border-bottom: 3px solid #6CBD45; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
    .sub-meta { font-size: 12px; color: #64748b; margin: 0; }
    .logo-badge { background: #6CBD45; color: #ffffff; font-weight: 800; padding: 6px 14px; border-radius: 8px; font-size: 12px; letter-spacing: 0.5px; }
    .summary-bar { display: flex; gap: 12px; margin-bottom: 18px; }
    .sum-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; }
    .sum-lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .sum-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 class="title">${event?.title || 'Event'} — Attendee Report</h1>
      <p class="sub-meta">Generated: ${new Date().toLocaleString('en-IN')} | Category: ${event?.category || 'General'} | Status Filter: ${String(exportOptions.status || "").toUpperCase()}</p>
    </div>
    <div class="logo-badge">GENESIS QUIC</div>
  </div>

  <div class="summary-bar">
    <div class="sum-card"><div class="sum-lbl">Total Exported</div><div class="sum-val">${regs.length}</div></div>
    <div class="sum-card"><div class="sum-lbl">Confirmed</div><div class="sum-val">${(Array.isArray(regs) ? regs : []).filter(r => r.status === "confirmed").length}</div></div>
    <div class="sum-card"><div class="sum-lbl">Pending</div><div class="sum-val">${(Array.isArray(regs) ? regs : []).filter(r => r.status === "pending").length}</div></div>
    <div class="sum-card"><div class="sum-lbl">Cancelled</div><div class="sum-val">${(Array.isArray(regs) ? regs : []).filter(r => r.status === "cancelled").length}</div></div>
  </div>

  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>

  <div class="footer">
    <span>Genesis QUIC Event Management System</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>`

        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(html)
          printWindow.document.close()
        }
        toast({ title: 'PDF Report Ready', description: 'Opened print preview dialog for PDF generation.' })
        setShowExportModal(false)
      }
    } catch (err) {
      console.error("Export error:", err)
      toast({ title: 'Export Failed', description: 'Failed to generate export file.', variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }, [registrations, exportOptions, event, eventId, toast])

  // ── Derived / analytics ───────────────────────────────
  const analytics = useMemo(() => {
    const total = registrations.length
    const confirmed = (Array.isArray(registrations) ? registrations : []).filter(r => r.status === "confirmed").length
    const pending = (Array.isArray(registrations) ? registrations : []).filter(r => r.status === "pending").length
    const cancelled = (Array.isArray(registrations) ? registrations : []).filter(r => r.status === "cancelled").length

    const byDateMap = registrations.reduce((acc, r) => {
      const d = new Date(r.registration_date).toISOString().split('T')[0]
      acc[d] = (acc[d] || 0) + 1; return acc
    }, {})
    const byDate = Object.entries(byDateMap || {}).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))

    const fieldStats = {}
    registrations.forEach(r => {
      if (r.registration_data) {
        Object.entries(r.registration_data).forEach(([k, v]) => {
          if (!fieldStats[k]) fieldStats[k] = {}
          const vs = String(v || 'Not provided')
          fieldStats[k][vs] = (fieldStats[k][vs] || 0) + 1
        })
      }
    })
    return { total, confirmed, pending, cancelled, byDate, fieldStats }
  }, [registrations])

  const filteredRegs = useMemo(() =>
    statusFilter === "all" ? (Array.isArray(registrations) ? registrations : []) : (Array.isArray(registrations) ? registrations : []).filter(r => r.status === statusFilter)
    , [registrations, statusFilter])

  // ── Loading state ─────────────────────────────────────
  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )

  if (!event) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-800">Event not found</h2>
        <p className="text-sm text-slate-500 mt-1">The requested event could not be found.</p>
        <Button className="mt-4" variant="outline" onClick={() => typeof window !== 'undefined' && window.history.back()}><ArrowLeft className="w-4 h-4 mr-1.5" />Go back</Button>
      </div>
    </div>
  )

  const evStatus = STATUS_CFG[event.status] ?? STATUS_CFG.upcoming
  const pct = event.max_attendees > 0 ? Math.min(100, Math.round(event.current_registrations / event.max_attendees * 100)) : 0

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex-shrink-0" onClick={() => typeof window !== 'undefined' && window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 truncate">{event.title}</h1>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", evStatus.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", evStatus.dot)} />{evStatus.label}
              </span>
              {event.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  <Star className="w-2.5 h-2.5" />Featured
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{event.category} · ID #{event.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Button variant="outline" size="sm" className="h-9 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold shadow-xs" onClick={() => { setExportOptions(p => ({ ...p, format: 'xlsx' })); setShowExportModal(true) }}>
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />Export Excel (.xlsx/.csv)
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold shadow-xs" onClick={() => { setExportOptions(p => ({ ...p, format: 'pdf' })); setShowExportModal(true) }}>
            <FileText className="w-4 h-4 mr-1.5 text-rose-600" />Export PDF Report
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => { fetchEvent(); fetchRegistrations(); fetchFormFields(); fetchHighlights() }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" className="h-9 bg-[#6CBD45] hover:bg-[#5ba83a] text-white shadow-sm" onClick={() => setShowEditModal(true)}>
            <Edit className="w-3.5 h-3.5 mr-1.5" />Edit Event
          </Button>
        </div>
      </div>

      {/* ── Stat bar ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Registrations" value={analytics.total} sub={`of ${event.max_attendees || '∞'} max`} />
        <StatCard label="Confirmed" value={analytics.confirmed} accent="text-emerald-600"
          sub={analytics.total > 0 ? `${Math.round(analytics.confirmed / analytics.total * 100)}% rate` : '0% rate'} />
        <StatCard label="Pending" value={analytics.pending} accent="text-amber-600" sub="awaiting confirmation" />
        <StatCard label="Cancelled" value={analytics.cancelled} accent="text-red-500" sub="cancelled" />
      </div>

      {/* ── Attendance progress ────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />Attendance</span>
            <span className="font-semibold text-slate-700">{event.current_registrations}/{event.max_attendees || '∞'} · {pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#6CBD45] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex overflow-x-auto border-b border-slate-100 px-2 gap-1 no-scrollbar">
          {(Array.isArray(TABS) ? TABS : []).map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "border-[#6CBD45] text-[#6CBD45]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                )}>
                <Icon className="w-3.5 h-3.5" />{tab.label}
                {tab.id === 'registrations' && <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-0.5", activeTab === 'registrations' ? 'bg-[#6CBD45]/15 text-[#6CBD45]' : 'bg-slate-100 text-slate-500')}>{analytics.total}</span>}
                {tab.id === 'form-fields' && <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-0.5", activeTab === 'form-fields' ? 'bg-[#6CBD45]/15 text-[#6CBD45]' : 'bg-slate-100 text-slate-500')}>{formFields.length}</span>}
              </button>
            )
          })}
        </div>

        {/* ── Overview ─────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Event image + details */}
            <div className="lg:col-span-2 space-y-4">
              {event.image_url && (
                <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-100">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="w-4 h-4 text-slate-400" />{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4 text-slate-400" />{event.time}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4 text-slate-400" />{event.location}</div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            </div>

            {/* Quick info */}
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <InfoRow label="Category" value={event.category || '—'} />
                <InfoRow label="Max Attendees" value={event.max_attendees || 'Unlimited'} />
                <InfoRow label="Form Fields" value={`${formFields.length} field${formFields.length !== 1 ? 's' : ''}`} />
                <InfoRow label="Highlights" value={`${highlights.length} item${highlights.length !== 1 ? 's' : ''}`} />
                {event.created_at && <InfoRow label="Created" value={new Date(event.created_at).toLocaleDateString()} />}
              </div>
              {formFields.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Form Fields</p>
                    <button onClick={() => setActiveTab('form-fields')} className="text-xs text-[#6CBD45] hover:underline font-medium">Manage</button>
                  </div>
                  <div className="space-y-1.5">
                    {(Array.isArray(formFields) ? formFields : []).map(f => (
                      <div key={f.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{f.field_label}</span>
                        <div className="flex gap-1">
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded capitalize">{f.field_type}</span>
                          {f.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Registrations ────────────────────────────── */}
        {activeTab === 'registrations' && (
          <div className="p-5 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all",
                      statusFilter === s ? "bg-[#6CBD45] text-white border-[#6CBD45]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}>
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs" onClick={() => { setExportOptions(p => ({ ...p, format: 'xlsx' })); setShowExportModal(true) }}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />Export Excel (.xlsx/.csv)
                </Button>
                <Button size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs" onClick={() => { setExportOptions(p => ({ ...p, format: 'pdf' })); setShowExportModal(true) }}>
                  <FileText className="w-3.5 h-3.5 mr-1.5" />Export PDF Report
                </Button>
              </div>
            </div>

            {/* List */}
            {filteredRegs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No registrations matching this filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(filteredRegs) ? filteredRegs : []).map(reg => {
                  const sc = REG_STATUS_CFG[reg.status] ?? REG_STATUS_CFG.pending
                  const StatusIcon = sc.icon
                  return (
                    <div key={reg.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn("w-4 h-4", sc.color)} />
                          <span className="font-semibold text-sm text-slate-800">#{reg.id}</span>
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", sc.bg)}>{reg.status}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(reg.registration_date).toLocaleString()}</span>
                      </div>
                      {reg.registration_data && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                          {Object.entries(reg.registration_data || {}).map(([k, v]) => (
                            <div key={k}>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">{k.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-slate-700 mt-0.5 truncate">{Array.isArray(v) ? v.join(', ') : String(v || '—')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Form Fields Tab ────────────────────────────── */}
        {activeTab === 'form-fields' && (
          <div className="p-5 space-y-6">
            {/* Header & Quick Action Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-[#6CBD45]" />
                  <h2 className="text-lg font-bold">Custom Registration Form Fields</h2>
                  <span className="bg-[#6CBD45]/20 text-[#6CBD45] border border-[#6CBD45]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {formFields.length} {formFields.length === 1 ? 'Field' : 'Fields'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Customize the data collected from attendees when registering for <strong>{event.title}</strong>. Changes persist live in MemoryStore & MySQL.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadTemplates(null, 'replace')}
                  className="bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700 h-9"
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
                  Reset to 5 Defaults
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenAddField}
                  className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white shadow-sm h-9"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Custom Field
                </Button>
              </div>
            </div>

            {/* Quick Template Chips Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#6CBD45]" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pre-set Field Templates</span>
                </div>
                <span className="text-xs text-slate-500">Click a template chip to add it directly to this event form</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Array.isArray(PRESET_TEMPLATES) ? PRESET_TEMPLATES : []).map((tmpl) => {
                  const alreadyExists = formFields.some(f => f.field_name === tmpl.field_name)
                  return (
                    <button
                      key={tmpl.key}
                      onClick={() => handleLoadTemplates(tmpl, 'append')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm",
                        alreadyExists
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-white text-slate-700 border-slate-200 hover:border-[#6CBD45] hover:text-[#6CBD45]"
                      )}
                    >
                      <span className="text-sm">{tmpl.icon}</span>
                      <span className="font-semibold">{tmpl.name}</span>
                      <span className="text-[10px] text-slate-400">({tmpl.field_type})</span>
                      {alreadyExists ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form Fields List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Configured Form Fields</span>
                </h3>
                {formFields.length > 1 && (
                  <span className="text-xs text-slate-400">Use ↑ ↓ buttons to adjust registration step order</span>
                )}
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No form fields configured yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Reset to 5 Defaults" above or add custom fields to build your registration form.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" onClick={() => handleLoadTemplates(null, 'replace')} className="bg-[#6CBD45] text-white">
                      Load 5 Pre-set Templates
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(formFields) ? formFields : []).map((field, idx) => (
                    <div
                      key={field.id ?? idx}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {/* Order badge */}
                        <div className="flex flex-col items-center justify-center bg-slate-100 text-slate-700 font-bold text-xs w-8 h-8 rounded-lg flex-shrink-0 border border-slate-200">
                          #{idx + 1}
                        </div>

                        {/* Field info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-slate-900 truncate">{field.field_label}</h4>
                            <code className="text-[11px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                              {field.field_name}
                            </code>
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                              {field.field_type}
                            </span>
                            {field.required ? (
                              <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                                Optional
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                            {field.placeholder && (
                              <span>Placeholder: <em>"{field.placeholder}"</em></span>
                            )}
                            {Array.isArray(field.field_options) && field.field_options.length > 0 && (
                              <span className="text-slate-600">
                                Options: [{field.field_options.join(', ')}]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, 'up')}
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={idx === formFields.length - 1}
                          onClick={() => handleMoveField(idx, 'down')}
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900"
                          onClick={() => handleOpenEditField(field)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                          onClick={() => handleDeleteFormField(field.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics ────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="p-5 space-y-6">
            {analytics.total === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No registration data yet</p>
              </div>
            ) : (
              <>
                {/* Summary chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">{analytics.confirmed}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Confirmed</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-amber-700">{analytics.pending}</p>
                    <p className="text-[11px] text-amber-600 mt-0.5">Pending</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{analytics.cancelled}</p>
                    <p className="text-[11px] text-red-500 mt-0.5">Cancelled</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800">{analytics.total}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Total</p>
                  </div>
                </div>

                {/* Registration Timeline */}
                {(analytics?.byDate || []).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-slate-400" />Registration Timeline
                    </p>
                    <div className="space-y-2">
                      {(Array.isArray(analytics?.byDate) ? analytics.byDate : []).map(item => {
                        const maxCount = Math.max(...(Array.isArray(analytics?.byDate) ? analytics.byDate : []).map(d => d.count))
                        const w = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                        return (
                          <div key={item.date} className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-24 flex-shrink-0">
                              {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6CBD45] rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${w}%` }}>
                                {w > 20 && <span className="text-[10px] text-white font-bold">{item.count}</span>}
                              </div>
                            </div>
                            {w <= 20 && <span className="text-xs font-semibold text-slate-600 w-6 text-right">{item.count}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Per-field detailed breakdowns */}
                {Object.keys(analytics.fieldStats).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />Registration Breakdown by Field
                    </p>
                    <div className="space-y-5">
                      {Object.entries(analytics.fieldStats || {}).map(([field, stats]) => {
                        const VAL_SIZE = 8
                        const fieldTotal = Object.values(stats).reduce((a, b) => a + b, 0)
                        const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1])
                        const valPage = valuePagesMap[field] ?? 0
                        const totalValPages = Math.ceil(sorted.length / VAL_SIZE)
                        const pageVals = sorted.slice(valPage * VAL_SIZE, (valPage + 1) * VAL_SIZE)
                        const setValPage = (fn) => setValuePagesMap(prev => ({
                          ...prev,
                          [field]: typeof fn === 'function' ? fn(prev[field] ?? 0) : fn
                        }))
                        return (
                          <div key={field} className="border border-slate-200 rounded-xl overflow-hidden">
                            {/* Field header */}
                            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {field.replace(/_/g, ' ')}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] bg-[#6CBD45]/10 text-[#6CBD45] font-semibold px-2 py-0.5 rounded-full">
                                  {fieldTotal} participant{fieldTotal !== 1 ? 's' : ''}
                                </span>
                                {totalValPages > 1 && (
                                  <span className="text-[11px] text-slate-400">
                                    {valPage * VAL_SIZE + 1}–{Math.min((valPage + 1) * VAL_SIZE, sorted.length)} of {sorted.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Value rows */}
                            <div className="divide-y divide-slate-100">
                              {(Array.isArray(pageVals) ? pageVals : []).map(([val, count]) => {
                                const pct = fieldTotal > 0 ? Math.round((count / fieldTotal) * 100) : 0
                                return (
                                  <div key={val} className="px-4 py-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-sm font-medium text-slate-700 truncate max-w-[60%]">{val}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">{pct}%</span>
                                        <span className="text-sm font-bold text-slate-900">{count} student{count !== 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${pct}%`, backgroundColor: pct > 50 ? '#6CBD45' : pct > 25 ? '#5ba83a' : '#94d468' }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {/* Value pagination footer */}
                            {totalValPages > 1 && (
                              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                                <button
                                  onClick={() => setValPage(p => Math.max(0, p - 1))}
                                  disabled={valPage === 0}
                                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                  ‹ Prev
                                </button>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: totalValPages }).map((_, i) => (
                                    <button key={i} onClick={() => setValPage(i)}
                                      className={cn(
                                        'h-1.5 rounded-full transition-all',
                                        i === valPage ? 'bg-[#6CBD45] w-4' : 'bg-slate-300 w-1.5 hover:bg-slate-400'
                                      )}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={() => setValPage(p => Math.min(totalValPages - 1, p + 1))}
                                  disabled={valPage >= totalValPages - 1}
                                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                  Next ›
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Highlights ───────────────────────────────── */}
        {activeTab === 'highlights' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="h-9 bg-[#6CBD45] hover:bg-[#5ba83a] text-white shadow-sm" onClick={() => setShowHighlightModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />Add Highlight
              </Button>
            </div>

            {highlights.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No highlights yet</p>
                <p className="text-xs text-slate-300 mt-0.5">Add highlights to showcase key moments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(highlights) ? highlights : []).map((h, i) => (
                  <div key={h.id ?? i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
                    <div className="relative h-32 bg-slate-100">
                      {h.image_url ? (
                        <Image src={h.image_url} alt={h.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <button
                        onClick={() => h.id && handleDeleteHighlight(h.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-slate-800 truncate">{h.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{h.description}</p>
                      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
                        <span>Order: {h.order_index}</span>
                        {h.created_at && <span>{new Date(h.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings ─────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="p-5 space-y-4">
            {/* Edit event */}
            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">Edit Event Details</p>
                <p className="text-xs text-slate-500 mt-0.5">Update title, date, location, status and more</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />Edit
              </Button>
            </div>

            {/* Form fields quick settings */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />Registration Form Fields ({formFields.length})
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('form-fields')}>
                  Manage Form Fields
                </Button>
              </div>
              <div className="space-y-2">
                {(Array.isArray(formFields) ? formFields : []).map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-700 font-medium">{f.field_label}</span>
                    <div className="flex gap-1">
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded capitalize">{f.field_type}</span>
                      {f.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="border border-red-200 rounded-xl p-4 bg-red-50">
              <p className="font-semibold text-red-800 text-sm mb-1">Danger Zone</p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-sm font-medium text-red-700">Delete Event</p>
                  <p className="text-xs text-red-500">This action cannot be undone. All registrations will be lost.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Event Modal ─────────────────────────────── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Event Title</Label>
              <Input value={editEvent.title} onChange={e => setEditEvent(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={editEvent.category} onValueChange={v => setEditEvent(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(CATEGORIES) ? CATEGORIES : []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={editEvent.status} onValueChange={v => setEditEvent(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={editEvent.date} onChange={e => setEditEvent(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={editEvent.time} onChange={e => setEditEvent(p => ({ ...p, time: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={editEvent.location} onChange={e => setEditEvent(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Attendees</Label>
              <Input type="number" min="1" value={editEvent.max_attendees} onChange={e => setEditEvent(p => ({ ...p, max_attendees: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editEvent.description} rows={3} onChange={e => setEditEvent(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Switch id="feat" checked={editEvent.featured} onCheckedChange={v => setEditEvent(p => ({ ...p, featured: v }))} />
              <Label htmlFor="feat" className="cursor-pointer font-medium">Featured Event</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white" onClick={handleUpdateEvent}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Form Field Modal ───────────────────── */}
      <Dialog open={showFieldModal} onOpenChange={setShowFieldModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Form Field' : 'Add Custom Form Field'}</DialogTitle>
            <DialogDescription>
              Configure the input label, type, requirement, and placeholder text for participant registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="field_label">Field Label *</Label>
              <Input
                id="field_label"
                value={fieldForm.field_label}
                onChange={e => {
                  const label = e.target.value
                  const autoKey = String(label || "").toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
                  setFieldForm(p => ({
                    ...p,
                    field_label: label,
                    ...(!editingField && { field_name: autoKey })
                  }))
                }}
                placeholder="e.g. Department / Branch"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field_name">Field Identifier Key (Database Key) *</Label>
              <Input
                id="field_name"
                value={fieldForm.field_name}
                onChange={e => setFieldForm(p => ({ ...p, field_name: String(e.target.value || "").toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                placeholder="e.g. department"
              />
              <p className="text-[11px] text-slate-400">Unique alphanumeric key used in exported CSV data</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="field_type">Input Type</Label>
                <Select value={fieldForm.field_type} onValueChange={v => setFieldForm(p => ({ ...p, field_type: v }))}>
                  <SelectTrigger id="field_type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (Single Line)</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="textarea">Textarea (Multi-line)</SelectItem>
                    <SelectItem value="select">Dropdown Select</SelectItem>
                    <SelectItem value="radio">Radio Options</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order_index">Display Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  min="1"
                  value={fieldForm.order_index}
                  onChange={e => setFieldForm(p => ({ ...p, order_index: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={fieldForm.placeholder}
                onChange={e => setFieldForm(p => ({ ...p, placeholder: e.target.value }))}
                placeholder="e.g. Enter your department"
              />
            </div>

            {(fieldForm.field_type === 'select' || fieldForm.field_type === 'radio') && (
              <div className="space-y-1.5">
                <Label htmlFor="field_options">Options (Comma separated)</Label>
                <Input
                  id="field_options"
                  value={fieldForm.field_options}
                  onChange={e => setFieldForm(p => ({ ...p, field_options: e.target.value }))}
                  placeholder="e.g. Computer Science, Electrical, Mechanical"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <Label htmlFor="required_switch" className="cursor-pointer font-medium text-slate-800">Required Field</Label>
                <p className="text-[11px] text-slate-400">Attendees must fill out this field to register</p>
              </div>
              <Switch
                id="required_switch"
                checked={fieldForm.required}
                onCheckedChange={v => setFieldForm(p => ({ ...p, required: v }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowFieldModal(false)}>Cancel</Button>
            <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white" onClick={handleSaveField} disabled={savingField}>
              {savingField ? 'Saving...' : editingField ? 'Update Field' : 'Add Field'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Highlight Modal ──────────────────────────── */}
      <Dialog open={showHighlightModal} onOpenChange={setShowHighlightModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Add Highlight</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={newHighlight.title} onChange={e => setNewHighlight(p => ({ ...p, title: e.target.value }))} placeholder="Highlight title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={newHighlight.description} rows={3} onChange={e => setNewHighlight(p => ({ ...p, description: e.target.value }))} placeholder="Highlight description" />
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input type="number" value={newHighlight.order_index} min="0" onChange={e => setNewHighlight(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
                {newHighlight.image_url ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-28 rounded-lg overflow-hidden">
                      <Image src={newHighlight.image_url} alt="preview" fill className="object-cover" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewHighlight(p => ({ ...p, image_url: '' }))}>
                      <X className="w-3 h-3 mr-1" />Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-500">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowHighlightModal(false)}>Cancel</Button>
            <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white" onClick={handleAddHighlight}
              disabled={!newHighlight.title || !newHighlight.description}>
              Add Highlight
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Export Modal ─────────────────────────────────── */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileSpreadsheet className="w-5 h-5 text-[#6CBD45]" />
              Export Attendee List
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Download registered participant details for <strong>{event?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600', border: 'border-emerald-500' },
                  { id: 'csv', label: 'CSV (.csv)', icon: Table, color: 'text-blue-600', border: 'border-blue-500' },
                  { id: 'pdf', label: 'PDF Report', icon: FileText, color: 'text-rose-600', border: 'border-rose-500' }
                ].map(fmt => {
                  const Icon = fmt.icon
                  const active = exportOptions.format === fmt.id
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportOptions(p => ({ ...p, format: fmt.id }))}
                      className={cn(
                        "border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all text-center",
                        active
                          ? `${fmt.border} bg-[#6CBD45]/10 ring-1 ring-[#6CBD45]`
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", fmt.color)} />
                      <span className={cn("text-xs font-bold", active ? "text-[#6CBD45]" : "text-slate-800")}>{fmt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Field Scope Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Fields to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', label: 'Standard Attendee List', desc: 'Name, QU_ID, Email, Phone, Company/Institution' },
                  { id: 'all', label: 'All Form Fields', desc: 'Standard + All Custom Registration Fields' }
                ].map(sc => {
                  const active = exportOptions.fieldScope === sc.id
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setExportOptions(p => ({ ...p, fieldScope: sc.id }))}
                      className={cn(
                        "border rounded-xl p-2.5 text-left transition-all",
                        active
                          ? "border-[#6CBD45] bg-[#6CBD45]/10"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <p className={cn("text-xs font-bold", active ? "text-[#6CBD45]" : "text-slate-800")}>{sc.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{sc.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Registration Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Statuses', count: analytics.total, color: 'text-slate-800' },
                  { id: 'confirmed', label: 'Confirmed Only', count: analytics.confirmed, color: 'text-emerald-700' },
                  { id: 'pending', label: 'Pending Only', count: analytics.pending, color: 'text-amber-700' },
                  { id: 'cancelled', label: 'Cancelled Only', count: analytics.cancelled, color: 'text-red-600' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExportOptions(p => ({ ...p, status: opt.id }))}
                    className={cn(
                      "border rounded-xl p-2.5 text-left transition-all flex items-center justify-between",
                      exportOptions.status === opt.id
                        ? "border-[#6CBD45] bg-[#6CBD45]/10"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <span className={cn("text-xs font-semibold", exportOptions.status === opt.id ? "text-[#6CBD45]" : "text-slate-700")}>{opt.label}</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-full", opt.color)}>{opt.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#6CBD45] shrink-0" />
              <span>
                Ready to export <strong>{exportOptions.status === 'all' ? analytics.total : analytics[exportOptions.status] ?? 0}</strong> attendee record(s) as <strong>.{String(exportOptions.format || "").toUpperCase()}</strong>.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(false)}>Cancel</Button>
            <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold" onClick={handleExportRegistrations} disabled={exporting}>
              <Download className="w-4 h-4 mr-1.5" />
              {exporting ? 'Exporting…' : `Download ${String(exportOptions.format || "").toUpperCase()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}