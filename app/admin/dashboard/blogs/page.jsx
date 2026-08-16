"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus, Edit, Trash2, Globe, Search, Upload, X, Bold, Italic, List, Heading2,
  FileText, CheckCircle, AlertCircle, Loader2, Eye, Save, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

const slugify = (text) => {
  if (!text) return ""
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

const initialFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "Genesis Team",
  category_id: "",
  image_url: "",
  featured: false,
  status: "draft",
  published_at: null
}

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)

  // State for custom category input
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const [form, setForm] = useState(initialFormState)

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Placeholder.configure({ placeholder: "Start writing your blog post..." })
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900"
      }
    },
    onUpdate: ({ editor }) => {
      setForm(prev => ({ ...prev, content: editor.getHTML() }))
    }
  })

  // Sync editor content when editing post
  useEffect(() => {
    if (editor && open) {
      editor.commands.setContent(form.content || "")
    }
  }, [open, editingId])

  // Fetch blogs & categories
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [resBlogs, resCats] = await Promise.all([
        fetch("/api/admin/blogs/list"),
        fetch("/api/admin/blogs/categories")
      ])

      const dataBlogs = await resBlogs.json()
      const dataCats = await resCats.json()

      if (dataBlogs.blogs) setBlogs(dataBlogs.blogs)
      if (dataCats.categories) setCategories(dataCats.categories)
    } catch (err) {
      toast({
        title: "Error fetching data",
        description: "Could not load blogs or categories",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset Form
  const resetForm = () => {
    setForm(initialFormState)
    setEditingId(null)
    setIsCustomCategory(false)
    setNewCategoryName("")
    if (editor) editor.commands.setContent("")
  }

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (blogId) => {
    const blog = blogs.find(b => b.id === blogId)
    if (!blog) return

    setEditingId(blogId)
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      author: blog.author || "Genesis Team",
      category_id: blog.category_id ? blog.category_id.toString() : "",
      image_url: blog.image_url || "",
      featured: blog.featured === 1 || blog.featured === true,
      status: blog.status || "draft",
      published_at: blog.published_at || null
    })
    setIsCustomCategory(false)
    setNewCategoryName("")
    setOpen(true)
  }

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/events/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()

      if (data.url) {
        setForm(prev => ({ ...prev, image_url: data.url }))
        toast({
          title: "Image Uploaded",
          description: "Featured image set successfully"
        })
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (err) {
      toast({
        title: "Upload Error",
        description: err.message || "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image_url: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Handle Custom Category Creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const res = await fetch("/api/admin/blogs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })

      const data = await res.json()

      if (res.ok && data.category) {
        setCategories(prev => [...prev, data.category])
        setForm(prev => ({ ...prev, category_id: data.category.id.toString() }))
        setIsCustomCategory(false)
        setNewCategoryName("")
        toast({
          title: "Category Created",
          description: `Category "${data.category.name}" added successfully`
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create category",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error creating category",
        variant: "destructive"
      })
    }
  }

  // Handle Save / Publish
  const handleSubmit = async (targetStatus) => {
    if (!form.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog title is required",
        variant: "destructive"
      })
      return
    }

    if (!form.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog content cannot be empty",
        variant: "destructive"
      })
      return
    }

    const payload = {
      ...form,
      status: targetStatus,
      slug: form.slug || slugify(form.title),
      published_at: targetStatus === "published" ? (form.published_at || new Date().toISOString()) : null
    }

    try {
      const url = editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs/create"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: editingId ? "Post Updated" : "Post Created",
          description: `Blog post has been ${targetStatus === 'published' ? 'published' : 'saved as draft'}`
        })
        setOpen(false)
        fetchData()
      } else {
        toast({
          title: "Save Failed",
          description: data.message || "Failed to save post",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong while saving",
        variant: "destructive"
      })
    }
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({
          title: "Post Deleted",
          description: "Blog post removed successfully"
        })
        fetchData()
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete blog post",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error deleting post",
        variant: "destructive"
      })
    }
  }

  // Helper for Category Name display
  const getCategoryName = useCallback((catId, catObj) => {
    if (catObj && typeof catObj === 'object' && catObj.name) return catObj.name
    if (typeof catObj === 'string') return catObj
    const found = categories.find(c => c.id.toString() === catId?.toString())
    return found ? found.name : "Uncategorized"
  }, [categories])

  // Filtered list
  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const titleStr = b.title || ""
      const authorStr = b.author || ""
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = titleStr.toLowerCase().includes(searchLower) ||
                            authorStr.toLowerCase().includes(searchLower)

      const matchesStatus = activeTab === "all" ? true : (b.status || "draft") === activeTab

      const catId = b.category_id ? String(b.category_id) : ""
      const catName = getCategoryName(catId, b.category)
      const matchesCategory = selectedCategory === "all"
        ? true
        : (catId === selectedCategory || catName === selectedCategory)

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [blogs, searchTerm, activeTab, selectedCategory, getCategoryName])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Blog Management</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Create, publish, and manage community blog posts</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-lg shadow-[#6CBD45]/25 rounded-2xl h-10 px-5 gap-2"
        >
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.2)] transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/25 via-blue-500/10 to-transparent border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Posts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{blogs.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.2)] transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#6CBD45]/30 via-[#6CBD45]/15 to-transparent border border-[#6CBD45]/40 flex items-center justify-center text-[#6CBD45] shadow-[0_4px_15px_rgba(108,189,69,0.25)] group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Published</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{blogs.filter(b => b.status === 'published').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.2)] transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform duration-300">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Drafts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{blogs.filter(b => b.status === 'draft').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl hover:border-[#6CBD45]/60 hover:shadow-[0_10px_30px_-5px_rgba(108,189,69,0.2)] transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-transparent border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-[0_4px_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Views</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{blogs.reduce((a, b) => a + (b.views || 0), 0).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Controls */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val)
          toast({
            title: "Status Filter Updated",
            description: `Showing ${val === "all" ? "all" : val} posts`
          })
        }}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-1">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-[#6CBD45] data-[state=active]:text-white font-semibold">All Posts</TabsTrigger>
            <TabsTrigger value="published" className="rounded-xl data-[state=active]:bg-[#6CBD45] data-[state=active]:text-white font-semibold">Published</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-xl data-[state=active]:bg-[#6CBD45] data-[state=active]:text-white font-semibold">Drafts</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Category Filter Dropdown */}
            <div className="w-full sm:w-48">
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val)
                  const catLabel = val === "all" ? "All Categories" : getCategoryName(val)
                  toast({
                    title: "Category Filter Updated",
                    description: `Filtered by: ${catLabel}`
                  })
                }}
              >
                <SelectTrigger className="w-full bg-slate-100/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white flex items-center gap-2 rounded-2xl h-10">
                  <Filter className="w-4 h-4 text-[#6CBD45]" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-2xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <Input
                placeholder="Search title, author..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-100/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] rounded-2xl h-10"
              />
            </div>
          </div>
        </div>

        {/* Blog Post List */}
        <Card className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#6CBD45]" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-[#6CBD45]" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">No blog posts found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {(filtered || []).map(blog => {
                  const displayCategory = getCategoryName(blog.category_id, blog.category)
                  const displayAuthor = blog.author || 'Genesis Team'
                  const displayViews = blog.views || 0
                  const displayDate = blog.date || '—'
                  const isFeatured = blog.featured === 1 || blog.featured === true

                  return (
                    <div key={blog.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-[#6CBD45] transition-colors">{blog.title || 'Untitled Blog'}</h3>
                          {isFeatured && (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                              Featured
                            </Badge>
                          )}
                          <Badge className={blog.status === 'published' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm" : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md rounded-full px-2.5 py-0.5 text-xs font-semibold"}>
                            {blog.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[#6CBD45]" /> {displayAuthor}</span>
                          <span className="flex items-center gap-1.5"><List className="w-3.5 h-3.5 text-[#6CBD45]" /> {displayCategory}</span>
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#6CBD45]" /> {displayDate}</span>
                          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#6CBD45]" /> {displayViews}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold shadow-sm"
                          onClick={() => window.open(`/blogs/${blog.slug || blog.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1 text-[#6CBD45]"/> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold shadow-sm"
                          onClick={() => openEdit(blog.id)}
                        >
                          <Edit className="w-4 h-4 mr-1 text-[#6CBD45]"/> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-950/40"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Create/Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-slate-900 dark:text-white">
              {editingId ? <Edit className="w-6 h-6 text-[#6CBD45]" /> : <Plus className="w-6 h-6 text-[#6CBD45]" />}
              {editingId ? "Edit Blog Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Title <span className="text-rose-500">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={e => {
                      const title = e.target.value
                      const autoSlug = slugify(title)
                      setForm(prev => {
                        const shouldUpdateSlug = !editingId || !prev.slug || prev.slug === slugify(prev.title)
                        return {
                          ...prev,
                          title,
                          slug: shouldUpdateSlug ? autoSlug : prev.slug
                        }
                      })
                    }}
                    placeholder="Enter blog title"
                    className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Slug (URL)</Label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="url-friendly-slug"
                    className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Featured Image</Label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/60 hover:border-[#6CBD45]/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" disabled={uploading}>
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#6CBD45]" /> : <Upload className="w-4 h-4 mr-2 text-[#6CBD45]" />}
                        {uploading ? "Uploading..." : "Choose Image"}
                      </Button>
                    </div>
                    {form.image_url ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Image Selected</span>
                        <Button size="sm" variant="destructive" onClick={handleRemoveImage}>
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No image selected</span>
                    )}
                  </div>

                  {form.image_url ? (
                    <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md relative h-48 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                      <img
                        src={form.image_url}
                        alt="Featured Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = "/1381732341471.png"
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Category <span className="text-rose-500">*</span></Label>
                  {isCustomCategory ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type new category"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        autoFocus
                      />
                      <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-[#6CBD45]" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsCustomCategory(false)} title="Cancel custom category">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={form.category_id}
                      onValueChange={v => {
                        if (v === "NEW_CATEGORY_OPTION") {
                          setIsCustomCategory(true)
                        } else {
                          setForm(p => ({ ...p, category_id: v }))
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                        <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                        <SelectItem value="NEW_CATEGORY_OPTION" className="text-[#6CBD45] font-medium cursor-pointer hover:bg-[#6CBD45]/10">
                          <Plus className="w-3 h-3 mr-2 inline" /> Create New Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Author</Label>
                  <Input
                    value={form.author}
                    onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                    placeholder="Author Name"
                    className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="space-y-2 flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-800 p-2 rounded-md w-full bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 text-[#6CBD45] accent-[#6CBD45] rounded"
                    />
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">Mark as Featured</span>
                  </label>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  placeholder="Short summary for listing pages..."
                  className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Content <span className="text-rose-500">*</span></Label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900">
                  <div className="bg-slate-200 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 p-2 flex gap-1 flex-wrap sticky top-0 z-10">
                    <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBold().run()} className={cn("text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800", editor?.isActive('bold') ? 'bg-[#6CBD45]/20 text-[#6CBD45] font-bold' : '')}><Bold className="w-4 h-4"/></Button>
                    <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleItalic().run()} className={cn("text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800", editor?.isActive('italic') ? 'bg-[#6CBD45]/20 text-[#6CBD45] font-bold' : '')}><Italic className="w-4 h-4"/></Button>
                    <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800", editor?.isActive('heading', { level: 2 }) ? 'bg-[#6CBD45]/20 text-[#6CBD45] font-bold' : '')}><Heading2 className="w-4 h-4"/></Button>
                    <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={cn("text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800", editor?.isActive('bulletList') ? 'bg-[#6CBD45]/20 text-[#6CBD45] font-bold' : '')}><List className="w-4 h-4"/></Button>
                  </div>
                  <div className="min-h-[300px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {editor && <EditorContent editor={editor} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                {form.status === 'published' ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-4 h-4 mr-1"/> Currently Published</span>
                ) : (
                  <span className="flex items-center text-amber-600 dark:text-amber-400"><AlertCircle className="w-4 h-4 mr-1"/> Draft Mode</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>Cancel</Button>

                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  className={form.status === 'draft' ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300" : "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50"}
                >
                  {form.status === 'published' ? 'Unpublish (Save as Draft)' : 'Save as Draft'}
                </Button>

                <Button
                  onClick={() => handleSubmit('published')}
                  className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20"
                >
                  {form.status === 'published' ? 'Update Post' : 'Publish Now'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}