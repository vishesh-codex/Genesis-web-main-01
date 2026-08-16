// app/admin/dashboard/events/page.jsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Calendar, MapPin, Users, Plus, Edit, Trash2, Clock,
  Upload, X, Settings, QrCode, Download, Search,
  RefreshCw, Star, ChevronRight, UserCheck, Eye,
  CheckCircle, XCircle, AlertCircle, Loader2, Link as LinkIcon, Sparkles,
  FileSpreadsheet, FileText, Printer, Table, Filter
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ImageFile from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// ─── Constants & Helpers ─────────────────────────────────
function getAttendeeDetails(reg) {
  const data = reg.registration_data || {}
  const name = data.full_name || data.name || data.Name || data['Full Name'] || reg.name || reg.user_name || 'N/A'
  const qu_id = data.qu_id || data.QU_ID || data.qu_registration_id || data['QU Registration ID'] || data.student_id || reg.qu_id || 'N/A'
  const email = data.email || data.Email || data['Email Address'] || reg.email || reg.user_email || 'N/A'
  const phone = data.phone || data.Phone || data['Phone Number'] || data.mobile || reg.phone || 'N/A'
  const company = data.organization || data.company_institution || data.company || data.institution || data['Company / Institution'] || data['Company/Institution'] || data['Organization'] || 'N/A'
  
  return { name, qu_id, email, phone, company }
}
function slugify(text, fallbackPrefix = 'event') {
  if (!text || typeof text !== 'string') return `${fallbackPrefix}-${Date.now()}`;
  const slug = String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `${fallbackPrefix}-${Date.now()}`;
}

const INITIAL_FORM = {
  title: '', description: '', date: '', time: '', location: '',
  max_attendees: 0, category: '', image_url: '', featured: false, status: 'upcoming'
}

