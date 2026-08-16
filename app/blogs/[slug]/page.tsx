import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ChevronLeft, Eye, BookOpen, Flame, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import ShareButtons from "@/components/blog/share-buttons"
import { Button } from "@/components/ui/button"
import * as React from "react"
import {
  FALLBACK_BLOGS,
  Blog,
  calculateReadingTime,
  getBlogBySlug,
  formatBlogDate,
  renderMarkdownOrHtml
} from "@/lib/fallbackBlogs"
import { AuthorAvatar, SafeBlogImage } from "@/components/blog/blog-ui-helpers"

interface PageProps {
  params: Promise<{ slug: string }>
}

// 1. Fetch blog data with resilient FALLBACK_BLOGS backup
async function getBlog(slug: string): Promise<Blog | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      cache: "no-store"
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.title) {
        return data
      }
    }
  } catch (error) {
    console.warn(`API lookup failed for blog slug "${slug}", falling back to seed dataset:`, error)
  }

  // Resilient fallback lookup from FALLBACK_BLOGS
  const fallback = getBlogBySlug(slug)
  return fallback || null
}

// 2. Generate Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return {
      title: "Blog Not Found | Genesis Incubator"
    }
  }

  return {
    title: `${blog.title} | Genesis Incubator`,
    description: blog.excerpt || "Read the latest insights from Genesis Incubator",
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.title,
      images: blog.image_url ? [{ url: blog.image_url }] : [],
      type: "article",
      publishedTime: blog.published_at || blog.created_at,
      authors: [blog.author]
    }
  }
}

