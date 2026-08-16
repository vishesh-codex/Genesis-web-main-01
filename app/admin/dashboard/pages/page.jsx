"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus, Edit, Trash2, Search, FileText, Loader2, Eye, Layout
} from "lucide-react"
import Link from "next/link"

export default function PagesAdminPage() {
  const [pages, setPages] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data || [])
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchPages() }, [fetchPages])

  const handleDelete = async (id) => {
    if (!confirm("Delete this page permanently?")) return
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Deleted", description: "Page removed" })
        fetchPages()
      }
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" })
    }
  }

  const filtered = pages.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Custom Pages</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and design your landing pages</p>
        </div>
        <Link href="/admin/dashboard/pages/create">
            <Button className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20">
                <Plus className="w-5 h-5 mr-2" /> New Page
            </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <Input 
          placeholder="Search pages..." 
          value={searchTerm} 
          onChange={e=>setSearchTerm(e.target.value)} 
          className="pl-10 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45]" 
        />
      </div>

      {/* Content Card */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#6CBD45]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Layout className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#6CBD45]" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No custom pages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {(filtered || []).map(page => (
                <div key={page.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{page.title}</h3>
                      <Badge className={page.status === 'published' ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-xs text-[#6CBD45]">/p/{page.slug}</span>
                      <span>•</span>
                      <span>{page.date}</span>
                      <span>•</span>
                      <span>{page.views || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => window.open(`/p/${page.slug}`, '_blank')}>
                      <Eye className="w-4 h-4 mr-1"/> View
                    </Button>
                    <Link href={`/admin/dashboard/pages/edit/${page.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                            <Edit className="w-4 h-4 mr-1"/> Edit
                        </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40" onClick={() => handleDelete(page.id)}>
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
