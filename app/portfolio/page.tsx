// app/portfolio/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ExternalLink,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Building2,
  Layers,
  ArrowRight,
  Globe,
  Flame
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

interface PortfolioCompany {
  id: number
  name: string
  category: string
  description: string
  image: string | null
  link: string | null
  status: string
  tags: string[]
  funding: string
  employees: string
  founded: string
}

const FALLBACK_COMPANIES: PortfolioCompany[] = [
  {
    id: 1,
    name: "EcoTech Solutions",
    category: "CleanTech",
    description: "Developing sustainable packaging alternatives from agricultural waste to eliminate single-use plastics and reduce industrial carbon emissions.",
    image: "/1381732341471.png",
    link: "https://ecotech.example.com",
    status: "featured",
    tags: ["Sustainability", "Circular Economy", "B2B"],
    funding: "₹3.5 Cr",
    employees: "18-25",
    founded: "2023"
  },
  {
    id: 2,
    name: "HealthAI Diagnostics",
    category: "HealthTech",
    description: "AI-powered clinical diagnostic tools for non-invasive early detection and automated radiological scan analysis in tier-2/3 hospitals.",
    image: "/4931732341324.jpg",
    link: "https://healthai.example.com",
    status: "featured",
    tags: ["AI/ML", "Healthcare", "Medical Devices"],
    funding: "₹6.2 Cr",
    employees: "30-40",
    founded: "2023"
  },
  {
    id: 3,
    name: "AgriSmart Sensors",
    category: "AgriTech",
    description: "IoT soil sensors, autonomous drone field scouting, and predictive weather analytics for precision farming and yield maximization.",
    image: "/3201732336658.jpg",
    link: "https://agrismart.example.com",
    status: "active",
    tags: ["IoT", "Precision Agriculture", "Smart Hardware"],
    funding: "₹2.8 Cr",
    employees: "12-18",
    founded: "2023"
  },
  {
    id: 4,
    name: "QuantumPay Systems",
    category: "FinTech",
    description: "Next-generation quantum-resistant encryption protocols and instant cross-border settlement rails for regional micro-enterprises.",
    image: "/1561729364662.jpg",
    link: "https://quantumpay.example.com",
    status: "featured",
    tags: ["Cybersecurity", "Fintech", "Blockchain"],
    funding: "₹4.5 Cr",
    employees: "20-30",
    founded: "2024"
  },
  {
    id: 5,
    name: "NeuralMesh Robotics",
    category: "AI & Robotics",
    description: "Autonomous warehouse robotics and computer-vision guidance systems for automated order fulfillment and inventory tracking.",
    image: "/startup-teams.webp",
    link: "https://neuralmesh.example.com",
    status: "active",
    tags: ["Robotics", "Computer Vision", "Automation"],
    funding: "₹8.0 Cr",
    employees: "35-50",
    founded: "2024"
  },
  {
    id: 6,
    name: "EdLearn Adaptive",
    category: "EdTech",
    description: "Hyper-personalized AI tutoring and skill mapping platform for engineering students preparing for competitive tech exams.",
    image: "/gen-ab.jpg",
    link: "https://edlearn.example.com",
    status: "active",
    tags: ["EdTech", "AI Tutors", "B2C"],
    funding: "₹2.1 Cr",
    employees: "15-20",
    founded: "2023"
  },
  {
    id: 7,
    name: "Vortex Cloud Ops",
    category: "SaaS",
    description: "Autonomous multi-cloud cost optimization and Kubernetes cluster autoscale platform for mid-market engineering teams.",
    image: "/4931732341324.jpg",
    link: "https://vortexcloud.example.com",
    status: "active",
    tags: ["DevOps", "Cloud", "SaaS"],
    funding: "₹5.0 Cr",
    employees: "22-28",
    founded: "2024"
  },
  {
    id: 8,
    name: "BioSynth NanoLabs",
    category: "DeepTech",
    description: "Nanotechnology-based targeted drug delivery platforms for oncology therapies developed in partnership with university bio labs.",
    image: "/1381732341471.png",
    link: "https://biosynth.example.com",
    status: "active",
    tags: ["Nanotech", "Pharma", "Biotech"],
    funding: "₹7.5 Cr",
    employees: "25-35",
    founded: "2023"
  }
]

function StartupCardImage({ src, name }: { src: string | null; name: string }) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45]/25 via-emerald-500/20 to-teal-500/25 border border-[#6CBD45]/40 flex items-center justify-center text-[#6CBD45] font-extrabold text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] mb-1.5 transform group-hover:scale-110 transition-transform">
          {initials || <Building2 className="w-7 h-7 text-[#6CBD45]" />}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">{name}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-700"
      onError={() => setImgError(true)}
    />
  )
}

