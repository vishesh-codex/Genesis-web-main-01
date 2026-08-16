"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  Eye,
  MessageCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Search,
  X,
  Clock,
  Flame
} from "lucide-react"
import Link from "next/link"
import * as React from "react"
import {
  FALLBACK_BLOGS,
  Blog,
  calculateReadingTime,
  formatBlogDate
} from "@/lib/fallbackBlogs"
import { AuthorAvatar, SafeBlogImage } from "@/components/blog/blog-ui-helpers"

interface Category {
  id: number
  name: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(FALLBACK_BLOGS)
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Entrepreneurs",
    "Culture",
    "Insights",
    "DeepTech",
    "Venture Capital",
    "Sustainability",
    "Innovation"
  ])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [blogsRes, catsRes] = await Promise.allSettled([
          fetch("/api/blogs/list", { cache: "no-store" }),
          fetch("/api/blogs/categories", { cache: "no-store" })
        ])

        // Handle Blogs API response or fallback
        if (blogsRes.status === "fulfilled" && blogsRes.value.ok) {
          const blogsData = await blogsRes.value.json()
          if (Array.isArray(blogsData) && blogsData.length > 0) {
            setBlogs(blogsData)
          } else {
            setBlogs(FALLBACK_BLOGS)
          }
        } else {
          setBlogs(FALLBACK_BLOGS)
        }

        // Handle Categories API response or fallback
        if (catsRes.status === "fulfilled" && catsRes.value.ok) {
          const catsData: Category[] = await catsRes.value.json()
          if (Array.isArray(catsData) && catsData.length > 0) {
            const catNames = catsData.map(c => c.name)
            setCategories(["All", ...Array.from(new Set(catNames))])
          }
        } else {
          const derivedCats = Array.from(
            new Set(FALLBACK_BLOGS.map(b => b.category))
          )
          setCategories(["All", ...derivedCats])
        }
      } catch (err) {
        console.warn("API fetch error, using FALLBACK_BLOGS dataset:", err)
        setBlogs(FALLBACK_BLOGS)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter blogs by active category and search query
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchesCategory =
        activeCategory === "All" ||
        b.category.toLowerCase() === activeCategory.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        b.title.toLowerCase().includes(query) ||
        b.excerpt.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [blogs, activeCategory, searchQuery])

  // Top featured post for hero banner
  const heroFeatured = useMemo(() => {
    const featuredList = filteredBlogs.filter(b => b.featured)
    return featuredList.length > 0 ? featuredList[0] : filteredBlogs[0] || null
  }, [filteredBlogs])

  // Remaining posts for grid display
  const gridBlogs = useMemo(() => {
    if (!heroFeatured) return filteredBlogs
    return filteredBlogs.filter(b => b.id !== heroFeatured.id)
  }, [filteredBlogs, heroFeatured])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Hero Header Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0B0D12] dark:via-[#0f1117] dark:to-[#141824] overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6CBD45]/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#6CBD45]/10 blur-[110px] rounded-full pointer-events-none" />

        {/* Developer Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(108,189,69,0.15)]">
            <BookOpen className="w-3.5 h-3.5" />
            Genesis Innovation Journal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            News & Views from our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-lime-300">
              Community
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stay ahead with the latest startup strategies, founder breakdowns,
            ecosystem announcements, and tech guides.
          </p>

          {/* Search Bar Component */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or author..."
                className="w-full pl-12 pr-12 py-3.5 bg-white/90 dark:bg-[#141824]/90 border border-slate-300 dark:border-slate-700/80 focus:border-[#6CBD45] focus:ring-2 focus:ring-[#6CBD45]/20 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm shadow-xl transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Filter Pills */}
      <section className="py-5 bg-white/95 dark:bg-[#0f1117]/95 backdrop-blur-md sticky top-20 z-20 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          {loading ? (
            <div className="flex justify-center gap-2">
              <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                      activeCategory === cat
                        ? "bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white shadow-lg shadow-[#6CBD45]/25 border border-[#6CBD45]"
                        : "bg-slate-100 dark:bg-[#141824] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Showing {filteredBlogs.length} of {blogs.length} articles
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-slate-50 dark:bg-[#0f1117] min-h-[50vh] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Loading State */}
          {loading && (
            <div className="space-y-12">
              <Skeleton className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <Skeleton className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <Skeleton className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <Skeleton className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Empty Search / Filter State */}
              {filteredBlogs.length === 0 && (
                <div className="relative overflow-hidden text-center py-20 bg-white/80 dark:bg-[#141824]/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 max-w-2xl mx-auto shadow-2xl">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80" />
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 rounded-3xl mx-auto mb-4 flex items-center justify-center text-[#6CBD45] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                    <BookOpen className="w-8 h-8 text-[#6CBD45]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    We couldn&apos;t find any articles matching{" "}
                    {searchQuery ? (
                      <span className="text-slate-900 dark:text-white font-semibold">
                        &quot;{searchQuery}&quot;
                      </span>
                    ) : (
                      <span className="text-[#6CBD45] font-semibold">
                        {activeCategory}
                      </span>
                    )}
                  </p>
                  <Button
                    onClick={() => {
                      setActiveCategory("All")
                      setSearchQuery("")
                    }}
                    className="bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold rounded-full px-6 py-3 [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
                  >
                    Reset Filters & View All
                  </Button>
                </div>
              )}

              {/* Featured Blog Banner (Top Article Highlight) */}
              {heroFeatured && !searchQuery && (
                <div className="mb-16">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-[#6CBD45]" />
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Featured Story
                    </h2>
                  </div>

                  <FeaturedBanner post={heroFeatured} />
                </div>
              )}

              {/* Blog Card Grid - Android Mobile Fluid Grid Layout */}
              {gridBlogs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {searchQuery
                        ? `Search Results (${gridBlogs.length})`
                        : "Latest Articles"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {gridBlogs.map(post => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

/**
 * Featured Blog Banner Component with 3D Glassmorphic Aesthetic
 */
function FeaturedBanner({ post }: { post: Blog }) {
  const readTime = calculateReadingTime(post.content || post.excerpt)
  const formattedDate = formatBlogDate(post.published_at || post.date)

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#141824]/90 backdrop-blur-2xl shadow-2xl hover:shadow-[0_25px_50px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 transition-all duration-500 group">
      {/* Glowing Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_12px_#6CBD45]" />

      <div className="grid lg:grid-cols-12 gap-0">
        <div className="relative lg:col-span-7 h-72 lg:h-auto min-h-[340px] bg-slate-900 overflow-hidden">
          <SafeBlogImage
            src={post.image_url}
            alt={post.title}
            priority={true}
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#141824] dark:via-[#141824]/30 dark:to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-white/40 lg:to-white dark:lg:via-[#141824]/40 dark:lg:to-[#141824]" />

          {/* 3D Glass Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <Badge className="bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-white" />
              Featured Story
            </Badge>
            <Badge className="bg-slate-900/90 text-slate-200 border border-slate-700/80 font-semibold backdrop-blur-md text-xs px-3 py-1.5 rounded-full">
              {post.category}
            </Badge>
          </div>
        </div>

        <CardContent className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-white/80 dark:bg-[#141824]/90">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <AuthorAvatar
                authorName={post.author}
                avatarUrl={post.author_avatar}
                size="sm"
              />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">{post.author}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                  <Calendar className="w-3 h-3 text-[#6CBD45]" />
                </div>
                <span>{formattedDate}</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors leading-tight">
              <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-4">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                  <Clock className="w-3 h-3 text-[#6CBD45]" />
                </div>
                <span>{readTime}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                  <Eye className="w-3 h-3 text-[#6CBD45]" />
                </div>
                <span>{post.views || 0}</span>
              </div>
            </div>

            <Button
              asChild
              className="group/btn bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-3 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
            >
              <Link href={`/blogs/${post.slug}`} className="flex items-center gap-2">
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

/**
 * Standard Blog Card Component with 3D Glassmorphic Styling
 */
function BlogCard({ post }: { post: Blog }) {
  const readTime = calculateReadingTime(post.content || post.excerpt)
  const formattedDate = formatBlogDate(post.published_at || post.date)

  return (
    <Card className="bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.25)] transition-all duration-500 hover:-translate-y-2 overflow-hidden group flex flex-col rounded-3xl relative">
      {/* Glowing Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />

      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <SafeBlogImage
          src={post.image_url}
          alt={post.title}
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#141824] opacity-90" />

        {/* 3D Category Badge */}
        <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md border border-white/20 uppercase tracking-wider">
          {post.category}
        </Badge>
        {post.featured && (
          <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
            <Flame className="w-3 h-3 fill-white" />
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 bg-white/80 dark:bg-[#141824]/90">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
            <AuthorAvatar
              authorName={post.author}
              avatarUrl={post.author_avatar}
              size="sm"
            />
            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">{post.author}</span>
          </div>

          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors line-clamp-2 leading-snug">
            <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
          </h3>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#6CBD45]" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-[#6CBD45]" />
                <span>{post.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3.5 h-3.5 text-[#6CBD45]" />
                <span>{post.comments || 0}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Button
            asChild
            className="group/btn w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-3 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
          >
            <Link href={`/blogs/${post.slug}`} className="flex items-center justify-center gap-2">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}