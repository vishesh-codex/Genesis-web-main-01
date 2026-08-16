"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Search, Plus, Building, Users, DollarSign, Star, Eye, Edit,
  Globe, Mail, TrendingUp, Filter, Trash2, Upload, X, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const stageConfig = {
  "Pre-Incubation": "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800/80",
  "Incubation": "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-800/80",
  "Acceleration": "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80",
  "Graduated": "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/80",
}

const statusConfig = {
  active: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80",
  featured: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/80",
  on_hold: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80",
}

export default function StartupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    founder: '',
    email: '',
    phone: '+91 98765 43210',
    category: 'Pre-Incubation',
    description: '',
    image_url: '',
    status: 'active',
    funding: 'Seed',
    valuation: 'N/A',
    employees: 5,
    link: '',
    date: new Date().toISOString().split('T')[0]
  })

  const { toast } = useToast()

  const fetchStartups = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/portfolio/portfolio')
      if (!res.ok) throw new Error("Failed to fetch startups")
      const data = await res.json()
      if (Array.isArray(data)) {
        setStartups(data.map(item => ({
          id: item.id || Date.now(),
          name: item.title || item.name || "Untitled Startup",
          founder: item.founder || item.author || "Incubated Founder",
          email: item.email || "contact@startup.com",
          phone: item.phone || "+91 98765 43210",
          category: item.category || "General",
          stage: item.category || "Pre-Incubation",
          description: item.description || "No description provided.",
          image_url: item.image_url || "",
          emoji: item.emoji || "🚀",
          status: (item.status || "active").toLowerCase(),
          funding: item.funding || "Seed",
          valuation: item.valuation || "N/A",
          employees: item.employees || 5,
          website: item.link || item.website || "#",
          date: item.date || new Date().toISOString()
        })))
      }
    } catch (err) {
      console.error("Fetch startups error:", err)
      toast({ title: "Error", description: "Failed to load startups portfolio", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStartups()
  }, [fetchStartups])

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set()
    startups.forEach(item => {
      if (item.category) categories.add(item.category)
    })
    return Array.from(categories)
  }, [startups])

  const filtered = useMemo(() => {
    return startups.filter(s => {
      const matchSearch =
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.founder || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === "all" || s.status === statusFilter.toLowerCase()
      const matchCategory = categoryFilter === "all" || s.category === categoryFilter

      return matchSearch && matchStatus && matchCategory
    })
  }, [startups, searchTerm, statusFilter, categoryFilter])

  const stats = useMemo(() => [
    { label: "Active Startups", value: startups.filter(s => s.status === "active" || s.status === "featured").length, icon: Building, color: "bg-[#6CBD45]/15 text-[#6CBD45]" },
    { label: "Total Incubated", value: startups.length, icon: TrendingUp, color: "bg-[#6CBD45]/15 text-[#6CBD45]" },
    { label: "Total Jobs Created", value: startups.reduce((acc, s) => acc + (parseInt(s.employees) || 5), 0), icon: Users, color: "bg-[#6CBD45]/15 text-[#6CBD45]" },
    { label: "Featured Startups", value: startups.filter(s => s.status === "featured").length, icon: Star, color: "bg-[#6CBD45]/15 text-[#6CBD45]" },
  ], [startups])

  const openAddModal = () => {
    setForm({
      title: '',
      founder: '',
      email: '',
      phone: '+91 98765 43210',
      category: 'Pre-Incubation',
      description: '',
      image_url: '',
      status: 'active',
      funding: 'Seed',
      valuation: 'N/A',
      employees: 5,
      link: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsEdit(false)
    setSelectedId(null)
    setShowModal(true)
  }

  const openEditModal = (startup) => {
    setForm({
      title: startup.name || '',
      founder: startup.founder || '',
      email: startup.email || '',
      phone: startup.phone || '+91 98765 43210',
      category: startup.category || 'Pre-Incubation',
      description: startup.description || '',
      image_url: startup.image_url || '',
      status: startup.status || 'active',
      funding: startup.funding || 'Seed',
      valuation: startup.valuation || 'N/A',
      employees: startup.employees || 5,
      link: startup.website || '',
      date: startup.date ? new Date(startup.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setIsEdit(true)
    setSelectedId(startup.id)
    setShowModal(true)
  }

  const handleImageUpload = async (file) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/events/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: "Image Uploaded", description: "Image set successfully" })
        return data.url
      } else {
        toast({ title: "Upload Failed", description: "Failed to upload image", variant: "destructive" })
        return null
      }
    } catch {
      toast({ title: "Upload Error", description: "An error occurred during upload", variant: "destructive" })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) {
      toast({ title: "Validation Error", description: "Please fill in startup name and description", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const tempId = isEdit ? selectedId : Date.now()

    const newStartupObj = {
      id: tempId,
      name: form.title,
      founder: form.founder || "Incubated Founder",
      email: form.email || "contact@startup.com",
      phone: form.phone || "+91 98765 43210",
      category: form.category || "Pre-Incubation",
      stage: form.category || "Pre-Incubation",
      description: form.description,
      image_url: form.image_url,
      status: form.status.toLowerCase(),
      funding: form.funding || "Seed",
      valuation: form.valuation || "N/A",
      employees: parseInt(form.employees) || 5,
      website: form.link || "#",
      date: form.date
    }

    // Optimistic UI update
    if (isEdit) {
      setStartups(prev => prev.map(s => s.id === selectedId ? newStartupObj : s))
    } else {
      setStartups(prev => [newStartupObj, ...prev])
    }

    setShowModal(false)
    toast({ title: isEdit ? "Startup Updated" : "Startup Created", description: `${form.title} saved to portfolio` })

    try {
      const url = isEdit ? `/api/admin/portfolio/${selectedId}` : '/api/admin/portfolio/create'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) throw new Error(data.error || data.message || "Operation failed")

      if (!isEdit && data.id) {
        setStartups(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s))
      }
    } catch (err) {
      console.error("Submit startup error:", err)
      toast({ title: "Sync Warning", description: "Saved locally, but server sync encountered an issue" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!confirm('Are you sure you want to remove this startup?')) return

    const previousStartups = [...startups]
    setStartups(prev => prev.filter(s => s.id !== id))
    toast({ title: "Deleted", description: "Startup removed from portfolio" })

    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) throw new Error(data.error || data.message || "Delete failed")
    } catch (err) {
      console.error("Delete startup error:", err)
      setStartups(previousStartups)
      toast({ title: "Error", description: err.message || "Failed to delete startup from server", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Startups Portfolio</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Manage incubated startups and track key growth metrics</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20 rounded-xl gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Add Startup
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(stats || []).map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg hover:border-[#6CBD45]/50 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 w-56"
          />
        </div>
        <div className="relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Status</option>
            <option value="active" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Active</option>
            <option value="on_hold" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">On Hold</option>
          </select>
        </div>
        {availableCategories.length > 0 && (
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Categories</option>
              {(availableCategories || []).map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">{cat}</option>
              ))}
            </select>
          </div>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-auto">{filtered.length} startup{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CBD45] mb-2" />
          <p className="text-sm font-medium">Loading startups portfolio...</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(filtered || []).map((startup) => (
            <Card key={startup.id} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg hover:border-[#6CBD45]/60 transition-all duration-200 group overflow-hidden">
              <CardContent className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl flex-shrink-0 shadow-inner overflow-hidden">
                      {startup.image_url ? (
                        <Image src={startup.image_url} alt={startup.name || "Startup"} width={44} height={44} className="w-full h-full object-cover" />
                      ) : (
                        startup.emoji || "🚀"
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{startup.name || "Untitled Startup"}</h3>
                      <p className="text-xs text-[#6CBD45] font-medium">{startup.category || "General"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(startup)} className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:border-[#6CBD45]/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(startup.id)} className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:border-red-500/60 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">{startup.description || "No description provided."}</p>

                {/* Badges */}
                <div className="flex gap-1.5 mb-4">
                  <Badge className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-medium border", stageConfig[startup.stage] || "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800")}>
                    {startup.stage || "Pre-Incubation"}
                  </Badge>
                  <Badge className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-medium border", statusConfig[startup.status] || "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800")}>
                    {startup.status || "Active"}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    { label: "Founder", value: startup.founder || "Incubated Founder" },
                    { label: "Employees", value: startup.employees ?? 5 },
                    { label: "Funding", value: startup.funding || "Seed", highlight: true },
                    { label: "Valuation", value: startup.valuation || "N/A" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">{item.label}</p>
                      <p className={cn("text-xs font-bold mt-0.5", item.highlight ? "text-[#6CBD45]" : "text-slate-900 dark:text-white")}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <button onClick={() => window.location.href = `mailto:${startup.email || 'contact@startup.com'}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800">
                    <Mail className="w-3.5 h-3.5 text-[#6CBD45]" /> Contact
                  </button>
                  <button onClick={() => window.open(startup.website || '#', '_blank')} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800">
                    <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Website
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#141824]/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <Building className="w-10 h-10 mb-3 opacity-30 text-[#6CBD45]" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-400">No startups found</p>
          <p className="text-xs mt-1 text-slate-500 mb-4">Try adjusting your search or add a new startup</p>
          <Button onClick={openAddModal} className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Startup
          </Button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Startup" : "Add New Startup"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-slate-700 dark:text-slate-300">Startup Name *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. EcoInnovate"
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="founder" className="text-xs font-medium text-slate-700 dark:text-slate-300">Founder Name</Label>
                <Input
                  id="founder"
                  value={form.founder}
                  onChange={(e) => setForm(f => ({ ...f, founder: e.target.value }))}
                  placeholder="e.g. Alex Rivera"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">Founder Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="alex@startup.com"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-medium text-slate-700 dark:text-slate-300">Stage / Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Pre-Incubation"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</Label>
                <Select value={form.status} onValueChange={(val) => setForm(f => ({ ...f, status: val }))}>
                  <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="funding" className="text-xs font-medium text-slate-700 dark:text-slate-300">Funding Stage</Label>
                <Input
                  id="funding"
                  value={form.funding}
                  onChange={(e) => setForm(f => ({ ...f, funding: e.target.value }))}
                  placeholder="Seed"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="valuation" className="text-xs font-medium text-slate-700 dark:text-slate-300">Valuation</Label>
                <Input
                  id="valuation"
                  value={form.valuation}
                  onChange={(e) => setForm(f => ({ ...f, valuation: e.target.value }))}
                  placeholder="₹2.5 Cr / N/A"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="employees" className="text-xs font-medium text-slate-700 dark:text-slate-300">Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  min="1"
                  value={form.employees}
                  onChange={(e) => setForm(f => ({ ...f, employees: e.target.value }))}
                  placeholder="5"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-slate-700 dark:text-slate-300">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short pitch / summary of the startup..."
                rows={3}
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link" className="text-xs font-medium text-slate-700 dark:text-slate-300">Website URL</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://example.com"
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Logo / Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleImageUpload(file)
                      if (url) setForm(f => ({ ...f, image_url: url }))
                    }
                  }}
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white file:text-[#6CBD45]"
                />
                {isUploading && <Loader2 className="w-5 h-5 animate-spin text-[#6CBD45]" />}
                {form.image_url && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {form.image_url && (
                <div className="mt-2">
                  <Image src={form.image_url} alt="Preview" width={100} height={60} className="object-cover rounded border border-slate-200 dark:border-slate-800" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {isEdit ? "Update Startup" : "Save Startup"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}