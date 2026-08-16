// app/admin/dashboard/portfolio/page.jsx
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  ExternalLink,
  Upload,
  Search,
  X,
  Loader2,
  Filter
} from "lucide-react"
import Image from "next/image"

export default function PortfolioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [portfolioItems, setPortfolioItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image_url: '',
    status: 'draft',
    tags: [],
    link: '',
    date: new Date().toISOString().split('T')[0]
  })

  const { toast } = useToast()

  // Fetch portfolio items
  const fetchPortfolioItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/portfolio/list')
      if (response.ok) {
        const data = await response.json()
        setPortfolioItems(data.portfolio || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch portfolio items",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching portfolio items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPortfolioItems()
  }, [fetchPortfolioItems])

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set()
    portfolioItems.forEach(item => {
      if (item.category) categories.add(item.category)
    })
    return Array.from(categories)
  }, [portfolioItems])

  // Filter items
  const filteredItems = useMemo(() => {
    return portfolioItems.filter(item => {
      const titleMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const descMatch = (item.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
      const searchMatches = titleMatch || descMatch || categoryMatch

      const itemStatus = (item.status || "draft").toLowerCase()
      const statusMatches = statusFilter === "all" || itemStatus === statusFilter.toLowerCase()

      const itemCategory = item.category || "General"
      const categoryMatches = categoryFilter === "all" || itemCategory === categoryFilter

      return searchMatches && statusMatches && categoryMatches
    })
  }, [portfolioItems, searchTerm, statusFilter, categoryFilter])

  // Helper for status badge color
  const getStatusColor = (status) => {
    const s = (status || 'draft').toLowerCase()
    switch (s) {
      case 'featured':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80'
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80'
      default:
        return 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
    }
  }

  // Open modal for add
  const openAddModal = () => {
    setForm({
      title: '',
      category: '',
      description: '',
      image_url: '',
      status: 'draft',
      tags: [],
      link: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsEdit(false)
    setSelectedId(null)
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (item) => {
    setForm({
      title: item.title || '',
      category: item.category || '',
      description: item.description || '',
      image_url: item.image_url || '',
      status: item.status || 'draft',
      tags: Array.isArray(item.tags) ? item.tags : [],
      link: item.link || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setIsEdit(true)
    setSelectedId(item.id)
    setShowModal(true)
  }

  // Image Upload
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
        toast({
          title: "Image Uploaded",
          description: "Image uploaded successfully",
        })
        return data.url
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload image",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred during upload",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category || !form.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit ? `/api/admin/portfolio/${selectedId}` : '/api/admin/portfolio/create'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Portfolio item ${isEdit ? 'updated' : 'created'} successfully`
        })
        setShowModal(false)
        fetchPortfolioItems()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || `Failed to ${isEdit ? 'update' : 'create'} item`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while ${isEdit ? 'updating' : 'creating'} item`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return

    try {
      const response = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Portfolio item deleted successfully"
        })
        fetchPortfolioItems()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting item",
        variant: "destructive"
      })
    }
  }

  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Portfolio</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Showcase incubated startups and high-impact projects</p>
        </div>
        <Button className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20 rounded-xl" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Items</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{portfolioItems.length}</p>
              </div>
              <Star className="w-8 h-8 text-sky-500 dark:text-sky-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Featured</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {portfolioItems.filter(item => (item.status || '').toLowerCase() === "featured").length}
                </p>
              </div>
              <Star className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {portfolioItems.filter(item => (item.status || '').toLowerCase() === "active").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-[#6CBD45]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {new Set(portfolioItems.map(item => item.category || 'General')).size}
                </p>
              </div>
              <Upload className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Items Table/Card Grid */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Items ({filteredItems.length})</CardTitle>

            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search portfolio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full text-sm"
                />
              </div>

              <div className="relative">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availableCategories.length > 0 && (
                <div className="relative">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-36 bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {(availableCategories || []).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#6CBD45] mb-2" />
              <p className="text-sm font-medium">Loading portfolio items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-600 opacity-40" />
              No portfolio items found
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(filteredItems || []).map((item) => {
                const itemStatus = item.status || 'draft'
                const displayStatus = itemStatus.charAt(0).toUpperCase() + itemStatus.slice(1)
                const tagsList = Array.isArray(item.tags) ? item.tags : []

                return (
                  <Card key={item.id} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/60 transition-all overflow-hidden group">
                    <div className="relative">
                      {item.image_url ? (
                        <Image 
                          src={item.image_url} 
                          alt={item.title || "Portfolio"} 
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover rounded-t-xl" 
                        />
                      ) : (
                        <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-t-xl flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                          <Upload className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className={getStatusColor(itemStatus)}>
                          {displayStatus}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title || "Untitled"}</h3>
                          <Badge variant="outline" className="text-xs mt-1 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-[#6CBD45]">
                            {item.category || "General"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description || "No description provided."}
                        </p>
                        {tagsList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tagsList.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-[10px] border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                          </span>
                          <div className="flex space-x-1">
                            {item.link && (
                              <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => window.open(item.link, '_blank')}>
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => openEditModal(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-xs font-medium text-slate-700 dark:text-slate-300">Title *</Label>
                <Input 
                  id="title"
                  value={form.title} 
                  onChange={(e) => updateForm({ title: e.target.value })} 
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-xs font-medium text-slate-700 dark:text-slate-300">Category *</Label>
                <Input 
                  id="category"
                  value={form.category} 
                  onChange={(e) => updateForm({ category: e.target.value })} 
                  placeholder="e.g. AI / CleanTech"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-xs font-medium text-slate-700 dark:text-slate-300">Description *</Label>
                <Textarea 
                  id="description"
                  value={form.description} 
                  onChange={(e) => updateForm({ description: e.target.value })}
                  rows={3}
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-xs font-medium text-slate-700 dark:text-slate-300">Date *</Label>
                <Input 
                  id="date"
                  type="date"
                  value={form.date} 
                  onChange={(e) => updateForm({ date: e.target.value })} 
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="link" className="text-xs font-medium text-slate-700 dark:text-slate-300">Website Link</Label>
                <Input 
                  id="link"
                  value={form.link} 
                  onChange={(e) => updateForm({ link: e.target.value })} 
                  placeholder="https://example.com"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="tags" className="text-xs font-medium text-slate-700 dark:text-slate-300">Tags (comma separated)</Label>
                <Input 
                  id="tags"
                  value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} 
                  onChange={(e) => updateForm({ 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                  })} 
                  placeholder="AI, Startup, Tech"
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#6CBD45]"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value) => updateForm({ status: value })}
                >
                  <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Featured Image</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await handleImageUpload(file)
                        if (url) updateForm({ image_url: url })
                      }
                    }} 
                    className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white file:text-[#6CBD45]"
                  />
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin text-[#6CBD45]" />}
                </div>
                {form.image_url && (
                  <div className="mt-2">
                    <Image 
                      src={form.image_url} 
                      alt="Preview" 
                      width={200}
                      height={120}
                      className="object-cover rounded border border-slate-200 dark:border-slate-800"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      onClick={() => updateForm({ image_url: '' })}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {isEdit ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}