// 3. Main Blog Reader Page Component
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const blog = await getBlog(slug)

  // Handle missing blog post with 404 UI
  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-24 text-center max-w-2xl">
          <div className="p-12 bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20" />
            <div className="w-16 h-16 bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 rounded-3xl mx-auto flex items-center justify-center text-[#6CBD45]">
              <BookOpen className="w-8 h-8 text-[#6CBD45]" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Article Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400">
              The article you are looking for does not exist or has been moved.
            </p>
            <Button asChild className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold rounded-2xl px-6 py-3 shadow-lg shadow-[#6CBD45]/25">
              <Link href="/blogs" className="inline-flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to All Blogs
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const readingTime = calculateReadingTime(blog.content || blog.excerpt)
  const publishDate = formatBlogDate(blog.published_at || blog.date || blog.created_at)
  const parsedContent = renderMarkdownOrHtml(blog.content)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        {/* Hero Banner Section */}
        <div className="relative h-[65vh] min-h-[480px] w-full bg-slate-900 dark:bg-[#0B0D12] overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <SafeBlogImage
            src={blog.image_url}
            alt={blog.title}
            priority={true}
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-[#0f1117] dark:via-[#0f1117]/60 dark:to-transparent" />

          {/* Developer Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-4xl space-y-6">
                <Link
                  href="/blogs"
                  className="inline-flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors group bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform text-[#6CBD45]" />
                  Back to Blogs
                </Link>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white border-0 px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md rounded-full">
                    {blog.category || "General"}
                  </Badge>
                  {Boolean(blog.featured) && (
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-bold px-3 py-1 text-xs flex items-center gap-1 rounded-full backdrop-blur-md">
                      <Flame className="w-3.5 h-3.5 fill-emerald-500 dark:fill-emerald-400" />
                      Featured Story
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight drop-shadow-md tracking-tight">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-mono pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <AuthorAvatar
                      authorName={blog.author}
                      avatarUrl={blog.author_avatar}
                      size="sm"
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">{blog.author}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                      <Calendar className="w-3 h-3 text-[#6CBD45]" />
                    </div>
                    <span>{publishDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                      <Clock className="w-3 h-3 text-[#6CBD45]" />
                    </div>
                    <span>{readingTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45]">
                      <Eye className="w-3 h-3 text-[#6CBD45]" />
                    </div>
                    <span>{blog.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout Section */}
        <div className="container mx-auto px-4 lg:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Article Body */}
            <article className="lg:col-span-8">
              {blog.excerpt && (
                <div className="relative overflow-hidden text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 mb-10 leading-relaxed border-l-4 border-[#6CBD45] pl-6 py-5 rounded-r-3xl bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border-y border-r border-slate-200/80 dark:border-slate-800/80 shadow-2xl group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80" />
                  {blog.excerpt}
                </div>
              )}

              {/* Rendered Markdown or HTML Content */}
              <div
                className="prose prose-lg max-w-none 
                  prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-extrabold prose-headings:tracking-tight
                  prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-3
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[#6CBD45] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline 
                  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold 
                  prose-ul:my-6 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:my-2
                  prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-8 prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800
                  prose-blockquote:border-l-4 prose-blockquote:border-[#6CBD45] prose-blockquote:bg-white/80 dark:prose-blockquote:bg-[#141824]/90 prose-blockquote:backdrop-blur-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-slate-800 dark:prose-blockquote:text-slate-200 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />

              <Separator className="my-12 bg-slate-200 dark:bg-slate-800" />

              {/* 3D Glass Social Share Section */}
              <div className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl group hover:border-[#6CBD45]/50 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">
                    Share this article
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Help spread innovative insights to your founder network
                  </p>
                </div>
                <ShareButtons title={blog.title} slug={blog.slug} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Author Card */}
              <Card className="relative overflow-hidden bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl group hover:border-[#6CBD45]/60 hover:-translate-y-1 transition-all duration-500">
                {/* Glowing Top Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_10px_#6CBD45]" />
                
                <CardContent className="p-6 sm:p-7">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#6CBD45]" />
                    About the Author
                  </h3>
                  <div className="flex items-center gap-4">
                    <AuthorAvatar
                      authorName={blog.author}
                      avatarUrl={blog.author_avatar}
                      size="lg"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-[#6CBD45] transition-colors">
                        {blog.author}
                      </h4>
                      <p className="text-xs text-[#6CBD45] font-semibold mt-0.5">
                        Genesis Incubator Specialist
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Incubation CTA Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-[#6CBD45] via-emerald-600 to-[#4ea82b] text-white border-none shadow-2xl rounded-3xl group hover:-translate-y-1 transition-all duration-500">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-white/80 via-white to-white/80 z-20 opacity-80" />
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-black/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 bg-black/15 rounded-full blur-xl pointer-events-none" />

                <CardContent className="p-8 text-center relative z-10 space-y-4">
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Start Your Startup Journey
                  </h3>
                  <p className="text-slate-100 text-sm leading-relaxed">
                    Have a DeepTech, AI, or CleanTech startup idea? Join the Genesis Incubation Program for funding, mentorship, and patent support.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-slate-900 dark:bg-[#0f1117] text-white dark:text-[#6CBD45] hover:bg-slate-800 dark:hover:bg-[#141824] hover:text-white font-bold shadow-lg rounded-2xl py-3.5 border border-white/10 transition-all transform group-hover:scale-[1.02]"
                  >
                    <Link href="/apply" className="flex items-center justify-center gap-2">
                      Apply for Incubation
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recommended / Explore Topics Card */}
              <Card className="relative overflow-hidden bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl group hover:border-[#6CBD45]/50 hover:-translate-y-1 transition-all duration-500">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
                
                <CardContent className="p-6 sm:p-7">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 font-mono">
                    Explore Ecosystem Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Entrepreneurs",
                      "Culture",
                      "Insights",
                      "DeepTech",
                      "Venture Capital",
                      "Sustainability",
                      "Innovation"
                    ].map(tag => (
                      <Link key={tag} href={`/blogs?category=${encodeURIComponent(tag)}`}>
                        <Badge
                          variant="outline"
                          className="bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 hover:bg-[#6CBD45] hover:text-white hover:border-[#6CBD45] cursor-pointer px-3.5 py-1.5 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