export default function PortfolioPage() {
  const [companies, setCompanies] = useState<PortfolioCompany[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [activeCategory, setActiveCategory] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchPortfolio = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/portfolio/list", { cache: "no-store" })

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`)
        }
        const data = await res.json()

        if (isMounted) {
          const list = Array.isArray(data) && data.length > 0 ? data : FALLBACK_COMPANIES
          setCompanies(list)
          const uniqueCats = Array.from(new Set(list.map((c: PortfolioCompany) => c.category).filter(Boolean)))
          setCategories(["All", ...uniqueCats.sort()])
        }
      } catch (err) {
        console.warn("Portfolio API lookup unready or unavailable, utilizing studio fallback dataset:", err)
        if (isMounted) {
          setCompanies(FALLBACK_COMPANIES)
          const uniqueCats = Array.from(new Set(FALLBACK_COMPANIES.map((c) => c.category)))
          setCategories(["All", ...uniqueCats.sort()])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPortfolio()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredCompanies = useMemo(() => {
    if (activeCategory === "All") return companies
    return companies.filter((c) => c.category === activeCategory)
  }, [activeCategory, companies])

  // Calculate live stats safely
  const totalFunding = useMemo(() => {
    if (!companies.length) return "0.0"
    const sum = companies.reduce((acc, c) => {
      if (!c.funding) return acc
      const str = String(c.funding).trim()
      const match = str.match(/(?:[₹$€]\s*)?([\d.]+)\s*(Cr|Lakh|M|k)?/i)
      if (!match) return acc + 2.0
      let val = parseFloat(match[1]) || 0
      const unit = (match[2] || "").toLowerCase()
      if (unit === "lakh") val = val / 100
      return acc + val
    }, 0)
    return sum.toFixed(1)
  }, [companies])

  const totalJobs = useMemo(() => {
    if (!companies.length) return 0
    return companies.reduce((acc, c) => {
      if (!c.employees) return acc + 20
      const str = String(c.employees).trim()
      const match = str.match(/(\d+)\s*[–-—]?\s*(\d+)?/)
      if (match) {
        const low = parseInt(match[1], 10)
        const high = match[2] ? parseInt(match[2], 10) : low
        return acc + Math.round((low + high) / 2)
      }
      return acc + 20
    }, 0)
  }, [companies])

  const cohortSuccessRate = useMemo(() => {
    if (!companies.length) return 85
    const activeCount = companies.filter((c) =>
      !c.status || ["active", "featured", "graduated", "scaled"].includes(c.status.toLowerCase())
    ).length
    return Math.max(85, Math.round((activeCount / companies.length) * 100))
  }, [companies])

  const handleLearnMore = (company: PortfolioCompany) => {
    if (!company.link || company.link === "#") {
      window.location.href = `/contact?ref=${encodeURIComponent(company.name)}`
      return
    }
    if (company.link.startsWith("http://") || company.link.startsWith("https://")) {
      window.open(company.link, "_blank", "noopener,noreferrer")
    } else {
      window.location.href = company.link
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0B0D12] dark:via-[#0f1117] dark:to-[#141824] overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6CBD45]/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#6CBD45]/10 blur-[110px] rounded-full pointer-events-none" />

        {/* Developer Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(108,189,69,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              Incubator Portfolio Showcase
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-lime-300">Success Stories</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover the high-growth tech ventures, innovations, and startups nurtured under the Genesis - QUIC incubation ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Live Stats Dashboard Banner - Android Fluid Grid */}
      <section className="py-12 bg-white dark:bg-[#0B0D12] border-y border-slate-200 dark:border-slate-800/80 relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl dark:hover:shadow-[0_15px_30px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#6CBD45] transition-colors">
                {loading ? <Skeleton className="h-10 w-20 inline-block bg-slate-200 dark:bg-slate-800" /> : `${companies.length}+`}
              </div>
              <div className="text-[#6CBD45] font-mono font-semibold uppercase tracking-wider text-xs sm:text-sm">
                Portfolio Startups
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl dark:hover:shadow-[0_15px_30px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#6CBD45] transition-colors">
                {loading ? <Skeleton className="h-10 w-20 inline-block bg-slate-200 dark:bg-slate-800" /> : `₹${totalFunding} Cr+`}
              </div>
              <div className="text-[#6CBD45] font-mono font-semibold uppercase tracking-wider text-xs sm:text-sm">
                Funding Raised
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl dark:hover:shadow-[0_15px_30px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#6CBD45] transition-colors">
                {loading ? <Skeleton className="h-10 w-20 inline-block bg-slate-200 dark:bg-slate-800" /> : `${totalJobs}+`}
              </div>
              <div className="text-[#6CBD45] font-mono font-semibold uppercase tracking-wider text-xs sm:text-sm">
                Jobs Created
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl dark:hover:shadow-[0_15px_30px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#6CBD45] transition-colors">
                {loading ? <Skeleton className="h-10 w-20 inline-block bg-slate-200 dark:bg-slate-800" /> : `${cohortSuccessRate}%`}
              </div>
              <div className="text-[#6CBD45] font-mono font-semibold uppercase tracking-wider text-xs sm:text-sm">
                Cohort Success Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Filter */}
      <section className="py-6 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-md sticky top-20 z-20 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white shadow-lg shadow-[#6CBD45]/25 border border-[#6CBD45]"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid - Android Mobile Fluid Grid Layout */}
      <section className="py-20 bg-slate-50 dark:bg-[#0f1117] min-h-[60vh] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/80 dark:bg-[#141824]/90 border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
                  <Skeleton className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-t-3xl" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-slate-600 dark:text-slate-400 text-lg">
              No portfolio companies found in <span className="text-[#6CBD45] font-semibold">{activeCategory}</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.25)] transition-all duration-500 hover:-translate-y-2 group flex flex-col rounded-3xl overflow-hidden relative"
                >
                  {/* Glowing Top Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />

                  <div className="relative h-52 bg-slate-900 overflow-hidden flex items-center justify-center">
                    <StartupCardImage src={company.image} name={company.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#141824] via-transparent to-transparent opacity-90 pointer-events-none" />

                    {/* 3D Category & Status Badges */}
                    <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md border border-white/20 uppercase tracking-wider">
                      {company.category}
                    </Badge>
                    {company.status === "featured" && (
                      <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-md border border-white/20 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6 bg-white/80 dark:bg-[#141824]/90">
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors leading-tight">
                        {company.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {company.description}
                      </p>
                      {company.tags && company.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {company.tags.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
                      <div className="bg-slate-100/80 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner group-hover/item:border-[#6CBD45]/40 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Funding Raised</div>
                        <div className="font-bold text-[#6CBD45] text-sm mt-0.5">{company.funding}</div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner group-hover/item:border-[#6CBD45]/40 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Founded Year</div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{company.founded}</div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner group-hover/item:border-[#6CBD45]/40 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Team Members</div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{company.employees}</div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner group-hover/item:border-[#6CBD45]/40 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Current Stage</div>
                        <div className="font-bold text-[#6CBD45] text-sm mt-0.5 capitalize">
                          {company.status}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] text-white hover:brightness-110 shadow-lg shadow-[#6CBD45]/20 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all transform group-hover:scale-[1.02] cursor-pointer"
                      onClick={() => handleLearnMore(company)}
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Success Metrics Section - Android Fluid Grid */}
      <section className="py-20 bg-white dark:bg-[#0B0D12] border-t border-slate-200 dark:border-slate-800/80 relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-[#6CBD45]" />
              Ecosystem Track Record
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">Portfolio Performance</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Our portfolio companies continue to scale, attract institutional investment, and drive disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-8 bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.2)] transition-all duration-500 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_10px_#6CBD45]" />
              <CardContent className="space-y-4 pt-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6CBD45]/25 via-emerald-500/20 to-teal-500/25 border border-[#6CBD45]/40 rounded-3xl mx-auto flex items-center justify-center text-[#6CBD45] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_25px_rgba(108,189,69,0.2)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <TrendingUp className="w-9 h-9 text-[#6CBD45]" />
                </div>
                <h3 className="font-extrabold text-4xl text-slate-900 dark:text-white">300%</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Average Annual Revenue Growth</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.2)] transition-all duration-500 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_10px_#6CBD45]" />
              <CardContent className="space-y-4 pt-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6CBD45]/25 via-emerald-500/20 to-teal-500/25 border border-[#6CBD45]/40 rounded-3xl mx-auto flex items-center justify-center text-[#6CBD45] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_25px_rgba(108,189,69,0.2)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Users className="w-9 h-9 text-[#6CBD45]" />
                </div>
                <h3 className="font-extrabold text-4xl text-slate-900 dark:text-white">5M+</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Customers & Users Served</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 bg-white/80 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.2)] transition-all duration-500 rounded-3xl backdrop-blur-xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_10px_#6CBD45]" />
              <CardContent className="space-y-4 pt-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6CBD45]/25 via-emerald-500/20 to-teal-500/25 border border-[#6CBD45]/40 rounded-3xl mx-auto flex items-center justify-center text-[#6CBD45] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_25px_rgba(108,189,69,0.2)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Award className="w-9 h-9 text-[#6CBD45]" />
                </div>
                <h3 className="font-extrabold text-4xl text-slate-900 dark:text-white">15+</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">National Innovation Awards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0f1117] dark:to-[#0B0D12] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto bg-white/80 dark:bg-[#141824]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-[#6CBD45]/30 rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl dark:shadow-[0_0_50px_rgba(108,189,69,0.15)] group hover:border-[#6CBD45]/60 transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_12px_#6CBD45]" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#6CBD45]/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 relative z-10">
              Want to Join Our Portfolio?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
              Apply to the Genesis Incubator cohort today and receive seed funding support, 1-on-1 mentorship, lab access, and VC connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] text-white hover:brightness-110 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#6CBD45]/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                <Link href="/apply">
                  Apply for Incubation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}