const STATUS_CONFIG = {
  upcoming: { color: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800/80', dot: 'bg-sky-400', label: 'Upcoming' },
  ongoing: { color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80', dot: 'bg-emerald-400', label: 'Ongoing' },
  completed: { color: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800', dot: 'bg-slate-500', label: 'Completed' },
  cancelled: { color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80', dot: 'bg-rose-400', label: 'Cancelled' },
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' }, { value: 'select', label: 'Select Dropdown' },
  { value: 'radio', label: 'Radio Buttons' }, { value: 'checkbox', label: 'Checkboxes' }, { value: 'file', label: 'File Upload' },
]

const PRESET_FIELDS = [
  { field_name: 'qu_id', field_label: 'QU ID / Student ID', field_type: 'text', required: true, placeholder: 'e.g. QU20261001' },
  { field_name: 'company_institution', field_label: 'Company / Institution', field_type: 'text', required: false, placeholder: 'Company or Institution Name' },
  { field_name: 'full_name', field_label: 'Full Name', field_type: 'text', required: true, placeholder: 'Enter full name' },
  { field_name: 'email', field_label: 'Email Address', field_type: 'email', required: true, placeholder: 'name@example.com' },
  { field_name: 'phone', field_label: 'Phone Number', field_type: 'phone', required: true, placeholder: '+91 98765 43210' }
]

// ─── EventForm (shared create/edit) ───────────────────────
function EventForm({ form, onChange, onSubmit, label, onImageUpload, uploadingImage, isSubmitting }) {
  const [urlInputOpen, setUrlInputOpen] = useState(false)
  const [manualUrl, setManualUrl] = useState('')

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-full">
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Event Title *</Label>
            <Input value={form.title} onChange={e => onChange({ title: e.target.value })} placeholder="e.g. Startup Summit 2025" required className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Category</Label>
            <Input value={form.category} onChange={e => onChange({ category: e.target.value })} placeholder="Workshop, Summit…" className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Status</Label>
            <Select value={form.status} onValueChange={(v) => onChange({ status: v })}>
              <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                  <SelectItem key={v} value={v}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Description *</Label>
            <Textarea value={form.description} onChange={e => onChange({ description: e.target.value })} rows={3} required className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Date *</Label>
            <Input type="date" value={form.date} onChange={e => onChange({ date: e.target.value })} required className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Time *</Label>
            <Input type="time" value={form.time} onChange={e => onChange({ time: e.target.value })} required className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Location *</Label>
            <Input value={form.location} onChange={e => onChange({ location: e.target.value })} placeholder="Venue or online link" required className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-300">Max Attendees</Label>
            <Input type="number" value={form.max_attendees} onChange={e => onChange({ max_attendees: parseInt(e.target.value) || 0 })} min={0} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          {/* Image upload */}
          <div className="col-span-2 space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-mono text-slate-700 dark:text-slate-300 uppercase">Event Image</Label>
              <button type="button" onClick={() => setUrlInputOpen(!urlInputOpen)} className="text-[11px] text-[#6CBD45] hover:underline flex items-center gap-1 font-medium">
                <LinkIcon className="w-3 h-3" /> {urlInputOpen ? 'Upload file' : 'Paste Image URL'}
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/60 hover:border-[#6CBD45]/60 transition-colors">
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <Loader2 className="w-8 h-8 text-[#6CBD45] animate-spin" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Uploading image...</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Please wait while the image is being saved</p>
                </div>
              ) : form.image_url ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    <ImageFile src={form.image_url} alt="preview" fill className="object-cover" />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => onChange({ image_url: '' })} className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full">
                    <X className="w-3 h-3 mr-1 text-rose-500 dark:text-rose-400" /> Remove Image
                  </Button>
                </div>
              ) : urlInputOpen ? (
                <div className="space-y-2">
                  <Input 
                    value={manualUrl} 
                    onChange={e => setManualUrl(e.target.value)} 
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs" 
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { if (manualUrl) { onChange({ image_url: manualUrl }); setUrlInputOpen(false) } }}
                    className="w-full bg-[#6CBD45] text-white text-xs h-8"
                  >
                    Apply URL
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[#6CBD45]/15 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#6CBD45]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Click to upload image</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP up to 10MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onImageUpload(f) }} />
                </label>
              )}
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <Switch id="featured" checked={form.featured} onCheckedChange={v => onChange({ featured: v })} />
            <div>
              <Label htmlFor="featured" className="cursor-pointer font-semibold text-slate-900 dark:text-white">Featured Event</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Show this event prominently on the website</p>
            </div>
          </div>

          {/* ── Registration Form Fields Section inside Create/Edit Modal ── */}
          <div className="col-span-2 border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-2 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#6CBD45]" />
                  Registration Form Fields
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure custom registration form fields for this event</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.form_fields || PRESET_FIELDS;
                    onChange({ form_fields: [...current] });
                  }}
                  className="text-xs h-7 border-[#6CBD45]/40 text-[#6CBD45] hover:bg-[#6CBD45]/10"
                >
                  Load Presets
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newField = {
                      id: Date.now(),
                      field_name: `custom_field_${(form.form_fields?.length || 0) + 1}`,
                      field_label: 'Custom Field',
                      field_type: 'text',
                      required: false,
                      placeholder: 'Enter details'
                    };
                    const fields = form.form_fields || [...PRESET_FIELDS];
                    onChange({ form_fields: [...fields, newField] });
                  }}
                  className="text-xs h-7 bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
                </Button>
              </div>
            </div>

            {/* Quick Preset Add Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(Array.isArray(PRESET_FIELDS) ? PRESET_FIELDS : []).map((preset) => {
                const fields = form.form_fields || [...PRESET_FIELDS];
                const exists = fields.some(f => f.field_name === preset.field_name);
                return (
                  <button
                    key={preset.field_name}
                    type="button"
                    onClick={() => {
                      if (!exists) {
                        onChange({ form_fields: [...fields, { ...preset, id: Date.now() }] });
                      }
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1",
                      exists
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 cursor-default"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#6CBD45] hover:text-[#6CBD45]"
                    )}
                  >
                    <span>{exists ? '✓' : '+'}</span>
                    <span>{preset.field_label}</span>
                  </button>
                );
              })}
            </div>

            {/* Configured Form Fields List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              {((form.form_fields && form.form_fields.length > 0) ? form.form_fields : PRESET_FIELDS).map((field, idx) => (
                <div key={field.id || field.field_name || idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-sm gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-mono text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                    <Input
                      value={field.field_label}
                      onChange={(e) => {
                        const fields = [...((form.form_fields && form.form_fields.length > 0) ? form.form_fields : PRESET_FIELDS)];
                        fields[idx] = { ...fields[idx], field_label: e.target.value, field_name: slugify(e.target.value, 'field') };
                        onChange({ form_fields: fields });
                      }}
                      className="h-7 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                      placeholder="Field Label"
                    />
                    <Select
                      value={field.field_type || 'text'}
                      onValueChange={(val) => {
                        const fields = [...((form.form_fields && form.form_fields.length > 0) ? form.form_fields : PRESET_FIELDS)];
                        fields[idx] = { ...fields[idx], field_type: val };
                        onChange({ form_fields: fields });
                      }}
                    >
                      <SelectTrigger className="h-7 w-28 text-[11px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs">
                        {FIELD_TYPES.map(ft => (
                          <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) => {
                          const fields = [...((form.form_fields && form.form_fields.length > 0) ? form.form_fields : PRESET_FIELDS)];
                          fields[idx] = { ...fields[idx], required: e.target.checked };
                          onChange({ form_fields: fields });
                        }}
                        className="rounded border-slate-300 text-[#6CBD45] focus:ring-[#6CBD45]"
                      />
                      Req
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const fields = [...((form.form_fields && form.form_fields.length > 0) ? form.form_fields : PRESET_FIELDS)];
                        fields.splice(idx, 1);
                        onChange({ form_fields: fields });
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || uploadingImage} className="w-full bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving Event...
          </span>
        ) : label}
      </Button>
    </form>
  )
}

// ─── EventCard ────────────────────────────────────────────
function EventCard({ event, onEdit, onFormFields, onDelete, onGenerateQR, onDownloadPoster, onExport }) {
  const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
  const pct = event.max_attendees > 0 ? Math.min(100, Math.round(event.current_registrations / event.max_attendees * 100)) : 0
  const date = useMemo(() => new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), [event.date])

  return (
    <div className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_35px_-5px_rgba(108,189,69,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-[#6CBD45]/20 via-[#4a9e32]/10 to-transparent overflow-hidden flex-shrink-0">
        {event.image_url ? (
          <ImageFile src={event.image_url} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#6CBD45]/15 border border-[#6CBD45]/30 flex items-center justify-center shadow-inner">
              <Calendar className="w-7 h-7 text-[#6CBD45]" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117]/80 via-[#0f1117]/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-md", cfg.color)}>
            <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", cfg.dot)} />{cfg.label}
          </span>
          {event.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
              <Star className="w-3 h-3 text-amber-500" />Featured
            </span>
          )}
        </div>
        {event.category && (
          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1 bg-slate-950/80 text-white text-xs font-semibold rounded-full backdrop-blur-md border border-white/15 shadow-sm">{event.category}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-3.5">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-lg group-hover:text-[#6CBD45] transition-colors">{event.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">{event.description}</p>
        </div>
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#6CBD45] flex-shrink-0" /><span className="font-medium">{date}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#6CBD45] flex-shrink-0" /><span className="font-medium">{event.time}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#6CBD45] flex-shrink-0" /><span className="truncate font-medium">{event.location}</span></div>
        </div>
        {/* Attendance bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#6CBD45]" />{event.current_registrations}/{event.max_attendees || '∞'} Registrations</span>
            <span className="font-bold text-[#6CBD45]">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-200/80 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
            <div className="h-full bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-green-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(108,189,69,0.4)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-3.5 flex items-center gap-1.5 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md flex-wrap">
        <Link href={event?.id ? `/admin/dashboard/events/${event.id}` : '#'} className="flex-1 min-w-[110px]">
          <Button variant="outline" size="sm" className="w-full text-xs h-9 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm">
            <UserCheck className="w-4 h-4 mr-1.5 text-[#6CBD45]" />View Details
          </Button>
        </Link>
        <Button size="sm" variant="outline" className="h-9 px-2 rounded-xl border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold shadow-xs" onClick={() => event?.id && onExport(event, 'xlsx')} title="Export Excel (.xlsx/.csv)"><FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" />Excel</Button>
        <Button size="sm" variant="outline" className="h-9 px-2 rounded-xl border-rose-300 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold shadow-xs" onClick={() => event?.id && onExport(event, 'pdf')} title="Export PDF Report"><FileText className="w-4 h-4 mr-1 text-rose-600" />PDF</Button>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => event?.id && onEdit(event)} title="Edit"><Edit className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => event?.id && onFormFields(event)} title="Form Fields"><Settings className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => event?.id && onGenerateQR(event)} title="QR Code"><QrCode className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => event?.id && onDownloadPoster(event)} title="Download Poster"><Download className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border-slate-200 dark:border-rose-800 shadow-sm" onClick={() => event?.id && onDelete(event.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}

// ─── Right-side Panel ─────────────────────────────────────
function SidePanel({ open, title, subtitle, onClose, children }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/75 backdrop-blur-2xl z-40 h-full transition-opacity duration-300" onClick={onClose} />}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-slate-800/80 shadow-[0_0_60px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-transform duration-300 ease-in-out text-slate-900 dark:text-slate-100 rounded-l-3xl",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/80 dark:border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  )
}

// ─── Stat card ────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.25)] transition-all group">
    <p className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", color === "text-white" ? "text-slate-900 dark:text-white" : color)}>{value}</p>
    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
  </div>
)

// ─── Main Component ───────────────────────────────────────
export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [formFields, setFormFields] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [qrCodeData, setQRCodeData] = useState(null)

  // Panel / modal visibility
  const [panel, setPanel] = useState('none')
  const [showFormFieldsModal, setShowFormFieldsModal] = useState(false)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [exportModalEvent, setExportModalEvent] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportOptions, setExportOptions] = useState({ format: 'xlsx', status: 'all', fieldScope: 'standard' })
  const [exporting, setExporting] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [fieldSaving, setFieldSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [eventForm, setEventForm] = useState(INITIAL_FORM)
  const [newField, setNewField] = useState({ field_name: '', field_label: '', field_type: 'text', required: false, order_index: 0 })
  const { toast } = useToast()

  const updateForm = useCallback((u) => setEventForm(p => ({ ...p, ...u })), [])

  // ── API: Events ──────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/events/event')
      if (r.ok) {
        const data = await r.json()
        if (Array.isArray(data)) setEvents(data)
      }
    } catch { }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleCreateEvent = useCallback(async (e) => {
    e.preventDefault()
    if (!eventForm.title || !eventForm.title.trim()) {
      toast({ title: "Validation Error", description: "Event title is required", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const r = await fetch('/api/admin/events/event', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(eventForm) 
      })
      const data = await r.json()
      if (!r.ok || (data && data.success === false)) throw new Error(data.error || data.message || "Failed to create event")
      
      const createdSlug = data.slug || (data.event?.slug) || slugify(eventForm.title)
      const nowIso = new Date().toISOString()
      const newEvt = data.event ? {
        ...data.event,
        current_registrations: data.event.current_registrations ?? 0,
        created_at: data.event.created_at || nowIso,
        updated_at: data.event.updated_at || nowIso
      } : {
        id: data.id || Date.now(),
        slug: createdSlug,
        ...eventForm,
        current_registrations: 0,
        created_at: nowIso,
        updated_at: nowIso
      }
      setEvents(prev => [newEvt, ...prev])
      toast({ title: "Event Created", description: "Event has been saved successfully!" })
      setPanel('none')
      setEventForm(INITIAL_FORM)
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to create event", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }, [eventForm, toast])

  const handleEditEvent = useCallback(async (e) => {
    e.preventDefault()
    if (!selectedEvent || !selectedEvent.id || selectedEvent.id === 'undefined') {
      toast({ title: "Error", description: "No valid event selected to update", variant: "destructive" })
      return
    }
    if (!eventForm.title || !eventForm.title.trim()) {
      toast({ title: "Validation Error", description: "Event title is required", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(eventForm) 
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) throw new Error(data.error || data.message || "Failed to update event")
      
      const updatedSlug = data.slug || (data.event?.slug) || slugify(eventForm.title || selectedEvent.title)
      const nowIso = new Date().toISOString()
      const updatedEvt = data.event ? {
        ...data.event,
        current_registrations: selectedEvent.current_registrations ?? 0,
        updated_at: data.event.updated_at || nowIso
      } : {
        ...selectedEvent,
        ...eventForm,
        slug: updatedSlug,
        updated_at: data.updated_at || nowIso
      }

      setEvents(prev => prev.map(evt => String(evt.id) === String(selectedEvent.id) ? { ...evt, ...updatedEvt } : evt))
      toast({ title: "Event Updated", description: "Changes have been saved successfully!" })
      setPanel('none')
      setSelectedEvent(null)
      setEventForm(INITIAL_FORM)
    } catch (err) { 
      toast({ title: "Error", description: err.message || "Failed to update event", variant: "destructive" }) 
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedEvent, eventForm, toast])

  const handleDeleteEvent = useCallback(async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      toast({ title: "Error", description: "Invalid event ID", variant: "destructive" })
      return
    }
    if (!confirm('Delete this event?')) return
    try {
      const r = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data.success === false) throw new Error(data.error || data.message || "Failed to delete event")
      setEvents(prev => prev.filter(evt => String(evt.id) !== String(id) && evt.slug !== id))
      toast({ title: "Event deleted" })
    } catch (err) { toast({ title: "Error", description: err.message || "Failed to delete event", variant: "destructive" }) }
  }, [toast])

  const handleImageUpload = useCallback(async (file) => {
    setUploadingImage(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/admin/events/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.url) {
        updateForm({ image_url: d.url })
        toast({ title: "Image Uploaded", description: "Event image is ready!" })
      } else throw new Error()
    } catch { 
      toast({ title: "Upload Failed", description: "Using image link option", variant: "destructive" }) 
    } finally {
      setUploadingImage(false)
    }
  }, [updateForm, toast])

  // ── API: Form fields ─────────────────────────────────────
  const fetchFormFields = useCallback(async (eventId) => {
    try {
      const r = await fetch(`/api/admin/events/${eventId}/form-fields`)
      if (r.ok) {
        const data = await r.json()
        setFormFields(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Fetch form fields error:", err)
    }
  }, [])

  const handleLoadPresets = useCallback(async (mode = 'replace') => {
    if (!selectedEvent?.id) return
    const eventId = selectedEvent.id

    // Instant optimistic UI update
    const formattedPresets = PRESET_FIELDS.map((p, idx) => ({
      id: Date.now() + idx,
      event_id: eventId,
      ...p,
      order_index: idx + 1
    }))

    if (mode === 'replace') {
      setFormFields(formattedPresets)
    } else {
      setFormFields(prev => [...prev, ...formattedPresets])
    }
    toast({ title: "Presets Loaded", description: "Loaded standard preset fields (QU_ID, Company/Institution, Name, Email, Phone)" })

    try {
      const r = await fetch(`/api/admin/events/${eventId}/form-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load_templates', fields: PRESET_FIELDS, mode })
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok && data.fields) {
        setFormFields(data.fields)
      }
    } catch (err) {
      console.warn("Load presets DB fallback:", err)
    }
  }, [selectedEvent, toast])

  const handleAddPresetField = useCallback(async (preset) => {
    if (!selectedEvent?.id) return
    const eventId = selectedEvent.id

    if (formFields.some(f => f.field_name === preset.field_name)) {
      toast({ title: "Field Already Present", description: `"${preset.field_label}" is already included in your form.` })
      return
    }

    const tempId = Date.now()
    const newFieldObj = {
      id: tempId,
      event_id: eventId,
      ...preset,
      order_index: formFields.length + 1
    }

    // Instant optimistic UI feedback
    setFormFields(prev => [...prev, newFieldObj])
    toast({ title: "Field Added", description: `Added "${preset.field_label}" preset field.` })

    try {
      const r = await fetch(`/api/admin/events/${eventId}/form-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFieldObj)
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok && (data.id || data.field?.id)) {
        const realId = data.id || data.field.id
        setFormFields(prev => prev.map(f => f.id === tempId ? { ...f, id: realId } : f))
      }
    } catch (err) {
      console.warn("Add preset field fallback:", err)
    }
  }, [selectedEvent, formFields, toast])

  const handleAddFormField = useCallback(async () => {
    if (!selectedEvent?.id) return
    if (!newField.field_label || !newField.field_label.trim()) {
      toast({ title: "Validation Error", description: "Field label is required", variant: "destructive" })
      return
    }

    const fieldName = newField.field_name || String(newField.field_label || "").toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
    const tempId = Date.now()
    const payload = {
      ...newField,
      field_name: fieldName,
      order_index: formFields.length + 1
    }

    const optimisticObj = { id: tempId, event_id: selectedEvent.id, ...payload }

    // Instant optimistic UI feedback
    setFormFields(prev => [...prev, optimisticObj])
    setNewField({ field_name: '', field_label: '', field_type: 'text', required: false, placeholder: '', order_index: 0 })
    toast({ title: "Field Added", description: `Field "${payload.field_label}" added successfully!` })

    try {
      const r = await fetch(`/api/admin/events/${selectedEvent.id}/form-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok && (data.id || data.field?.id)) {
        const realId = data.id || data.field.id
        setFormFields(prev => prev.map(f => f.id === tempId ? { ...f, id: realId } : f))
      }
    } catch (err) {
      console.warn("Add form field fallback:", err)
    }
  }, [selectedEvent, newField, formFields.length, toast])

  const handleUpdateFormField = useCallback(async (field) => {
    if (!field || !field.id) return
    setFieldSaving(true)

    // Instant optimistic UI update
    setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, ...field } : f))
    setEditingField(null)
    toast({ title: "Field Updated", description: `Updated "${field.field_label}" field.` })

    try {
      const r = await fetch(`/api/admin/events/form-fields/${field.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field)
      })
      if (!r.ok && selectedEvent) {
        fetchFormFields(selectedEvent.id)
      }
    } catch (err) {
      console.warn("Update form field fallback:", err)
    } finally {
      setFieldSaving(false)
    }
  }, [selectedEvent, fetchFormFields, toast])

  const handleDeleteFormField = useCallback(async (fieldId) => {
    if (!fieldId) return

    // Instant optimistic UI update (removal with trash feedback)
    const target = formFields.find(f => f.id === fieldId)
    setFormFields(prev => prev.filter(f => f.id !== fieldId))
    toast({ title: "Field Removed", description: target ? `Removed "${target.field_label}" field.` : "Field deleted." })

    try {
      const r = await fetch(`/api/admin/events/form-fields/${fieldId}`, { method: 'DELETE' })
      if (!r.ok && selectedEvent) {
        fetchFormFields(selectedEvent.id)
      }
    } catch (err) {
      console.warn("Delete form field fallback:", err)
    }
  }, [formFields, selectedEvent, fetchFormFields, toast])

  // ── API: Registrations ───────────────────────────────────
  const fetchRegistrations = useCallback(async (eventId) => {
    setRegistrationsLoading(true)
    try {
      const r = await fetch(`/api/admin/events/${eventId}/participants`)
      if (r.ok) {
        const d = await r.json()
        setRegistrations(Array.isArray(d) ? d : (d.registrations ?? []))
      } else throw new Error()
    } catch { setRegistrations([]); toast({ title: "Error", description: "Failed to fetch registrations", variant: "destructive" }) }
    finally { setRegistrationsLoading(false) }
  }, [toast])

  const handleUpdateRegistrationStatus = useCallback(async (regId, status) => {
    if (!selectedEvent) return
    try {
      const r = await fetch(`/api/admin/events/${selectedEvent.id}/participants`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registrationId: regId, status }) })
      if (r.ok) { toast({ title: "Status updated" }); fetchRegistrations(selectedEvent.id) }
      else throw new Error()
    } catch { toast({ title: "Error", description: "Failed to update status", variant: "destructive" }) }
  }, [selectedEvent, toast, fetchRegistrations])

  const handleDeleteRegistration = useCallback(async (regId) => {
    if (!selectedEvent || !confirm('Delete this registration?')) return
    try {
      const r = await fetch(`/api/admin/events/${selectedEvent.id}/participants`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registrationId: regId }) })
      if (r.ok) { toast({ title: "Registration deleted" }); fetchRegistrations(selectedEvent.id) }
      else throw new Error()
    } catch { toast({ title: "Error", description: "Failed to delete registration", variant: "destructive" }) }
  }, [selectedEvent, toast, fetchRegistrations])

  const handleOpenExportModal = useCallback(async (evt, format = 'xlsx') => {
    setSelectedEvent(evt)
    setExportModalEvent(evt)
    setExportOptions(p => ({ ...p, format }))
    setShowExportModal(true)
    if (evt?.id) {
      fetchRegistrations(evt.id)
    }
  }, [fetchRegistrations])

  const handleRunExport = useCallback(async () => {
    if (!exportModalEvent) return
    setExporting(true)
    try {
      let currentRegs = registrations
      if (!currentRegs || currentRegs.length === 0 || selectedEvent?.id !== exportModalEvent.id) {
        const r = await fetch(`/api/admin/events/${exportModalEvent.id}/participants`)
        if (r.ok) {
          const d = await r.json()
          currentRegs = Array.isArray(d) ? d : (d.registrations ?? [])
        }
      }

      const regs = exportOptions.status === 'all'
        ? (currentRegs || [])
        : (Array.isArray(currentRegs) ? currentRegs : []).filter(r => r.status === exportOptions.status)

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

      const titleClean = (exportModalEvent.title || `Event_${exportModalEvent.id}`).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
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
  <title>Attendee Report — ${exportModalEvent.title || 'Event'}</title>
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
      <h1 class="title">${exportModalEvent.title || 'Event'} — Attendee Report</h1>
      <p class="sub-meta">Generated: ${new Date().toLocaleString('en-IN')} | Category: ${exportModalEvent.category || 'General'} | Status Filter: ${String(exportOptions.status || "").toUpperCase()}</p>
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
  }, [exportModalEvent, registrations, selectedEvent, exportOptions, toast])

  // ── API: QR & Poster ─────────────────────────────────────
  const handleGenerateQR = useCallback(async (event) => {
    try {
      const r = await fetch(`/api/admin/events/${event.id}/qr-code`)
      if (r.ok) { const d = await r.json(); setQRCodeData(d); setSelectedEvent(event); setShowQRModal(true) }
      else throw new Error()
    } catch { toast({ title: "Error", description: "Failed to generate QR code", variant: "destructive" }) }
  }, [toast])

  const handleDownloadPoster = useCallback(async (event) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}/poster`)
      if (!response.ok) throw new Error('Failed to generate poster')
      const data = await response.json()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = 1240; canvas.height = 1754
      const loadImage = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src })
      const wrapText = (c, text, maxWidth) => {
        const words = text.split(' '); const lines = []; let cur = words[0]
        for (let i = 1; i < words.length; i++) { const w = words[i]; if (c.measureText(cur + ' ' + w).width < maxWidth) { cur += ' ' + w } else { lines.push(cur); cur = w } }
        lines.push(cur); return lines
      }
      const grad = (x1, y1, x2, y2, c1, c2) => { const g = ctx.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, c1); g.addColorStop(1, c2); return g }
      ctx.fillStyle = grad(0, 0, 0, canvas.height, '#FFFFFF', '#F8FAFC'); ctx.fillRect(0, 0, canvas.width, canvas.height)
      let y = 0; const hw = 500
      if (event.image_url) {
        try { const img = await loadImage(event.image_url); ctx.drawImage(img, 0, y, canvas.width, hw); ctx.fillStyle = grad(0, y, 0, y + hw, 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)'); ctx.fillRect(0, y, canvas.width, hw) }
        catch { ctx.fillStyle = grad(0, y, 0, y + hw, '#6CBD45', '#4F9A2E'); ctx.fillRect(0, y, canvas.width, hw) }
      } else { ctx.fillStyle = grad(0, y, 0, y + hw, '#6CBD45', '#4F9A2E'); ctx.fillRect(0, y, canvas.width, hw) }
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 58px Arial'; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8
      const tl = wrapText(ctx, event.title, canvas.width - 100); const ty = y + hw / 2 - (tl.length * 35)
      tl.forEach((l, i) => ctx.fillText(l, canvas.width / 2, ty + i * 70)); ctx.shadowBlur = 0; y += hw + 40
      const cp = 40, cw = canvas.width - cp * 2, ch = 280
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cp, y, cw, ch); ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1; ctx.strokeRect(cp, y, cw, ch)
      ctx.fillStyle = grad(cp, y, cp + cw, y, '#6CBD45', '#5BA83A'); ctx.fillRect(cp, y, cw, 60)
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText('EVENT DETAILS', canvas.width / 2, y + 42)
      const details = [{ icon: '📅', label: 'Date', value: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }, { icon: '⏰', label: 'Time', value: event.time }, { icon: '📍', label: 'Location', value: event.location }]
      details.forEach((item, idx) => { const iy = y + 100 + idx * 50; ctx.fillStyle = '#1F2937'; ctx.font = '26px Arial'; ctx.textAlign = 'left'; ctx.fillText(item.icon + ' ' + item.label + ': ' + item.value, cp + 30, iy) })
      y += ch + 50
      const qrImg = await loadImage(data.qrCode); const qs = 280; const qx = (canvas.width - qs) / 2; const qy = y + 120
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(qx - 20, qy - 20, qs + 40, qs + 40); ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2; ctx.strokeRect(qx - 20, qy - 20, qs + 40, qs + 40)
      ctx.drawImage(qrImg, qx, qy, qs, qs)
      const fy = canvas.height - 80; ctx.fillStyle = grad(0, fy, 0, canvas.height, '#1F2937', '#111827'); ctx.fillRect(0, fy, canvas.width, 80)
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText('Powered by Genesis Events', canvas.width / 2, fy + 50)
      canvas.toBlob(blob => { if (blob) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `${event.slug}-poster.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); toast({ title: "Poster downloaded" }) } }, 'image/png', 0.9)
    } catch { toast({ title: "Error", description: "Failed to download poster", variant: "destructive" }) }
  }, [toast])

  // ── Derived data ─────────────────────────────────────────
  const filtered = useMemo(() => (Array.isArray(events) ? events : []).filter(e => {
    const q = String(search || "").toLowerCase()
    const matchSearch = !q || String(e.title || "").toLowerCase().includes(q) || String(e.location || "").toLowerCase().includes(q) || String(e.category || "").toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  }), [events, search, statusFilter])

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: (Array.isArray(events) ? events : []).filter(e => e.status === "upcoming").length,
    ongoing: (Array.isArray(events) ? events : []).filter(e => e.status === "ongoing").length,
    registrations: events.reduce((a, e) => a + e.current_registrations, 0),
  }), [events])

  // ── Handlers for opening panel/modals ────────────────────
  const openCreate = useCallback(() => { setEventForm(INITIAL_FORM); setSelectedEvent(null); setPanel('create') }, [])
  const openEdit = useCallback((e) => { setSelectedEvent(e); setEventForm({ title: e.title, description: e.description, date: e.date, time: e.time, location: e.location, max_attendees: e.max_attendees, category: e.category, image_url: e.image_url || '', featured: e.featured, status: e.status }); setPanel('edit') }, [])
  const openFormFields = useCallback((e) => { setSelectedEvent(e); fetchFormFields(e.id); setEditingField(null); setShowFormFieldsModal(true) }, [fetchFormFields])
  const openRegistrations = useCallback((e) => { setSelectedEvent(e); fetchRegistrations(e.id); setShowRegistrationsModal(true) }, [fetchRegistrations])

  const REG_STATUS_ICONS = { confirmed: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, cancelled: <XCircle className="w-3.5 h-3.5 text-red-500" />, pending: <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Events</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Create, manage and track your events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchEvents} className="h-9 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"><RefreshCw className="w-4 h-4 text-[#6CBD45]" /></Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold h-9 shadow-md shadow-[#6CBD45]/20">
            <Plus className="w-4 h-4 mr-1.5" />New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={stats.total} color="text-white" />
        <StatCard label="Upcoming" value={stats.upcoming} color="text-sky-600 dark:text-sky-400" />
        <StatCard label="Ongoing" value={stats.ongoing} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Total Registrations" value={stats.registrations} color="text-[#6CBD45]" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3.5 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all",
                statusFilter === s ? "bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] text-white border-[#6CBD45] shadow-md shadow-[#6CBD45]/20" : "bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#6CBD45]/50 hover:text-slate-900 dark:hover:text-white"
              )}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#141824]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
              <Skeleton className="h-36 w-full rounded-none bg-slate-200 dark:bg-slate-800" />
              <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800" /><Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-800" /><Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="font-medium text-slate-900 dark:text-white">No events found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first event to get started'}</p>
          {!search && statusFilter === 'all' && <Button onClick={openCreate} className="mt-4 bg-[#6CBD45] hover:bg-[#5ba83a] text-white"><Plus className="w-4 h-4 mr-1.5" />Create Event</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {(Array.isArray(filtered) ? filtered : []).map(event => (
            <EventCard key={event.id} event={event}
              onEdit={openEdit} onFormFields={openFormFields}
              onDelete={handleDeleteEvent} onGenerateQR={handleGenerateQR} onDownloadPoster={handleDownloadPoster}
              onExport={handleOpenExportModal}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Side Panel ─────────────────────── */}
      <SidePanel open={panel !== 'none'} onClose={() => setPanel('none')}
        title={panel === 'create' ? 'New Event' : 'Edit Event'}
        subtitle={panel === 'edit' ? selectedEvent?.title : undefined}>
        <EventForm form={eventForm} onChange={updateForm}
          onSubmit={panel === 'create' ? handleCreateEvent : handleEditEvent}
          label={panel === 'create' ? 'Create Event' : 'Update Event'}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          isSubmitting={isSubmitting}
        />
      </SidePanel>

      {/* ── Manage Form Fields Interactive Modal Dialog ───────── */}
      <Dialog open={showFormFieldsModal} onOpenChange={setShowFormFieldsModal}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6CBD45]/15 border border-[#6CBD45]/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Settings className="w-5 h-5 text-[#6CBD45]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Manage Form Fields
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure registration fields for <span className="font-semibold text-[#6CBD45]">{selectedEvent?.title || 'Event'}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* ── Presets Section ── */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6CBD45]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Load Presets</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadPresets('replace')}
                  className="h-8 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#6CBD45] hover:bg-[#6CBD45]/10 hover:border-[#6CBD45] shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Load All Standard Presets
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click a preset below to instantly append it to your registration form:</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(PRESET_FIELDS) ? PRESET_FIELDS : []).map((preset) => {
                  const isAdded = formFields.some(f => f.field_name === preset.field_name)
                  return (
                    <button
                      key={preset.field_name}
                      type="button"
                      onClick={() => handleAddPresetField(preset)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-2xs",
                        isAdded
                          ? "bg-slate-200/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#6CBD45]"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-[#6CBD45] hover:bg-[#6CBD45]/10"
                      )}
                    >
                      <Plus className="w-3 h-3 text-[#6CBD45]" />
                      <span>{preset.field_label}</span>
                      {isAdded && <span className="text-[10px] bg-[#6CBD45]/20 text-[#6CBD45] px-1.5 py-0.2 rounded-md font-bold">Added</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Form Fields List ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Configured Form Fields
                  <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded-full font-bold">
                    {formFields.length}
                  </Badge>
                </p>
                {editingField && (
                  <button onClick={() => setEditingField(null)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium">
                    <X className="w-3.5 h-3.5 text-rose-500" /> Cancel edit
                  </button>
                )}
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
                  <Settings className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No form fields configured yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Load presets above (QU_ID, Company/Institution, Name, Email, Phone) or add a custom field below.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(Array.isArray(formFields) ? formFields : []).map((f, idx) => (
                    <div key={f.id || `field-${idx}`}
                      className={cn(
                        "rounded-2xl border p-4 transition-all duration-200 shadow-xs",
                        editingField?.id === f.id
                          ? "border-[#6CBD45] bg-[#6CBD45]/10 dark:bg-[#6CBD45]/15 ring-1 ring-[#6CBD45]"
                          : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-md px-2 py-0.5 font-mono">#{idx + 1}</span>
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{f.field_label}</p>
                            {f.required ? (
                              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-full font-semibold">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-normal">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-slate-600 dark:text-slate-400 capitalize font-medium">{f.field_type}</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <code className="text-xs bg-slate-200/70 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-mono">
                              {f.field_name}
                            </code>
                            {f.placeholder && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 italic truncate max-w-[200px]">
                                "{f.placeholder}"
                              </span>
                            )}
                          </div>
                          {f.field_options && f.field_options.length > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                              Options: <span className="font-medium text-slate-700 dark:text-slate-300">{f.field_options.join(', ')}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingField(editingField?.id === f.id ? null : { ...f })}
                            className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors border shadow-2xs",
                              editingField?.id === f.id
                                ? "bg-[#6CBD45] border-[#6CBD45] text-white"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#6CBD45]/15 hover:text-[#6CBD45] hover:border-[#6CBD45]/40"
                            )}
                            title="Edit Field"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => f.id && handleDeleteFormField(f.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800 transition-colors shadow-2xs"
                            title="Remove Field (Trash)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Edit Form */}
                      {editingField?.id === f.id && (
                        <div className="mt-4 pt-4 border-t border-[#6CBD45]/30 space-y-3.5 text-slate-900 dark:text-slate-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Field Name (Key)</Label>
                              <Input
                                className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                                value={editingField?.field_name || ''}
                                onChange={e => setEditingField(p => p ? { ...p, field_name: String(e.target.value || "").toLowerCase().replace(/\s+/g, '_') } : p)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Label</Label>
                              <Input
                                className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                value={editingField?.field_label || ''}
                                onChange={e => setEditingField(p => p ? { ...p, field_label: e.target.value } : p)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Type</Label>
                              <Select value={editingField?.field_type ?? 'text'} onValueChange={(v) => setEditingField(p => p ? { ...p, field_type: v } : p)}>
                                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">{(Array.isArray(FIELD_TYPES) ? FIELD_TYPES : []).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Placeholder</Label>
                              <Input
                                className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                value={editingField?.placeholder || ''}
                                onChange={e => setEditingField(p => p ? { ...p, placeholder: e.target.value } : p)}
                              />
                            </div>
                          </div>
                          {['select', 'radio', 'checkbox'].includes(editingField?.field_type || '') && (
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Options (comma-separated)</Label>
                              <Textarea
                                rows={2} className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                defaultValue={editingField?.field_options?.join(', ')}
                                onChange={e => setEditingField(p => p ? { ...p, field_options: String(e.target.value || "").split(",").map(o => o.trim()).filter(Boolean) } : p)}
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingField?.required}
                              onCheckedChange={v => setEditingField(p => p ? { ...p, required: v } : p)}
                            />
                            <Label className="text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">Mandatory / Required Field</Label>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setEditingField(null)}>Cancel</Button>
                            <Button
                              size="sm" className="flex-1 h-8 text-xs bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold"
                              disabled={fieldSaving}
                              onClick={() => handleUpdateFormField(editingField)}
                            >
                              {fieldSaving ? 'Saving…' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Add Custom Field ── */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6CBD45]" /> Add Custom Field
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Label *</Label>
                    <Input
                      className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                      value={newField.field_label}
                      onChange={e => {
                        const label = e.target.value
                        const name = String(label || "").toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
                        setNewField(p => ({ ...p, field_label: label, field_name: p.field_name ? p.field_name : name }))
                      }}
                      placeholder="e.g. Graduation Year"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Key (Name)</Label>
                    <Input
                      className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
                      value={newField.field_name}
                      onChange={e => setNewField(p => ({ ...p, field_name: String(e.target.value || "").toLowerCase().replace(/\s+/g, '_') }))}
                      placeholder="e.g. graduation_year"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Input Type</Label>
                    <Select value={newField.field_type} onValueChange={(v) => setNewField(p => ({ ...p, field_type: v }))}>
                      <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">{(Array.isArray(FIELD_TYPES) ? FIELD_TYPES : []).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Placeholder Text</Label>
                    <Input
                      className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                      value={newField.placeholder || ''}
                      onChange={e => setNewField(p => ({ ...p, placeholder: e.target.value }))}
                      placeholder="e.g. 2025"
                    />
                  </div>
                  {['select', 'radio', 'checkbox'].includes(newField.field_type) && (
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Options (comma-separated)</Label>
                      <Textarea
                        rows={2}
                        className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="Option 1, Option 2, Option 3"
                        onChange={e => setNewField(p => ({ ...p, field_options: String(e.target.value || "").split(",").map(o => o.trim()).filter(Boolean) }))}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Switch id="modal-new-req" checked={newField.required} onCheckedChange={v => setNewField(p => ({ ...p, required: v }))} />
                  <Label htmlFor="modal-new-req" className="text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">Required field</Label>
                </div>
                <Button onClick={handleAddFormField} className="w-full bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold h-9 shadow-md shadow-[#6CBD45]/20">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Field
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Registrations Modal ──────────────────────────── */}
      <Dialog open={showRegistrationsModal} onOpenChange={setShowRegistrationsModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Registrations — {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs" onClick={() => handleOpenExportModal(selectedEvent, 'xlsx')}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />Export Excel (.xlsx/.csv)
                </Button>
                <Button size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs" onClick={() => handleOpenExportModal(selectedEvent, 'pdf')}>
                  <FileText className="w-3.5 h-3.5 mr-1.5" />Export PDF Report
                </Button>
              </div>
            </div>
            {registrationsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">No registrations yet for this event.</div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(registrations) ? registrations : []).map(reg => (
                  <div key={reg.id} className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {REG_STATUS_ICONS[reg.status]}
                        <span className="font-medium text-sm text-slate-900 dark:text-white">#{reg.id}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(reg.registration_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={reg.status} onValueChange={(v) => handleUpdateRegistrationStatus(reg.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-28 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300" onClick={() => handleDeleteRegistration(reg.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    {reg.registration_data && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {Object.entries(reg.registration_data || {}).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">{k.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{Array.isArray(v) ? v.join(', ') : String(v || '—')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── QR Modal ─────────────────────────────────────── */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-[420px] bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader><DialogTitle className="text-slate-900 dark:text-white">Event QR Code</DialogTitle></DialogHeader>
          {qrCodeData && (
            <div className="space-y-4 text-center">
              <p className="font-semibold text-slate-900 dark:text-white">{qrCodeData.eventTitle}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Scan to check in participants</p>
              <div className="bg-white p-4 rounded-2xl inline-block border border-slate-200 dark:border-slate-800 mx-auto shadow-md">
                <img src={qrCodeData.qrCode} alt="QR Code" className="w-56 h-56 mx-auto" />
              </div>
              <div className="flex gap-2">
                <input value={qrCodeData.checkInUrl} readOnly className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300" />
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => { navigator.clipboard.writeText(qrCodeData.checkInUrl); toast({ title: "Copied!" }) }}>Copy</Button>
              </div>
              <Button className="w-full bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold shadow-md shadow-[#6CBD45]/20" onClick={() => { const a = document.createElement('a'); a.href = qrCodeData.qrCode; a.download = `${selectedEvent?.slug}-qr.png`; a.click() }}>
                <Download className="w-4 h-4 mr-1.5" />Download QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Export Modal ─────────────────────────────────── */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <FileSpreadsheet className="w-5 h-5 text-[#6CBD45]" />
              Export Attendee List
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Download registered participant details for <strong>{exportModalEvent?.title || 'Selected Event'}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
                  { id: 'csv', label: 'CSV (.csv)', icon: Table, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
                  { id: 'pdf', label: 'PDF Report', icon: FileText, color: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500' }
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
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", fmt.color)} />
                      <span className={cn("text-xs font-bold", active ? "text-[#6CBD45]" : "text-slate-800 dark:text-slate-200")}>{fmt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Field Scope Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Fields to Include</Label>
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
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                      )}
                    >
                      <p className={cn("text-xs font-bold", active ? "text-[#6CBD45]" : "text-slate-800 dark:text-slate-200")}>{sc.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{sc.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Registration Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Statuses', color: 'text-slate-800 dark:text-slate-200' },
                  { id: 'confirmed', label: 'Confirmed Only', color: 'text-emerald-700 dark:text-emerald-400' },
                  { id: 'pending', label: 'Pending Only', color: 'text-amber-700 dark:text-amber-400' },
                  { id: 'cancelled', label: 'Cancelled Only', color: 'text-rose-600 dark:text-rose-400' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExportOptions(p => ({ ...p, status: opt.id }))}
                    className={cn(
                      "border rounded-xl p-2.5 text-left transition-all flex items-center justify-between",
                      exportOptions.status === opt.id
                        ? "border-[#6CBD45] bg-[#6CBD45]/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                    )}
                  >
                    <span className={cn("text-xs font-semibold", exportOptions.status === opt.id ? "text-[#6CBD45]" : "text-slate-700 dark:text-slate-300")}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#6CBD45] shrink-0" />
              <span>
                Ready to export attendee records for <strong>{exportModalEvent?.title || 'Event'}</strong> as <strong>.{String(exportOptions.format || "").toUpperCase()}</strong>.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">Cancel</Button>
            <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold" onClick={handleRunExport} disabled={exporting}>
              <Download className="w-4 h-4 mr-1.5" />
              {exporting ? 'Exporting…' : `Download ${String(exportOptions.format || "").toUpperCase()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}