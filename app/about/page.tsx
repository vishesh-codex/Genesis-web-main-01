"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Target,
  Lightbulb,
  Building,
  Globe,
  TrendingUp,
  Sparkles,
  Award,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Compass,
  Zap,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-white flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0f1117] dark:via-slate-900 dark:to-[#1a2d1a] overflow-hidden border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        {/* Glow Blobs & Grid Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6CBD45]/15 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 shadow-[0_0_20px_rgba(108,189,69,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE GENESIS - QUIC ECOSYSTEM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] dark:from-[#6CBD45] dark:via-emerald-400 dark:to-[#80d853]">Genesis - QUIC</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              The Genesis Quantum University Innovation Council (QUIC) is a pioneering Section 8 flagship incubator. 
              We empower student innovators, researchers, and visionary entrepreneurs to convert groundbreaking research into high-impact commercial ventures.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:from-[#5ba83a] hover:to-[#4f9630] text-white px-8 py-3.5 rounded-xl shadow-lg shadow-[#6CBD45]/25 border-none font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                <Link href="/apply" className="flex items-center gap-2">
                  <span>Explore Incubation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-[#6CBD45] hover:border-[#6CBD45] hover:text-white dark:hover:bg-[#6CBD45] dark:hover:border-[#6CBD45] px-8 py-3.5 rounded-xl transition-all duration-300 font-semibold shadow-md">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white dark:bg-[#0d0f14] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission Card */}
            <div className="group relative rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:-translate-y-2 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] dark:hover:shadow-[0_20px_50px_rgba(108,189,69,0.25)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
              {/* Glowing Top & Side Accent Bars */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
              <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-[#6CBD45] via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Radial Blur Glow */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#6CBD45]/15 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none opacity-0 group-hover:opacity-100" />

              <div className="space-y-6 relative z-10">
                {/* 3D Gradient Icon */}
                <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-[0_10px_20px_-5px_rgba(108,189,69,0.35)] group-hover:shadow-[0_15px_30px_-5px_rgba(108,189,69,0.5)] transition-all duration-300">
                    <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30 shadow-inner">
                      <Target className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                <div>
                  <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 mb-3 px-3 py-1 text-xs font-semibold">Our Core Purpose</Badge>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-[#6CBD45] transition-colors">Our Mission</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                    To build a world-class incubation ecosystem that converts academic research, deep-tech concepts, and creative ideas into commercial realities. We provide end-to-end support to empower student and faculty entrepreneurs.
                  </p>
                </div>
                <ul className="space-y-3 pt-2">
                  {[
                    "Bridge academic research with market execution",
                    "Provide zero-equity mentorship & technical labs",
                    "Facilitate seed capital, grants & angel investments"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                      <div className="w-5 h-5 rounded-full bg-[#6CBD45]/15 border border-[#6CBD45]/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6CBD45]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vision Card */}
            <div className="group relative rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:-translate-y-2 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] dark:hover:shadow-[0_20px_50px_rgba(108,189,69,0.25)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
              {/* Glowing Top & Side Accent Bars */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
              <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-[#6CBD45] via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Radial Blur Glow */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#6CBD45]/15 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none opacity-0 group-hover:opacity-100" />

              <div className="space-y-6 relative z-10">
                {/* 3D Gradient Icon */}
                <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-[0_10px_20px_-5px_rgba(108,189,69,0.35)] group-hover:shadow-[0_15px_30px_-5px_rgba(108,189,69,0.5)] transition-all duration-300">
                    <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30 shadow-inner">
                      <Globe className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                <div>
                  <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 mb-3 px-3 py-1 text-xs font-semibold">Future Outlook</Badge>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-[#6CBD45] transition-colors">Our Vision</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                    To be recognized as a premier national innovation catalyst that fuels economic growth, transforms technological breakthroughs into industry leaders, and cultivates an enduring culture of entrepreneurial excellence.
                  </p>
                </div>
                <ul className="space-y-3 pt-2">
                  {[
                    "Benchmark hub for university-backed startups",
                    "Sustained employment and technology creation",
                    "Global network of corporate & venture partners"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                      <div className="w-5 h-5 rounded-full bg-[#6CBD45]/15 border border-[#6CBD45]/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6CBD45]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do / Core Pillars Section */}
      <section className="py-28 bg-slate-50 dark:bg-[#0f1117] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300 overflow-hidden">
        {/* Glow Blobs & Subtle Background Grid */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#6CBD45]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto space-y-4">
            <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(108,189,69,0.15)] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OUR CORE PILLARS</span>
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              What We Do at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] dark:from-[#6CBD45] dark:via-emerald-400 dark:to-[#80d853]">
                Genesis - QUIC
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Genesis - QUIC operates as a high-velocity startup engine, guiding founders from raw initial concepts through rapid prototyping to full market scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                number: "01",
                icon: Lightbulb,
                title: "Innovation & Prototyping",
                subtitle: "R&D to Market Validation",
                description:
                  "Technical R&D guidance, IP filing assistance, state-of-the-art maker lab access, and product validation for deep-tech inventions.",
                badge: "R&D Engine",
                tags: ["IP Filing", "Rapid Prototyping", "Tech Lab Access"],
                gradient: "from-[#6CBD45] via-emerald-500 to-green-700",
              },
              {
                number: "02",
                icon: Users,
                title: "Elite Mentorship",
                subtitle: "Domain Expert Advisory",
                description:
                  "Direct 1-on-1 advisory sessions with seasoned serial entrepreneurs, technical architects, and industry founders.",
                badge: "1-on-1 Advisory",
                tags: ["Serial Founders", "Tech Architects", "Industry CXOs"],
                gradient: "from-emerald-400 via-teal-500 to-emerald-700",
              },
              {
                number: "03",
                icon: Building,
                title: "Incubation Infrastructure",
                subtitle: "Plug & Play Workspace",
                description:
                  "Modern co-working spaces, high-speed connectivity, cloud platform credits, legal incorporation setup, and admin facilities.",
                badge: "Co-Working & Labs",
                tags: ["24/7 Co-Working", "$100k Cloud Credits", "Legal & Admin"],
                gradient: "from-lime-400 via-[#6CBD45] to-emerald-800",
              },
              {
                number: "04",
                icon: TrendingUp,
                title: "Capital & Growth",
                subtitle: "Funding & Scaling Playbooks",
                description:
                  "Grant assistance, seed funding support up to ₹10L+, investor pitch demo days, and strategic scaling playbooks.",
                badge: "Funding & Scale",
                tags: ["₹10L+ Seed Grants", "Angel Pitch Days", "GTM Support"],
                gradient: "from-[#6CBD45] via-emerald-400 to-green-600",
              },
            ].map((pillar, index) => {
              const IconComponent = pillar.icon
              return (
                <div
                  key={index}
                  className="group relative rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_50px_rgba(108,189,69,0.18)] dark:hover:shadow-[0_20px_50px_rgba(108,189,69,0.22)] overflow-hidden"
                >
                  {/* Top edge gradient glow line */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />

                  {/* Radial glow blob on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6CBD45]/15 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none opacity-0 group-hover:opacity-100" />

                  <div>
                    {/* Header Row: 3D Gradient Icon + Pillar Index Badge */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      {/* 3D Gradient Icon Container */}
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} p-0.5 shadow-[0_10px_20px_-5px_rgba(108,189,69,0.35)] group-hover:shadow-[0_15px_30px_-5px_rgba(108,189,69,0.5)] transition-all duration-300`}
                        >
                          <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30 shadow-inner">
                            <IconComponent className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>

                      {/* Pillar Index Badge */}
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 group-hover:border-[#6CBD45]/50 group-hover:text-[#6CBD45] group-hover:bg-[#6CBD45]/10 transition-all duration-300 shadow-sm">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans tracking-widest uppercase">PILLAR</span>
                        <span className="text-[#6CBD45] font-extrabold">{pillar.number}</span>
                      </div>
                    </div>

                    {/* Badge Tag */}
                    <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 mb-3">
                      {pillar.badge}
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors leading-tight mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                      {pillar.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Highlights / Tags Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {pillar.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50 group-hover:border-[#6CBD45]/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#6CBD45] shrink-0" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6CBD45] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pt-1">
                      <span className="uppercase tracking-wider">Explore Capabilities</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Institutional Overview & Collage */}
      <section className="py-20 bg-white dark:bg-[#0d0f14] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20">FOUNDATION & GOVERNANCE</Badge>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Empowering Deep-Tech & Academic Ventures
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                Registered under Section 8 of the Companies Act, Genesis - QUIC functions with corporate agility while adhering to academic integrity. Located at Quantum University, Roorkee, we bridge the gap between academic theory and market-ready enterprise.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="group relative rounded-3xl bg-slate-50/90 dark:bg-[#141824]/90 backdrop-blur-md p-5 border border-slate-200/80 dark:border-slate-800/80 hover:-translate-y-1 hover:border-[#6CBD45]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md">
                      <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[10px] flex items-center justify-center border border-white/30">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-[#6CBD45] transition-colors">Section 8 Non-Profit</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Dedicated to public good, innovation support, and ecosystem building.</p>
                </div>
                <div className="group relative rounded-3xl bg-slate-50/90 dark:bg-[#141824]/90 backdrop-blur-md p-5 border border-slate-200/80 dark:border-slate-800/80 hover:-translate-y-1 hover:border-[#6CBD45]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md">
                      <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[10px] flex items-center justify-center border border-white/30">
                        <Compass className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-[#6CBD45] transition-colors">Institutional Support</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Backed by Quantum University's research labs, faculty, and network.</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6CBD45]/30 to-emerald-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Image
                  src="/gen-ab.jpg"
                  alt="Genesis Incubation Center"
                  width={600}
                  height={420}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 dark:bg-[#0f1117]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-[#6CBD45]">Genesis Innovation Hub</span> • Quantum University Campus, Roorkee
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#0f1117] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Our Track Record & Impact</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Measurable momentum generated across incubatees, capital raised, and ecosystem growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "50+", label: "Incubated Startups", sub: "Tech & Social Ventures", icon: Rocket },
              { stat: "₹10L+", label: "Funding Facilitated", sub: "Grants & Seed Capital", icon: Award },
              { stat: "100+", label: "Jobs Created", sub: "High-Skilled Talent", icon: Users },
              { stat: "25+", label: "Industry Partners", sub: "Corporate & VCs", icon: Globe },
            ].map((item, i) => {
              const IconComp = item.icon
              return (
                <div
                  key={i}
                  className="group relative rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 text-center hover:-translate-y-2 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_40px_rgba(108,189,69,0.18)] dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.22)] transition-all duration-500 overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                  
                  <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block mx-auto mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md">
                      <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                        <IconComp className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] dark:to-emerald-400 mb-2">
                      {item.stat}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-[#6CBD45] transition-colors">{item.label}</div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{item.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-24 bg-white dark:bg-[#0d0f14] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">LEADERSHIP & ARCHITECTS</Badge>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">Leadership Team</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Steered by leaders with decadal accomplishments in academic excellence, venture capital, and tech transfer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                name: "Mr. Ajay Goyal",
                role: "Chairman",
                org: "Quantum University",
                bio: "Visionary leader with extensive experience in education policy, institutional growth, and entrepreneurship development.",
                image: "/Mr_Ajay_Goyal.jpg"
              },
              {
                name: "Mr. Varun Tiwari",
                role: "CEO",
                org: "Genesis Incubation",
                bio: "Expert in tech commercialization, startup mentoring, and incubation management with 15+ years of industry leadership.",
                image: "/Mr_Varun_Tiwari.jpg"
              },
              {
                name: "Mr. Shobhit Goyal",
                role: "Vice Chairman",
                org: "Quantum University",
                bio: "Serial entrepreneur and active startup mentor with successful exits across software & technology verticals.",
                image: "/Mr_Shobhit_Goyal.jpg"
              },
              {
                name: "Prof. Vivek Kumar",
                role: "Vice Chancellor",
                org: "Quantum University",
                bio: "Academic champion facilitating interdisciplinary research, patent generation, and campus-wide innovation drives.",
                image: "/Prof_Vivek_Kumar.jpeg"
              }
            ].map((member, index) => (
              <div
                key={index}
                className="group relative rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 text-center hover:-translate-y-2 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_50px_rgba(108,189,69,0.22)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
              >
                {/* Glowing Top & Left Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-[#6CBD45] via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Radial Glow Blob */}
                <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#6CBD45]/15 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none opacity-0 group-hover:opacity-100" />

                <div className="space-y-4 relative z-10">
                  {/* Avatar Container with 3D Gradient Glow Ring */}
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-green-600 opacity-40 blur-md group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                    <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#6CBD45] via-emerald-400 to-green-600 shadow-[0_8px_20px_rgba(108,189,69,0.3)]">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141824] shadow-inner transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors">{member.name}</h3>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 mt-2 mb-1">
                      {member.role}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">{member.org}</div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0f1117] dark:via-[#141824] dark:to-[#0f1117] relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6CBD45]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-8 p-8 sm:p-12 rounded-3xl bg-white/90 dark:bg-[#141824]/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />
            
            <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-[0_10px_20px_-5px_rgba(108,189,69,0.35)]">
                <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                  <Zap className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Ready to Build Your Venture with Genesis - QUIC?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
                Join our next cohort of founders and transform your innovative ideas into market-defining companies.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:from-[#5ba83a] hover:to-[#4f9630] text-white px-8 py-3.5 rounded-xl shadow-lg shadow-[#6CBD45]/25 border-none font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                <Link href="/apply">Apply for Incubation</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-[#6CBD45]/40 px-8 py-3.5 rounded-xl backdrop-blur-md font-semibold">
                <Link href="/contact">Contact Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
