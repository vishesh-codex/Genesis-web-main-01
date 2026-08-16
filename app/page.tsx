"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  Rocket,
  Users,
  Lightbulb,
  Target,
  Award,
  ChevronDown,
  Calendar,
  Eye,
  MessageCircle,
  Building,
  TrendingUp,
  Sparkles,
  Quote,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("startup-teams")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const leadershipMessages = [
    {
      quote:
        "I am privileged to lead Genesis in its mission to nurture ideas into impactful ventures. We are committed to fostering innovation, empowering entrepreneurs, and creating opportunities for meaningful change. Together, we are shaping a brighter future.",
      name: "Mr. Ajay Goyal",
      title: "Chairman - Quantum University",
      image: "/Mr_Ajay_Goyal.jpg?height=96&width=96",
    },
    {
      quote:
        "At Quantum University, we believe education and entrepreneurship go hand in hand. Genesis stands as a platform where knowledge meets innovation, empowering young minds to transform their ideas into impactful ventures. Together, we are building leaders of tomorrow.",
      name: "Prof. Vivek Kumar",
      title: "Vice Chancellor - Quantum University",
      image: "/Prof_Vivek_Kumar.jpeg?height=96&width=96",
    },
    {
      quote:
        "At Genesis, we nurture ideas into impactful ventures. Our goal is to inspire innovation, foster collaboration, and empower changemakers. Join us to create a brighter future together.",
      name: "Mr. Shobhit Goyal",
      title: "Vice Chairman - Quantum University",
      image: "/Mr_Shobhit_Goyal.jpg?height=96&width=96",
    },
    {
      quote:
        "The entrepreneurial journey is challenging, but with the right guidance and support, every obstacle becomes an opportunity. Genesis provides that crucial bridge between innovative ideas and successful ventures, helping entrepreneurs navigate their path to success.",
      name: "Mr. Varun Tiwari",
      title: "CEO - Genesis Incubation",
      image: "/Mr_Varun_Tiwari.jpg?height=96&width=96",
    },
  ]

  useEffect(() => {
    if (!api) return
    
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap())
    })

    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [api])

  const handleFAQToggle = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-[#6CBD45] selection:text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0f1117] dark:via-slate-900 dark:to-[#1a2d1a] relative overflow-hidden transition-colors duration-300 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Glow Blobs */}
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#6CBD45]/20 blur-3xl rounded-full -translate-y-1/2 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 shadow-[0_0_20px_rgba(108,189,69,0.15)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>THE GENESIS - QUIC ECOSYSTEM</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                  The Genesis
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-500">Empowering</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-teal-400">Innovators</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  At Genesis Incubator, we foster groundbreaking ideas and nurture entrepreneurial talent from concept to venture creation.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none font-extrabold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]">
                  <Link href="/apply" className="flex items-center gap-2">
                    <span>Apply for Incubation</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-800 dark:text-slate-200 hover:bg-[#6CBD45] hover:border-[#6CBD45] hover:text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-0.5 shadow-sm">
                  <Link href="#about" className="flex items-center gap-2">
                    <span>Explore Programs</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Hero Floating Quick Cards Row */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "50+ Startups", subtitle: "Incubated Cohorts", icon: Rocket, gradient: "from-[#6CBD45] to-emerald-600" },
                  { title: "₹5 Cr+ Raised", subtitle: "Seed & Grants", icon: TrendingUp, gradient: "from-emerald-500 to-teal-600" },
                  { title: "100+ Mentors", subtitle: "1-on-1 Guidance", icon: Award, gradient: "from-teal-500 to-green-600" }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div key={idx} className="group relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6CBD45]/15 hover:border-[#6CBD45]/50 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6CBD45] to-emerald-500 opacity-60 group-hover:opacity-100 transition-all rounded-t-3xl" />
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0 transition-transform duration-300 group-hover:scale-110", item.gradient)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hero Showcase Card */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-300 pointer-events-none" />
              <div className="relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 shadow-2xl overflow-hidden hover:border-[#6CBD45]/50 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-[#6CBD45] to-emerald-500 opacity-80 group-hover:opacity-100 transition-all rounded-t-3xl shadow-[0_2px_12px_#6CBD45]" />
                <Image
                  src="/1561729364662.jpg?height=500&width=600"
                  alt="Genesis Innovation Showcase"
                  width={600}
                  height={500}
                  className="rounded-2xl object-cover w-full h-auto shadow-md transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/80 dark:bg-[#0f1117]/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#6CBD45] animate-pulse shadow-[0_0_10px_#6CBD45]" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Flagship Innovation Hub</span>
                  </div>
                  <Badge className="bg-[#6CBD45] text-white rounded-full px-3 py-0.5 text-xs">Section 8</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section - Infinite Auto-Scrolling Marquee Loop */}
      <section className="py-14 bg-slate-100/60 dark:bg-[#0d0f14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 relative overflow-hidden group/marquee">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#6CBD45]/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Side Fade Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-100 dark:from-[#0d0f14] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-100 dark:from-[#0d0f14] to-transparent z-20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <Badge className="px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full shadow-[0_0_15px_rgba(108,189,69,0.15)]">
              TRUSTED ECOSYSTEM PARTNERS
            </Badge>
          </div>

          <div className="overflow-hidden w-full">
            <div className="animate-partner-marquee flex items-center gap-6 lg:gap-8">
              {[
                { src: "/headstart-logo.png", alt: "Headstart Logo" },
                { src: "/women_innovator.svg", alt: "SHARDA Logo" },
                { src: "/adif_logo.svg", alt: "ADIF Logo" },
                { src: "/sarda_logo.png", alt: "LAUNCHPAD Logo" },
                { src: "/quantum_logo.png", alt: "Quantum University Logo" },
                { src: "/startup_uttrakhand_logo.svg", alt: "Startup Uttarakhand Logo" },
                // Duplicated for seamless infinite 360 loop
                { src: "/headstart-logo.png", alt: "Headstart Logo" },
                { src: "/women_innovator.svg", alt: "SHARDA Logo" },
                { src: "/adif_logo.svg", alt: "ADIF Logo" },
                { src: "/sarda_logo.png", alt: "LAUNCHPAD Logo" },
                { src: "/quantum_logo.png", alt: "Quantum University Logo" },
                { src: "/startup_uttrakhand_logo.svg", alt: "Startup Uttarakhand Logo" },
              ].map((partner, index) => (
                <div
                  key={index}
                  className="group relative rounded-2xl bg-white dark:bg-white p-3.5 sm:p-4 px-6 border border-slate-200/90 shadow-md hover:shadow-xl hover:shadow-[#6CBD45]/20 hover:-translate-y-1 hover:border-[#6CBD45]/60 transition-all duration-300 flex items-center justify-center min-w-[150px] sm:min-w-[180px] h-16 sm:h-18 shrink-0 cursor-pointer"
                >
                  <img
                    src={partner.src}
                    alt={partner.alt}
                    className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Cards Section */}
      <section className="py-20 lg:py-24 bg-slate-100/80 dark:bg-[#0B0D12] relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#6CBD45]/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14 max-w-3xl mx-auto space-y-4">
            <Badge className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full dark:bg-[#6CBD45]/20 dark:text-[#7ee852]">
              Track Record & Growth
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Genesis by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-teal-400">Numbers</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Empowering visionary founders with capital, mentorship, and institutional resources to build high-impact market leaders.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[
              {
                stat: "50+",
                label: "Startups Incubated",
                subtext: "Across DeepTech, AI, EdTech & Agritech",
                icon: Rocket,
                gradient: "from-[#6CBD45] via-[#5ba83a] to-emerald-600",
                glow: "shadow-[#6CBD45]/30",
                barGlow: "from-green-400 via-[#6CBD45] to-emerald-500",
              },
              {
                stat: "₹5 Cr+",
                label: "Seed Funds Raised",
                subtext: "Government grants & angel investments",
                icon: TrendingUp,
                gradient: "from-emerald-500 via-[#6CBD45] to-teal-600",
                glow: "shadow-emerald-500/30",
                barGlow: "from-emerald-400 via-[#6CBD45] to-teal-400",
              },
              {
                stat: "100+",
                label: "Industry Mentors",
                subtext: "Active founders & domain experts",
                icon: Users,
                gradient: "from-teal-500 via-[#6CBD45] to-green-600",
                glow: "shadow-teal-500/30",
                barGlow: "from-teal-400 via-[#6CBD45] to-green-500",
              },
              {
                stat: "25+",
                label: "Patents & IPR",
                subtext: "Intellectual property & innovations",
                icon: Award,
                gradient: "from-[#6CBD45] via-green-500 to-emerald-700",
                glow: "shadow-green-500/30",
                barGlow: "from-green-400 via-[#6CBD45] to-emerald-600",
              },
            ].map((card, idx) => {
              const IconComponent = card.icon
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6CBD45]/20 hover:border-[#6CBD45]/50 overflow-hidden"
                >
                  {/* Glowing Top Accent Bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-all duration-300 rounded-t-3xl shadow-[0_2px_12px_#6CBD45]",
                      card.barGlow
                    )}
                  />

                  {/* Ambient Glow Blob */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6CBD45]/10 rounded-full blur-2xl group-hover:bg-[#6CBD45]/25 transition-all duration-500 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      {/* 3D Gradient Icon Badge */}
                      <div className="relative group/icon">
                        <div className={cn("absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-40 blur-md group-hover:opacity-80 transition duration-500 pointer-events-none", card.barGlow)} />
                        <div
                          className={cn(
                            "relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                            card.gradient,
                            card.glow,
                            "[box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),0_8px_20px_-4px_rgba(108,189,69,0.4)]"
                          )}
                        >
                          <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      </div>
                    </div>

                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors">
                      {card.stat}
                    </div>
                    <div className="font-bold text-sm sm:text-lg text-slate-800 dark:text-slate-100 mb-1 sm:mb-2">
                      {card.label}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {card.subtext}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors">
                    <span className="font-medium tracking-wide">Verified Impact</span>
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#6CBD45] group-hover:shadow-[0_0_8px_#6CBD45] transition-all duration-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Leadership Messages Carousel */}
      <section className="py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#0f1117] relative transition-colors duration-300 border-b border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#6CBD45]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto space-y-3">
            <Badge className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full dark:bg-[#6CBD45]/20 dark:text-[#7ee852]">
              Leadership Vision
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Guided by Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] to-emerald-500">Pioneers</span>
            </h2>
          </div>

          <Carousel 
            opts={{ loop: true, align: "center" }}
            setApi={setApi}
            className="max-w-4xl mx-auto relative py-4"
          >
            <CarouselContent>
              {leadershipMessages.map((message, index) => (
                <CarouselItem key={index} className="px-3 sm:px-4">
                  {/* Ultra-Premium 3D Glassmorphic Leadership Card */}
                  <div className="group relative rounded-3xl bg-white/70 dark:bg-[#141824]/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-12 shadow-2xl hover:border-[#6CBD45]/50 hover:shadow-2xl hover:shadow-[#6CBD45]/20 transition-all duration-500 overflow-hidden text-center">
                    {/* Top Accent Glowing Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-[#6CBD45] to-emerald-500 opacity-80 group-hover:opacity-100 transition-all rounded-t-3xl shadow-[0_2px_12px_#6CBD45]" />
                    
                    {/* Ambient Background Glow */}
                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#6CBD45]/10 rounded-full blur-3xl group-hover:bg-[#6CBD45]/20 transition-all duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                      {/* Avatar Wrapper with 3D Glowing Gradient Border */}
                      <div className="mb-6 relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#6CBD45] via-emerald-400 to-teal-400 shadow-[0_0_20px_rgba(108,189,69,0.35)] relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <Image
                            src={message.image || "/placeholder.svg"}
                            alt={message.name}
                            width={112}
                            height={112}
                            className="rounded-full object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-[#6CBD45] to-emerald-600 flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-[#141824]">
                          <Quote className="w-4 h-4 fill-white" />
                        </div>
                      </div>

                      {/* Quote Text */}
                      <blockquote className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-6 italic font-light max-w-2xl">
                        "{message.quote}"
                      </blockquote>

                      {/* Leader Name & Title */}
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{message.name}</div>
                      <div className="text-[#6CBD45] dark:text-[#7ee852] font-semibold text-sm sm:text-base mt-1">{message.title}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Carousel indicators */}
            <div className="flex justify-center space-x-3 mt-8">
              {leadershipMessages.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    currentSlide === index ? "bg-[#6CBD45] w-9 shadow-[0_0_12px_rgba(108,189,69,0.6)]" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 w-2.5",
                  )}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* About Genesis - QUIC */}
      <section id="about" className="py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#0f1117] relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            <div className="space-y-6">
              <Badge className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full">
                Incubation Ecosystem
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] to-emerald-500">Genesis - QUIC</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                The Genesis Quantum University Innovation Council (QUIC) fosters research, innovation, and
                entrepreneurship, supporting startups from students, faculty, alumni, and external founders. It is a Section 8
                company promoting a professional entrepreneurial environment.
              </p>
              <Button asChild variant="outline" className="border-[#6CBD45] text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white bg-transparent rounded-2xl px-6 py-3 font-semibold transition-all shadow-sm">
                <Link href="/about" className="flex items-center gap-2">
                  <span>Learn more about QUIC</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* About Image 3D Glassmorphic Card */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#6CBD45] to-emerald-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-45 transition duration-500" />
              <div className="relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 shadow-2xl overflow-hidden hover:border-[#6CBD45]/50 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-[#6CBD45] to-emerald-500 opacity-80 group-hover:opacity-100 transition-all rounded-t-3xl shadow-[0_2px_12px_#6CBD45]" />
                <Image
                  src="/gen-ab.jpg?height=400&width=500"
                  alt="About Genesis"
                  width={500}
                  height={400}
                  className="rounded-2xl object-cover w-full h-auto shadow-md transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Four Pillars */}
          <div className="mt-20">
            <div className="mb-12 text-center space-y-3">
              <Badge className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full dark:bg-[#6CBD45]/20 dark:text-[#7ee852]">
                Core Architecture
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                The Four Pillars of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] to-emerald-500">Genesis</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[
                {
                  id: "innovative",
                  title: "Innovative",
                  description: "Creation of innovative technology ventures driving disruptive real-world impact.",
                  icon: Lightbulb,
                  gradient: "from-[#6CBD45] via-[#5ba83a] to-emerald-600",
                  glow: "shadow-[#6CBD45]/30",
                  barGlow: "from-green-400 via-[#6CBD45] to-emerald-500",
                },
                {
                  id: "expert",
                  title: "Expert Knowledge",
                  description: "Harness global knowledge, thought leadership and deep entrepreneurship experience.",
                  icon: Award,
                  gradient: "from-emerald-500 via-[#6CBD45] to-teal-600",
                  glow: "shadow-emerald-500/30",
                  barGlow: "from-emerald-400 via-[#6CBD45] to-teal-400",
                },
                {
                  id: "mentorship",
                  title: "Mentorship",
                  description: "Mentoring by in-house faculty & industry experts for budding entrepreneurs and alumni.",
                  icon: Users,
                  gradient: "from-teal-500 via-[#6CBD45] to-green-600",
                  glow: "shadow-teal-500/30",
                  barGlow: "from-teal-400 via-[#6CBD45] to-green-500",
                },
                {
                  id: "collaboration",
                  title: "Collaboration",
                  description: "Collaborating with Incubators, Angel Funds, VC Firms and Government Schemes.",
                  icon: Target,
                  gradient: "from-[#6CBD45] via-green-500 to-emerald-700",
                  glow: "shadow-green-500/30",
                  barGlow: "from-green-400 via-[#6CBD45] to-emerald-600",
                },
              ].map((pillar) => {
                const IconComponent = pillar.icon
                return (
                  <div
                    key={pillar.id}
                    className="group relative rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6CBD45]/20 hover:border-[#6CBD45]/50 overflow-hidden"
                  >
                    {/* Glowing Top Accent Bar */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-all duration-300 rounded-t-3xl shadow-[0_2px_12px_#6CBD45]",
                        pillar.barGlow
                      )}
                    />

                    {/* Ambient Glow Blob */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6CBD45]/10 rounded-full blur-2xl group-hover:bg-[#6CBD45]/25 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="relative group/icon">
                          <div className={cn("absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-40 blur-md group-hover:opacity-80 transition duration-500 pointer-events-none", pillar.barGlow)} />
                          <div
                            className={cn(
                              "relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                              pillar.gradient,
                              pillar.glow,
                              "[box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),0_8px_20px_-4px_rgba(108,189,69,0.4)]"
                            )}
                          >
                            <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-base sm:text-xl text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors duration-300">
                        {pillar.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors">
                      <span className="font-medium tracking-wide">Core Pillar</span>
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#6CBD45] group-hover:shadow-[0_0_8px_#6CBD45] transition-all duration-300" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Startup Teams Section */}
      <section className="py-20 lg:py-24 bg-slate-100/70 dark:bg-[#0B0D12] relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            <Button
              onClick={() => setActiveTab("startup-teams")}
              className={cn(
                "px-6 py-3.5 rounded-2xl transition-all font-semibold text-sm sm:text-base border border-slate-300 dark:border-slate-800 shadow-sm",
                activeTab === "startup-teams"
                  ? "bg-gradient-to-r from-[#6CBD45] to-emerald-500 text-white shadow-lg shadow-[#6CBD45]/30 border-[#6CBD45]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-[#141824]/80 backdrop-blur-md",
              )}
            >
              <Users className="w-5 h-5 mr-2" />
              Startup Teams
            </Button>
            <Button
              onClick={() => setActiveTab("mentors")}
              className={cn(
                "px-6 py-3.5 rounded-2xl transition-all font-semibold text-sm sm:text-base border border-slate-300 dark:border-slate-800 shadow-sm",
                activeTab === "mentors"
                  ? "bg-gradient-to-r from-[#6CBD45] to-emerald-500 text-white shadow-lg shadow-[#6CBD45]/30 border-[#6CBD45]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-[#141824]/80 backdrop-blur-md",
              )}
            >
              <Building className="w-5 h-5 mr-2" />
              Mentors
            </Button>
            <Button
              onClick={() => setActiveTab("advisors")}
              className={cn(
                "px-6 py-3.5 rounded-2xl transition-all font-semibold text-sm sm:text-base border border-slate-300 dark:border-slate-800 shadow-sm",
                activeTab === "advisors"
                  ? "bg-gradient-to-r from-[#6CBD45] to-emerald-500 text-white shadow-lg shadow-[#6CBD45]/30 border-[#6CBD45]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-[#141824]/80 backdrop-blur-md",
              )}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Advisors
            </Button>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {activeTab === "startup-teams" && (
              <>
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#6CBD45] to-emerald-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition duration-500" />
                  <div className="relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden hover:border-[#6CBD45]/50 transition-all duration-500">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-[#6CBD45] to-emerald-500 opacity-80 group-hover:opacity-100 transition-all rounded-t-3xl shadow-[0_2px_12px_#6CBD45]" />
                    <Image
                      src="/startup-teams.webp"
                      alt="Startup team working together"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-2xl object-cover shadow-md transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <Badge className="px-3.5 py-1 text-xs font-semibold bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full">
                    Team Management
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Startup Teams & Cohorts</h2>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: "Combine teammate schedules",
                        desc: "Synchronize founder availability, mentor check-ins, and incubator milestones seamlessly.",
                        id: 0
                      },
                      {
                        title: "Factor in outside colleagues",
                        desc: "Integrate external advisors and venture mentors seamlessly into your startup workspace.",
                        id: 1
                      },
                      {
                        title: "Round robin pooling",
                        desc: "Implement fair distribution of mentor hours and investor intro slots among cohort founders.",
                        id: 2
                      }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleFAQToggle(item.id)}
                        className="group relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 cursor-pointer transition-all duration-300 hover:border-[#6CBD45]/50 hover:shadow-xl hover:shadow-[#6CBD45]/10 text-slate-900 dark:text-white overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6CBD45] to-emerald-500 opacity-0 group-hover:opacity-100 transition-all rounded-l-3xl shadow-[0_0_10px_#6CBD45]" />
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors">
                            {item.title}
                          </h3>
                          <ChevronDown
                            className={cn(
                              "w-5 h-5 text-[#6CBD45] transition-transform duration-300 shrink-0",
                              expandedFAQ === item.id && "rotate-180",
                            )}
                          />
                        </div>
                        {expandedFAQ === item.id && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {item.desc}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button asChild className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white px-8 py-3.5 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none font-extrabold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]">
                    <Link href="/apply" className="flex items-center gap-2">
                      <span>Apply for Incubation</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {activeTab === "mentors" && (
              <div className="col-span-2 space-y-6 text-center max-w-3xl mx-auto py-8">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#6CBD45] to-emerald-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-[#6CBD45]/25">
                  <Building className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Mentors Network</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Our network of 100+ experienced mentors provides 1-on-1 guidance to startups, bringing deep industry knowledge and scaling experience.
                </p>
                <Button asChild className="bg-gradient-to-r from-[#6CBD45] to-emerald-500 hover:from-[#5ba83a] hover:to-emerald-600 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-[#6CBD45]/25 font-bold">
                  <Link href="/apply/mentor">Become a Mentor</Link>
                </Button>
              </div>
            )}

            {activeTab === "advisors" && (
              <div className="col-span-2 space-y-6 text-center max-w-3xl mx-auto py-8">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/25">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Advisory Council</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Our advisors guide startups on strategic roadmap, corporate partnerships, legal IPR, and institutional fundraising.
                </p>
                <Button asChild className="bg-gradient-to-r from-[#6CBD45] to-emerald-500 hover:from-[#5ba83a] hover:to-emerald-600 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-[#6CBD45]/25 font-bold">
                  <Link href="/contact">Partner With Us</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News & Views Showcase */}
      <section id="blogs" className="py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#0f1117] transition-colors duration-300 border-b border-slate-200 dark:border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-14 gap-6">
            <div className="text-center md:text-left space-y-2">
              <Badge className="px-3.5 py-1 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full">
                Insights & Updates
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                News & Views from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] to-emerald-500">Community</span>
              </h2>
            </div>
            <Button asChild className="bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white hover:bg-[#6CBD45] hover:text-white border border-slate-300 dark:border-slate-700 backdrop-blur-md rounded-2xl px-6 py-3 font-semibold shadow-sm transition-all">
              <Link href="/blogs" className="flex items-center gap-2">
                <span>View All Blogs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "A beginner's guide to pitch startup ideas to investors",
                author: "Varun Tiwari",
                category: "Entrepreneurs",
                image: "/1381732341471.png?height=200&width=400",
                views: "6941",
                comments: "3",
                date: "Nov 23, 2024"
              },
              {
                title: "How to use storytelling to build your startup's culture",
                author: "Varun Tiwari",
                category: "Entrepreneurs",
                image: "/4931732341324.jpg?height=200&width=400",
                views: "6941",
                comments: "3",
                date: "Nov 23, 2024"
              },
              {
                title: "Most Entrepreneurs Start Later in Life Than You Think",
                author: "Varun Tiwari",
                category: "Entrepreneurs",
                image: "/3201732336658.jpg?height=200&width=400",
                views: "6941",
                comments: "3",
                date: "Nov 23, 2024"
              }
            ].map((blog, idx) => (
              <div key={idx} className="group relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:-translate-y-2.5 hover:shadow-2xl hover:shadow-[#6CBD45]/20 transition-all duration-500 overflow-hidden text-slate-900 dark:text-white flex flex-col justify-between">
                {/* Glowing Top Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-teal-400 opacity-70 group-hover:opacity-100 transition-all rounded-t-3xl shadow-[0_2px_12px_#6CBD45]" />
                
                <div className="relative overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={400}
                    height={200}
                    className="w-full h-52 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-[#6CBD45] text-white font-semibold shadow-md rounded-full px-3 py-1 text-xs">
                      BY: {blog.author}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-600 text-white font-semibold shadow-md rounded-full px-3 py-1 text-xs">
                      {blog.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <h3 className="font-extrabold text-lg sm:text-xl mb-4 text-slate-900 dark:text-white group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors leading-snug">
                    {blog.title}
                  </h3>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <Eye className="w-4 h-4 text-[#6CBD45]" />
                        <span>{blog.views}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MessageCircle className="w-4 h-4 text-[#6CBD45]" />
                        <span>{blog.comments}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-[#6CBD45]" />
                      <span>{blog.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#0f1117] border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <Badge className="px-3.5 py-1 text-xs font-semibold uppercase tracking-widest bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 rounded-full">
                Help & Information
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] to-emerald-500">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 3,
                  q: "Who is eligible to apply for incubation at The Genesis - QUIC?",
                  a: "Students, faculty, alumni of Quantum University, and external applicants from outside the institution are eligible to apply. The program is open to anyone with an innovative idea or startup looking for incubation support."
                },
                {
                  id: 4,
                  q: "How do I apply for incubation at QUIC?",
                  a: "You can apply for incubation by visiting our 'Apply' page and filling out the relevant application form. Our team will review your submission and get in touch for the next steps."
                },
                {
                  id: 5,
                  q: "What kind of support does QUIC provide to startups?",
                  a: "QUIC provides comprehensive support including mentorship, access to funding networks, co-working space, technical guidance, workshops, and networking opportunities with industry experts and investors."
                }
              ].map((faq) => (
                <div
                  key={faq.id}
                  onClick={() => handleFAQToggle(faq.id)}
                  className="group relative rounded-3xl bg-white/70 dark:bg-[#141824]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 cursor-pointer transition-all duration-300 hover:border-[#6CBD45]/60 hover:shadow-xl hover:shadow-[#6CBD45]/10 text-slate-900 dark:text-white overflow-hidden shadow-sm"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6CBD45] to-emerald-500 opacity-0 group-hover:opacity-100 transition-all rounded-l-3xl shadow-[0_0_10px_#6CBD45]" />
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#6CBD45] dark:group-hover:text-[#7ee852] transition-colors">
                      {faq.q}
                    </h3>
                    <ChevronDown
                      className={cn("w-5 h-5 text-[#6CBD45] transition-transform duration-300 shrink-0", expandedFAQ === faq.id && "rotate-180")}
                    />
                  </div>
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-slate-600 dark:text-slate-400 text-base">
                Still have a question?{" "}
                <Link href="/contact" className="text-[#6CBD45] hover:text-emerald-500 underline font-bold transition-colors">
                  Contact Our Team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#6CBD45] via-emerald-600 to-green-700 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="relative w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 mx-auto flex items-center justify-center shadow-2xl [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_20px_-4px_rgba(0,0,0,0.2)]">
              <Rocket className="w-10 h-10 text-white filter drop-shadow-md" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              The Genesis - Quantum University Innovation Council
            </h2>
            
            <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto font-light leading-relaxed">
              Transform your groundbreaking research and ideas into market-ready ventures with our comprehensive incubation support.
            </p>
            
            <Button size="lg" className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white px-10 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border border-white/20 font-extrabold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]">
              <Link href="/apply" className="flex items-center gap-2">
                <span>Apply for Incubation</span>
                <ArrowRight className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
