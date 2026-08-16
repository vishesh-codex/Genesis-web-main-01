"use client"

import { useState, useEffect, useCallback } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Filter, Eye, X, Layers } from "lucide-react"
import Image from "next/image"
import * as React from "react"

// Define the shape of our gallery item
interface GalleryItem {
  id: number
  title: string
  category: string
  image: string
  description: string
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [activeCategory, setActiveCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  
  // Pagination State
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9
  })

  // Fetch data from API
  const fetchGallery = useCallback(async (page: number, category: string) => {
    setLoading(true)
    setError(false)
    
    try {
      // Build query string
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // Items per page
        category: category
      })

      const response = await fetch(`/api/gallery/list?${params.toString()}`, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }

      const data = await response.json()
      
      setGalleryItems(data.items || [])
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 9 })
      
      // Only update categories if we are on the initial load or "All" category to keep options consistent
      if (categories.length <= 1 || category === 'All') {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        }
      }

    } catch (err) {
      console.error('Error loading gallery:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [categories.length])

  // Initial load and when category/page changes
  useEffect(() => {
    fetchGallery(pagination.currentPage, activeCategory)
  }, [pagination.currentPage, activeCategory, fetchGallery])

  // Handler for category change
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return
    setActiveCategory(category)
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to page 1
  }

  // Handlers for pagination
  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0B0D12] dark:via-[#0f1117] dark:to-[#141824] overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        {/* Soft Background Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6CBD45]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 right-10 w-96 h-96 bg-[#6CBD45]/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Developer Grid Pattern Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(108,189,69,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              Visual Showcase
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Our Moments, Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-lime-300">Journey</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Explore visual highlights from our events, hackathons, workshops, and the vibrant startup ecosystem at Genesis - QUIC.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-slate-700 dark:text-slate-300">
              <div className="px-4 py-2 rounded-2xl bg-white/70 dark:bg-[#141824]/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-[#6CBD45]/40 transition-all">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/30 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-[#6CBD45]" />
                </div>
                <span>Categories: <strong className="text-slate-900 dark:text-white font-bold">{categories.length}</strong></span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/70 dark:bg-[#141824]/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-[#6CBD45]/40 transition-all">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/30 to-emerald-500/10 border border-[#6CBD45]/30 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-[#6CBD45]" />
                </div>
                <span>Total Items: <strong className="text-slate-900 dark:text-white font-bold">{pagination.totalItems || galleryItems.length}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Categories Bar */}
      <section className="sticky top-16 z-30 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-2xl border-y border-slate-200/80 dark:border-slate-800/80 py-4 shadow-xl transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          {loading && categories.length <= 1 ? (
            <div className="flex justify-center items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-10 w-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-10 w-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 mr-2 text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-[#6CBD45]" /> Filter:
              </div>
              {categories.map((category) => {
                const isActive = activeCategory === category
                return (
                  <Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`rounded-2xl text-sm font-semibold transition-all duration-300 px-4 sm:px-5 py-2.5 ${
                      isActive
                        ? "bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] text-white shadow-[0_0_25px_rgba(108,189,69,0.45)] border border-[#6CBD45] hover:scale-105"
                        : "bg-slate-100/80 dark:bg-[#141824]/80 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/50 hover:bg-[#6CBD45]/10 hover:text-slate-900 dark:hover:text-white hover:scale-105"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#0f1117] flex-grow relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          
          {error && (
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-white/80 dark:bg-[#141824]/90 backdrop-blur-2xl border border-red-200 dark:border-red-500/30 rounded-3xl shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Failed to load gallery</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">We encountered an issue fetching images. Please try again.</p>
              <Button 
                onClick={() => fetchGallery(pagination.currentPage, activeCategory)}
                className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white shadow-lg shadow-[#6CBD45]/30 font-semibold rounded-2xl px-6 py-2.5"
              >
                Retry Loading
              </Button>
            </div>
          )}

          {!error && loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-lg">
                  <Skeleton className="h-60 w-full rounded-2xl bg-slate-200 dark:bg-slate-800/70 animate-pulse" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800/70 rounded-xl" />
                    <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800/70 rounded-xl" />
                    <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800/70 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && galleryItems.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-20 px-6 bg-white/80 dark:bg-[#141824]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-[#6CBD45]/25 to-emerald-500/10 border border-[#6CBD45]/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(108,189,69,0.2)]">
                <ImageIcon className="w-10 h-10 text-[#6CBD45]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Images Found</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {activeCategory === "All" 
                  ? "The gallery currently has no images published." 
                  : `There are currently no items in the "${activeCategory}" category.`}
              </p>
              {activeCategory !== "All" && (
                <Button 
                  onClick={() => handleCategoryChange("All")}
                  className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white shadow-lg shadow-[#6CBD45]/25 font-semibold rounded-2xl px-6 py-2.5"
                >
                  View All Categories
                </Button>
              )}
            </div>
          ) : !error && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {galleryItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedImage(item)}
                    className="group relative bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-[0_10px_35px_-5px_rgba(108,189,69,0.25)] transition-all duration-500 flex flex-col hover:-translate-y-2 cursor-pointer shadow-lg"
                  >
                    {/* Top Glow Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden bg-slate-900">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">
                          <ImageIcon className="w-16 h-16 opacity-30" />
                        </div>
                      )}

                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117]/90 via-[#0f1117]/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-slate-950/80 dark:bg-[#0f1117]/90 backdrop-blur-xl text-[#6CBD45] border border-[#6CBD45]/40 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(108,189,69,0.2)]">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Quick View Eye Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[3px] z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6CBD45] to-emerald-400 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(108,189,69,0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/20">
                          <Eye className="w-7 h-7" />
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <CardContent className="p-6 flex-1 flex flex-col justify-between bg-white/80 dark:bg-[#141824]/90 border-t border-slate-200/80 dark:border-slate-800/60">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#6CBD45] transition-colors" title={item.title}>
                          {item.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg"># {item.category}</span>
                        <span className="text-[#6CBD45] group-hover:translate-x-1 font-semibold inline-flex items-center gap-1.5 transition-transform duration-300">
                          Expand View &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
                  <Button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className="flex items-center gap-2 bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#6CBD45] hover:text-[#6CBD45] disabled:opacity-40 rounded-2xl px-5 py-2.5 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 font-mono bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    Page <span className="text-[#6CBD45] font-bold">{pagination.currentPage}</span> of {pagination.totalPages}
                  </div>

                  <Button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="flex items-center gap-2 bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#6CBD45] hover:text-[#6CBD45] disabled:opacity-40 rounded-2xl px-5 py-2.5 transition-all shadow-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-2xl bg-black/60 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-[#6CBD45] hover:to-emerald-500 hover:scale-105 transition-all flex items-center justify-center border border-white/20 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-80 sm:h-[450px] bg-slate-950">
              {selectedImage.image ? (
                <Image
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600">
                  <ImageIcon className="w-20 h-20 opacity-30" />
                </div>
              )}
            </div>

            {/* Modal Description Footer */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#141824] border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedImage.title}</h3>
                <Badge className="bg-[#6CBD45]/20 text-[#6CBD45] border border-[#6CBD45]/30 uppercase text-xs">
                  {selectedImage.category}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}