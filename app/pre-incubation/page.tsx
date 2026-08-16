"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Target, 
  Award, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronDown,
  Layers,
  Zap,
  Building2,
  HelpCircle,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import * as React from "react"

export default function PreIncubationPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const phases = [
    {
      step: "01",
      phase: "Onboarding & Orientation",
      timeline: "1st – 3rd August",
      activities: "Founder orientation, team formation, cohort expectations, and program briefing.",
      icon: Users,
      tag: "Phase 1"
    },
    {
      step: "02",
      phase: "Idea Validation & Customer Discovery",
      timeline: "4th – 31st August",
      activities: "Problem-solution fit, user interviews, hypothesis testing, and value proposition canvas.",
      icon: Lightbulb,
      tag: "Phase 2"
    },
    {
      step: "03",
      phase: "Product & Market Fit",
      timeline: "1st – 30th September",
      activities: "MVP planning, market research, competitor matrix, and rapid wireframing/prototyping.",
      icon: Layers,
      tag: "Phase 3"
    },
    {
      step: "04",
      phase: "Business Model & GTM Strategy",
      timeline: "1st – 31st October",
      activities: "Business model canvas, pricing models, revenue strategies, and go-to-market execution.",
      icon: TrendingUp,
      tag: "Phase 4"
    },
    {
      step: "05",
      phase: "Pitching & Demo Prep",
      timeline: "1st – 20th November",
      activities: "Fundraising fundamentals, pitch deck design, storytelling, and mock investor reviews.",
      icon: Target,
      tag: "Phase 5"
    },
    {
      step: "06",
      phase: "Demo Day Showcase",
      timeline: "29th – 30th November",
      activities: "Live pitch to panel of angel investors, VC representatives, industry leaders, and press.",
      icon: Award,
      tag: "Demo Day"
    },
  ]

  const benefits = [
    {
      title: "1-on-1 Mentorship",
      desc: "Weekly dedicated mentoring from seasoned founders, product leaders, and active investors.",
      icon: Users
    },
    {
      title: "16 Weekend Masterclasses",
      desc: "Hands-on weekend workshops covering design thinking, growth, unit economics, and IPR.",
      icon: BookOpen
    },
    {
      title: "Quantum Lab Access",
      desc: "Use Quantum University prototyping labs, IoT hardware, and faculty technical experts.",
      icon: Building2
    },
    {
      title: "Free Co-Working Hub",
      desc: "High-speed internet, dedicated desks, and meeting rooms at Genesis Incubation Center.",
      icon: Layers
    },
    {
      title: "Investor Connects",
      desc: "Direct introductions to angel networks, government grant officers, and seed VCs.",
      icon: TrendingUp
    },
    {
      title: "Certificate of Excellence",
      desc: "Joint recognition from Genesis Incubator & Quantum University upon completion.",
      icon: Award
    },
    {
      title: "Startup Toolkit Suite",
      desc: "Free access to legal templates, pitch deck frameworks, financial models, and SaaS perks.",
      icon: Zap
    },
    {
      title: "Fast-Track Incubation",
      desc: "Top cohort performers transition directly into full incubation with up to ₹25L seed review.",
      icon: Sparkles
    },
  ]

  const workshops = [
    { week: 1, date: "2nd August", month: "august", topic: "Design Thinking & Problem Definition", tag: "Validation" },
    { week: 2, date: "9th August", month: "august", topic: "Building a Minimum Viable Product (MVP)", tag: "Product" },
    { week: 3, date: "16th August", month: "august", topic: "Understanding Customers & User Discovery", tag: "Market" },
    { week: 4, date: "23rd August", month: "august", topic: "Lean Startup & Rapid Experimentation", tag: "Growth" },
    { week: 5, date: "30th August", month: "august", topic: "Legal Basics, IPR & Patent Filing", tag: "Legal" },
    { week: 6, date: "6th September", month: "september", topic: "Branding, Positioning & Product Marketing", tag: "Marketing" },
    { week: 7, date: "13th September", month: "september", topic: "Financial Modeling & Unit Economics", tag: "Finance" },
    { week: 8, date: "20th September", month: "september", topic: "Business Model Canvas (BMC) Deep Dive", tag: "Strategy" },
    { week: 9, date: "27th September", month: "september", topic: "UX/UI Design & Product Analytics", tag: "Design" },
    { week: 10, date: "4th October", month: "october", topic: "Funding 101: Grants, Angels & Bootstrapping", tag: "Funding" },
    { week: 11, date: "11th October", month: "october", topic: "Go-to-Market Strategy & User Acquisition", tag: "Growth" },
    { week: 12, date: "18th October", month: "october", topic: "Founder Lessons: Failure & Pivot Case Studies", tag: "Mentorship" },
    { week: 13, date: "25th October", month: "october", topic: "Co-Founder Equity & Team Dynamics", tag: "Culture" },
    { week: 14, date: "1st November", month: "november", topic: "Building a Winning Pitch Deck", tag: "Pitching" },
    { week: 15, date: "8th November", month: "november", topic: "Mock Pitch Sessions with Feedback", tag: "Review" },
    { week: 16, date: "15th November", month: "november", topic: "Scaling Beyond Pre-Incubation & Next Steps", tag: "Graduation" },
  ]

  const filteredWorkshops = selectedMonth === "all" 
    ? workshops 
    : workshops.filter(w => w.month === selectedMonth)

  const faqs = [
    {
      question: "Who is eligible for the Pre-Incubation Program?",
      answer: "The program is open to students, faculty, researchers, and independent entrepreneurs across Uttarakhand and India. Any individual or team with an early-stage startup idea or prototype is encouraged to apply."
    },
    {
      question: "Are there any fees or equity required to participate?",
      answer: "No! The Pre-Incubation Program is 100% free with zero equity dilutive requirement. We provide workspace, mentorship, and lab access at zero cost."
    },
    {
      question: "What is the expected time commitment?",
      answer: "Founders are expected to attend Saturday workshops (2-3 hours) and schedule weekly 1-on-1 mentor check-ins, alongside active execution on their startup."
    },
    {
      question: "What happens after Demo Day at the end of the program?",
      answer: "Top-performing startups receive direct entry into our main Genesis Incubation Program, seed funding review (up to ₹25 Lakhs), and introductions to external angel investors."
    },
    {
      question: "Can I apply if I am a solo founder?",
      answer: "Yes! Solo founders can apply. During Phase 1 (Orientation), we also help match solo founders with potential co-founders and team members."
    }
  ]

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#0B0D12] via-[#0f1117] to-[#141824] overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6CBD45]/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#6CBD45]/10 blur-[110px] rounded-full pointer-events-none" />

        {/* Developer Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(108,189,69,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              Pre-Incubation Cohort 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              4-Month <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300">Pre-Incubation</span> Program
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transform your raw startup idea into a validated business prototype with hands-on weekend workshops, 1-on-1 mentorship, and investor readiness.
            </p>

            {/* Key Hero Stat Cards */}
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              {[
                { stat: "Aug - Nov 2026", label: "4 Months Cohort", icon: Calendar },
                { stat: "20+ Startups", label: "Selected Per Cohort", icon: Users },
                { stat: "100% Free", label: "Zero Fee & Equity", icon: Award }
              ].map((item, idx) => {
                const StatIcon = item.icon
                return (
                  <div key={idx} className="group relative bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 rounded-3xl p-6 text-center transition-all duration-500 hover:-translate-y-2 shadow-lg hover:shadow-[0_20px_40px_rgba(108,189,69,0.2)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                    
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md mx-auto mb-3">
                      <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                        <StatIcon className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                    </div>
                    
                    <div className="text-2xl font-extrabold text-white mb-1 group-hover:text-[#6CBD45] transition-colors">{item.stat}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.label}</div>
                  </div>
                )
              })}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
              >
                <Link href="/apply" className="flex items-center gap-2">
                  <span>Apply for Incubation</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/60 rounded-xl"
              >
                <Link href="#schedule">View Schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-20 bg-[#0f1117] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-[#6CBD45]" />
                Cohort Foundation
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Program Overview</h2>
            </div>

            <div className="bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6CBD45]/10 blur-[80px] rounded-full pointer-events-none" />

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 relative z-10">
                The Pre-Incubation Program by QU Innovation Council - Genesis Incubator aims to nurture early-stage and idea-stage entrepreneurs by providing foundational support, structured mentoring, and technical resources needed to convert raw ideas into viable startup prototypes or MVPs.
              </p>

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Target className="w-5 h-5 text-[#6CBD45]" />
                Core Program Objectives:
              </h3>

              <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {[
                  "Validate and refine early-stage business models & problem-solution fit",
                  "Build practical founder capabilities through weekly masterclasses",
                  "Support MVP development with lab access & technical mentoring",
                  "Prepare founders for investor pitch presentations & Demo Day"
                ].map((obj, i) => (
                  <div key={i} className="group/item relative rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 p-4 sm:p-5 hover:border-[#6CBD45]/50 transition-all duration-300 overflow-hidden hover:-translate-y-1">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                    
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md shrink-0 mt-0.5">
                      <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[6px] flex items-center justify-center border border-white/30">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-sm sm:text-base text-slate-300 group-hover/item:text-white transition-colors">{obj}</span>
                  </div>
                ))}

                <div className="group/item relative rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 p-4 sm:p-5 hover:border-[#6CBD45]/50 transition-all duration-300 md:col-span-2 overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md shrink-0 mt-0.5">
                    <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[6px] flex items-center justify-center border border-white/30">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-sm sm:text-base text-slate-300 group-hover/item:text-white transition-colors">Catalyze innovation-driven entrepreneurship across Uttarakhand & North India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure & Timeline */}
      <section className="py-20 bg-[#0B0D12] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#6CBD45]" />
                6-Phase Curriculum
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Program Structure & Roadmap</h2>
              <p className="text-slate-400 text-base max-w-2xl mx-auto">
                A structured 6-phase journey designed to take you from concept to Demo Day.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {phases.map((item, index) => {
                const PhaseIcon = item.icon
                return (
                  <div 
                    key={index}
                    className="group bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] overflow-hidden relative"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          {/* 3D Step Badge */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md">
                            <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30 font-mono font-extrabold text-sm text-white">
                              {item.step}
                            </div>
                          </div>
                          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 font-semibold">
                            {item.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#6CBD45]" />
                          <span>{item.timeline}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-[#6CBD45] transition-colors flex items-center gap-2.5">
                        <PhaseIcon className="w-5 h-5 text-[#6CBD45] shrink-0" />
                        {item.phase}
                      </h3>
                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        {item.activities}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-20 bg-[#0f1117] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-[#6CBD45]" />
                Why Join Us?
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Program Benefits</h2>
              <p className="text-slate-400 text-base max-w-2xl mx-auto">
                Comprehensive support designed to eliminate barriers for early-stage founders.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {benefits.map((benefit, index) => {
                const BenIcon = benefit.icon
                return (
                  <div
                    key={index}
                    className="group bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] overflow-hidden relative"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />

                    <div>
                      {/* 3D Gradient Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md mb-4">
                        <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                          <BenIcon className="w-6 h-6 text-white drop-shadow-sm" />
                        </div>
                      </div>

                      <h3 className="font-extrabold text-white text-lg mb-2 group-hover:text-[#6CBD45] transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Weekend Workshop Schedule */}
      <section id="schedule" className="py-20 bg-[#0B0D12] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-[#6CBD45]" />
                16-Week Masterclass Schedule
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Weekend Workshop Calendar</h2>
              <p className="text-slate-400 text-base max-w-2xl mx-auto">
                Every Saturday intensive sessions led by founders, domain experts, and investors.
              </p>

              {/* Month Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 pt-6">
                {[
                  { id: "all", label: "All 16 Weeks" },
                  { id: "august", label: "August (W1-W5)" },
                  { id: "september", label: "September (W6-W9)" },
                  { id: "october", label: "October (W10-W13)" },
                  { id: "november", label: "November (W14-W16)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedMonth(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedMonth === tab.id
                        ? "bg-[#6CBD45] text-white shadow-lg shadow-[#6CBD45]/25"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop, index) => (
                <div
                  key={index}
                  className="group bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden relative hover:shadow-[0_15px_30px_rgba(108,189,69,0.15)]"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/30 font-semibold">
                        Week {workshop.week}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{workshop.date}</span>
                    </div>

                    <h3 className="font-extrabold text-white text-base group-hover:text-[#6CBD45] transition-colors mb-4">
                      {workshop.topic}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-500 font-mono">Saturday Masterclass</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 font-mono">
                      {workshop.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selection Criteria */}
      <section className="py-20 bg-[#0f1117] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6CBD45]" />
                Applicant Requirements
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Selection Criteria</h2>
            </div>

            <div className="bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />

              <div className="space-y-6 relative z-10">
                {[
                  { title: "Target Audience", desc: "Open to students, researchers, innovators, and early-stage entrepreneurs from colleges & universities across Uttarakhand and North India.", icon: Target },
                  { title: "Sector Agnostic", desc: "Ideas from any domain — Tech, AgriTech, CleanTech, HealthTech, EduTech, FinTech, or Social Impact — are welcome.", icon: Lightbulb },
                  { title: "Founder Commitment", desc: "Founders must demonstrate dedication to attend weekend sessions, execute mentor milestones, and build their startup beyond the cohort.", icon: TrendingUp }
                ].map((crit, idx) => {
                  const CritIcon = crit.icon
                  return (
                    <div key={idx} className="group/item relative rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-[#6CBD45]/50 transition-all duration-300 p-5 sm:p-6 flex items-start gap-4 hover:-translate-y-1 overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      
                      {/* 3D Gradient Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md shrink-0">
                        <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                          <CritIcon className="w-6 h-6 text-white drop-shadow-sm" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-white text-base sm:text-lg mb-1 group-hover/item:text-[#6CBD45] transition-colors">{crit.title}</h4>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{crit.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Outcomes Metrics */}
      <section className="py-20 bg-[#0B0D12] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-12">Expected Program Impact</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { stat: "20+", label: "Selected Startups" },
                { stat: "10+", label: "MVPs Validated" },
                { stat: "5+", label: "Investor Ready Teams" },
                { stat: "100%", label: "Ecosystem Backing" }
              ].map((item, idx) => (
                <div key={idx} className="group relative rounded-3xl bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 p-6 text-center hover:border-[#6CBD45]/60 hover:shadow-[0_20px_40px_rgba(108,189,69,0.2)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                  <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300 mb-2 group-hover:scale-105 transition-transform duration-300">{item.stat}</div>
                  <div className="text-slate-400 text-sm font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0f1117] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-[#6CBD45]" />
                Questions & Answers
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = expandedFAQ === index
                return (
                  <div
                    key={index}
                    className="bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/40 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-md"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-bold text-white text-base sm:text-lg">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#6CBD45] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-0 text-slate-400 text-sm sm:text-base leading-relaxed border-t border-slate-800/60 mt-2 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#0f1117] to-[#0B0D12] relative">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto bg-[#141824]/90 backdrop-blur-xl border border-[#6CBD45]/40 rounded-3xl p-10 lg:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(108,189,69,0.2)] group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#6CBD45]/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative group-hover:scale-105 transition-transform duration-300 inline-block mx-auto mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-[0_10px_20px_-5px_rgba(108,189,69,0.35)]">
                <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                  <Zap className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 relative z-10">
              Ready to Build Your Startup Prototype?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
              Join our 4-month Pre-Incubation Program and get the support, mentorship, and resources needed to validate and launch your startup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
              >
                <Link href="/apply" className="flex items-center gap-2">
                  <span>Apply for Incubation</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/60 rounded-xl"
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
