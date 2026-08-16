"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
    Save, ChevronLeft, Loader2, Plus, 
    Settings, Globe, Layout, 
    ChevronRight, ExternalLink, Clock
} from "lucide-react"
import PuckEditor from "@/components/admin/page-builder/PuckEditor"
import Link from "next/link"

export default function CreateCustomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [form, setForm] = useState({
    title: "", 
    slug: "", 
    description: "", 
    content: { content: [], root: {} },
    status: "draft"
  })

  const handleEditorChange = useCallback((content) => {
    setForm(f => ({ ...f, content }))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast({ title: "Missing fields", description: "Title is required", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast({ title: "Success", description: "New page created!" })
        router.push('/admin/dashboard/pages')
      } else {
        const err = await res.json()
        toast({ title: "Error", description: err.error || "Failed to create page", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Save failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0f1117] overflow-hidden -m-6 text-slate-900 dark:text-slate-100">
      {/* Premium Sticky Header */}
      <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0D12]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
            <Link href="/admin/dashboard/pages">
                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all text-slate-900 dark:text-white">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 font-bold" />
                    Back
                </Button>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>Dashboard</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Pages</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900 dark:text-white font-bold">New Page</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold" onClick={() => router.back()}>
                Cancel
            </Button>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button 
                onClick={handleCreate} 
                disabled={loading}
                style={{
                  background: loading ? "#5ba83a" : "#6CBD45",
                  color: "white",
                  borderRadius: "0.75rem",
                  padding: "0 1.5rem",
                  height: "2.25rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(108,189,69,0.35)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  transition: "background 0.2s",
                }}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? "Creating..." : "Create Page"}
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D12] h-full flex flex-col relative`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#6CBD45]" />
                    Page Settings
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-lg h-8 w-8 text-slate-900 dark:text-white">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
                {/* Visual Group 1: General */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">General Information</h3>
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Page Identity</Label>
                            <Input
                                value={form.title}
                                onChange={e => {
                                    const title = e.target.value
                                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                    setForm(prev => ({ ...prev, title, slug }))
                                }}
                                placeholder="E.g. Summer Event 2026"
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6CBD45]/20"
                            />
                        </div>
                        <div className="space-y-1.5 ">
                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Permalink (Slug)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">/p/</span>
                                <Input 
                                    value={form.slug} 
                                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} 
                                    className="pl-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6CBD45]/20 whitespace-normal text-slate-900 dark:text-white"
                                    placeholder="page-url-slug"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Group 2: Publishing */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Visibility & Status</h3>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <Button 
                            variant={form.status === 'draft' ? "default" : "ghost"} 
                            size="sm" 
                            className={`flex-1 rounded-xl text-xs font-bold transition-all ${form.status === 'draft' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                            onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
                        >Draft</Button>
                        <Button 
                            variant={form.status === 'published' ? "default" : "ghost"}
                            size="sm" 
                            className={`flex-1 rounded-xl text-xs font-bold transition-all ${form.status === 'published' ? 'bg-[#6CBD45] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                            onClick={() => setForm(f => ({ ...f, status: 'published' }))}
                        >Published</Button>
                    </div>
                </section>

                {/* Visual Group 3: SEO */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Search Engine Optimization</h3>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Meta Description</Label>
                        <textarea 
                            value={form.description} 
                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                            placeholder="Describe your page for search engines..."
                            className="w-full min-h-[120px] p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#6CBD45]/20 transition-all outline-none text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </section>
            </div>
        </aside>

        {!isSidebarOpen && (
            <div className="absolute left-4 top-20 z-20">
                <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-full bg-white dark:bg-slate-900 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 border-[#6CBD45]/20 text-slate-900 dark:text-white h-10 w-10">
                    <Settings className="w-4 h-4 text-[#6CBD45]" />
                </Button>
            </div>
        )}

        {/* Builder Canvas Area */}
        <main className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col relative">
            <div className="flex-1">
                 <PuckEditor 
                    initialData={form.content} 
                    onChange={handleEditorChange} 
                />
            </div>
        </main>
      </div>
    </div>
  )
}
