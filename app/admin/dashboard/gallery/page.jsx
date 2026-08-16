"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import * as React from "react"
import {
  Plus,
  Upload,
  Trash2,
  Eye,
  Image as ImageIcon,
  Grid,
  List,
  Search,
  X,
  Loader2
} from "lucide-react"
import Image from "next/image"

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    category: "events",
    description: "",
    file: null,
    preview: ""
  })
  
  const { toast } = useToast()

  // Fetch Data
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/gallery/list')
      if (res.ok) {
        const data = await res.json()
        setGalleryItems(data)
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to fetch gallery", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewItem(prev => ({
          ...prev,
          file,
          preview: reader.result,
          title: prev.title || file.name.split('.')[0]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Upload Submit
  const handleUpload = async () => {
    if (!newItem.file) {
      toast({ title: "Error", description: "Please select an image first", variant: "destructive" })
      return
    }
    if (!newItem.title) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" })
      return
    }

    try {
      setUploading(true)
      
      // Step 1: Upload File
      const formData = new FormData()
      formData.append("file", newItem.file)
      
      const uploadRes = await fetch("/api/admin/events/upload", {
        method: "POST",
        body: formData
      })
      
      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json()

      // Step 2: Save metadata
      const saveRes = await fetch("/api/admin/gallery/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItem.title,
          category: newItem.category,
          description: newItem.description,
          url: uploadData.url,
          size: `${(newItem.file.size / (1024 * 1024)).toFixed(1)} MB`
        })
      })

      if (!saveRes.ok) throw new Error("Saving gallery metadata failed")

      toast({ title: "Success", description: "Image uploaded successfully" })
      setIsUploadOpen(false)
      setNewItem({ title: "", category: "events", description: "", file: null, preview: "" })
      fetchGallery()

    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to upload item", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      toast({ title: "Deleted", description: "Image removed from gallery" })
      fetchGallery()
    } catch (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" })
    }
  }

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category) => {
    switch(category) {
      case "events": return "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-800/80"
      case "workspace": return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80"
      case "team": return "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-800/80"
      default: return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gallery</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage photos and media assets</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20">
          <Plus className="w-5 h-5 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Controls Card */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-xl text-slate-900 dark:text-white font-bold">Media Library</CardTitle>
            <div className="flex gap-3 w-full sm:w-auto items-center flex-wrap">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45]"
              >
                <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Categories</option>
                <option value="events" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Events</option>
                <option value="workspace" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Workspace</option>
                <option value="team" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Team</option>
              </select>
              <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 p-0.5">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-[#6CBD45] text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-[#6CBD45] text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#6CBD45]" /> Loading gallery...
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(filteredItems || []).map((item) => (
                <Card key={item.id} className="group relative bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#6CBD45]/50 transition-all overflow-hidden rounded-2xl">
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-950">
                    <Image 
                      src={item.url} 
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <Button size="icon" variant="secondary" className="bg-slate-900 border border-slate-700 text-white hover:bg-slate-800" onClick={() => window.open(item.url, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={item.title}>{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                      <span>{item.size}</span>
                      <span>{item.date}</span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(filteredItems || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <Image src={item.url} alt={item.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                      <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 items-center">
                        <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">{item.category}</Badge>
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => window.open(item.url, '_blank')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No images found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-bold">Upload Media</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Image Preview / Dropzone */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-900/60 hover:border-[#6CBD45]/60 transition-colors">
              {newItem.preview ? (
                <div className="relative h-48 w-full mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                  <Image src={newItem.preview} alt="Preview" fill className="object-contain bg-slate-100 dark:bg-slate-950" />
                  <button 
                    onClick={() => setNewItem(p => ({ ...p, file: null, preview: "" }))}
                    className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#6CBD45]/15 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[#6CBD45]" />
                  </div>
                  <label className="cursor-pointer mt-2">
                    <span className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white px-4 py-2 rounded-xl text-sm font-bold transition inline-block shadow-sm">
                      Choose Image
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Title *</Label>
              <Input 
                id="title" 
                value={newItem.title} 
                onChange={(e) => setNewItem(p => ({ ...p, title: e.target.value }))}
                placeholder="Image title"
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(v) => setNewItem(p => ({ ...p, category: v }))}
              >
                <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="workspace">Workspace</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-slate-700 dark:text-slate-300">Description</Label>
              <Input 
                id="desc" 
                value={newItem.description} 
                onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional description" 
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsUploadOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUpload} className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}