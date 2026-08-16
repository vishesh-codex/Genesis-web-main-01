"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
    Save, ChevronLeft, Loader2, Edit, FileText, 
    Eye, Settings, Globe, Search, Layout, 
    ChevronRight, ExternalLink, Clock
} from "lucide-react"
import PuckEditor from "@/components/admin/page-builder/PuckEditor"
import Link from "next/link"

export default function EditCustomPage() {
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const editorRef = useRef(null)

  const [form, setForm] = useState({
    title: "", 
    slug: "", 
    description: "", 
    content: [],
    status: "draft"
  })

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/pages/${id}`)
      if (!res.ok) throw new Error("Failed to fetch page")
      const data = await res.json()
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        content: data.content || [],
        status: data.status || "draft"
      })
    } catch (error) {
      toast({ title: "Error", description: "Could not load page details", variant: "destructive" })
      router.push('/admin/dashboard/pages')
    } finally {
      setLoading(false)
    }
  }, [id, router, toast])

  useEffect(() => { if (id) fetchPage() }, [id, fetchPage])

  // Keep a ref of form so onSaveBlocks always sees the latest metadata
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  // Saves both Puck blocks + Page metadata in a single call
  const handleSaveBlocks = useCallback(async (puckData) => {
    setSaving(true)
    const currentForm = formRef.current
    try {
      const payload = {
        title: currentForm.title,
        slug: currentForm.slug,
        description: currentForm.description,
        status: currentForm.status,
        content: puckData
      }
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: "Page saved!", description: "Content & settings saved successfully." })
        setForm(prev => ({ ...prev, content: puckData }))
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: "Save Error", description: err.error || "Failed to save page", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Save Error", description: "Network error saving page", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }, [id, toast])

  // Save metadata only (from the top bar button)
  const handleSaveMetadata = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast({ title: "Settings saved!", description: "Page settings updated." })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: "Error", description: err.error || "Failed to save settings", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-[#6CBD45]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-[#6CBD45]" />
                </div>
              </div>
              <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">Initializing Canvas...</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0f1117] overflow-hidden -m-6 text-slate-900 dark:text-slate-100">
      {/* Premium Sticky Header */}
      <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0D12]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-sm text-slate-900 dark:text-white">
        <div className="flex items-center gap-6">
            <Link href="/admin/dashboard/pages">
                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all text-slate-900 dark:text-white">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1" />
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
                    <span className="text-slate-900 dark:text-white font-bold">{form.title || 'Untitled Page'}</span>
                </div>
                {saving && <span className="text-[10px] text-[#6CBD45] animate-pulse">Syncing changes...</span>}
            </div>
        </div>

        <div className="flex items-center gap-3">
             <Badge className={`rounded-lg px-3 py-1 ${form.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                {form.status.toUpperCase()}
            </Badge>
            <Button 
                variant="outline" 
                size="sm" 
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                onClick={() => window.open(`/p/${form.slug}`, '_blank')}
            >
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
                <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
            </Button>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button 
                onClick={handleSaveMetadata} 
                disabled={saving}
                style={{
                  background: saving ? "#5ba83a" : "#6CBD45",
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
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.8 : 1,
                  transition: "background 0.2s",
                }}
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Settings"}
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
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar text-slate-900 dark:text-slate-100">
                {/* Visual Group 1: General */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">General Information</h3>
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Page Identity</Label>
                            <Input
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="E.g. Summer Event 2026"
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#6CBD45]/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Permalink (Slug)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">/p/</span>
                                <Input 
                                    value={form.slug} 
                                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} 
                                    className="pl-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6CBD45]/20 whitespace-normal"
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
                    <div className="px-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Changes are not live until published.</span>
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
                            className="w-full min-h-[120px] p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#6CBD45]/20 transition-all outline-none"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic px-1">Tip: Keep it under 160 characters.</p>
                    </div>
                </section>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">Public at: /p/{form.slug || '...'}</span>
                </div>
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
                    onSaveBlocks={handleSaveBlocks}
                />
            </div>
            
            {/* Soft Overlay for better contrast if needed */}
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-200/20 dark:from-slate-900/20 to-transparent pointer-events-none" />
        </main>
      </div>
    </div>
  )
}
