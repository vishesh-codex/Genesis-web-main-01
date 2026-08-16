"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Lightbulb, 
  Users, 
  DollarSign, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  HelpCircle, 
  ChevronDown, 
  Rocket, 
  Presentation, 
  Building,
  Award,
  ShieldCheck,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import * as React from "react"

export default function HowToApplyPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const steps = [
    {
      number: "01",
      title: "Identify Your Track",
      icon: Lightbulb,
      timeframe: "Step 01 • Discovery",
      description:
        "Explore our incubator programs: Startup Incubation, Pre-Incubation Cohort, Mentor Program, Angel Investor Network, Guest Lecture Series, or VC Partnerships.",
      proTip: "If you have an early-stage idea or prototype, check out our 4-Month Pre-Incubation Program.",
      actionText: "Explore Programs",
      actionHref: "/apply"
    },
    {
      number: "02",
      title: "Complete the Online Application",
      icon: Send,
      timeframe: "Step 02 • ~15-20 Mins",
      description:
        "Navigate to your chosen track and complete the application form with accurate details about your startup idea, team composition, problem statement, and market opportunity.",
      proTip: "Attach a clean PDF pitch deck, demo video, or prototype link for faster processing.",
      actionText: "Go to Application Form",
      actionHref: "/apply"
    },
    {
      number: "03",
      title: "Initial Review & Triage",
      icon: CheckCircle2,
      timeframe: "Step 03 • 3-5 Days",
      description:
        "Our domain experts and incubation committee evaluate your application based on innovation, technical feasibility, market scalability, and founder commitment.",
      proTip: "Make sure all team contacts and pitch deck links are publicly accessible.",
      actionText: "View Criteria",
      actionHref: "#faq"
    },
    {
      number: "04",
      title: "Interactive Pitch Session",
      icon: Users,
      timeframe: "Step 04 • 15 Mins Q&A",
      description:
        "Shortlisted applicants are invited to present a brief 10-minute pitch followed by Q&A with our incubator mentors, industry advisors, and leadership team.",
      proTip: "Focus your presentation on the core problem, target audience, progress to date, and why Genesis.",
      actionText: "Pitching Tips",
      actionHref: "#checklist"
    },
    {
      number: "05",
      title: "Selection & Onboarding",
      icon: Award,
      timeframe: "Step 05 • Welcome!",
      description:
        "Successful applicants receive an official offer letter and immediate access to co-working space, technical labs, mentor matching, and seed funding support.",
      proTip: "Welcome to Genesis-QUIC! Get ready to accelerate your venture with full ecosystem backing.",
      actionText: "Apply Now",
      actionHref: "/apply"
    }
  ]

  const programTracks = [
    {
      title: "Startup Incubation",
      description: "For startups ready for acceleration, co-working, lab access, and grant funding up to ₹25L.",
      icon: Rocket,
      tag: "Full Cohort",
      href: "/apply/startup"
    },
    {
      title: "Pre-Incubation Program",
      description: "A 4-month structured program for early-stage idea validation, MVP building, and mentoring.",
      icon: Zap,
      tag: "4 Months",
      href: "/pre-incubation"
    },
    {
      title: "Mentor Network",
      description: "Share your domain expertise and guide high-growth startups in the Genesis ecosystem.",
      icon: Users,
      tag: "Mentorship",
      href: "/apply/mentor"
    },
    {
      title: "Angel Investor Circle",
      description: "Connect with vetted, high-potential startups for co-investment and early-stage backing.",
      icon: DollarSign,
      tag: "Investors",
      href: "/apply/investor"
    },
    {
      title: "Guest Lecture Series",
      description: "Inspire founders and students by sharing your industry experience and insights.",
      icon: Presentation,
      tag: "Speakers",
      href: "/apply/guest-lecture"
    },
    {
      title: "Venture Capital Partner",
      description: "Institutional partnership for deal flow sharing, syndicate investing, and portfolio expansion.",
      icon: Building,
      tag: "Institutional",
      href: "/apply/venture-capital"
    }
  ]

  const checklistItems = [
    {
      title: "Pitch Deck / Executive Summary",
      desc: "A 10-12 slide pitch deck covering problem, solution, market size, traction, and team."
    },
    {
      title: "Founder & Team Details",
      desc: "Bios, LinkedIn profiles, and technical/business roles of key team members."
    },
    {
      title: "Prototype or Concept Demo",
      desc: "Wireframes, video demo, CAD design, or live link (if available)."
    },
    {
      title: "Market & Competitor Insights",
      desc: "Clear understanding of your target customer segment and competitive advantage."
    }
  ]

  const faqs = [
    {
      question: "Who can apply to Genesis - QUIC programs?",
      answer: "Genesis-QUIC is open to students, faculty, alumni of Quantum University, as well as external innovators, independent founders, and startups across Uttarakhand and India."
    },
    {
      question: "Is there any fee charged for submitting an application?",
      answer: "No! Submitting an application to Genesis-QUIC programs is completely free of charge."
    },
    {
      question: "How long does the selection process take after submitting?",
      answer: "Initial screening takes 3 to 5 business days. Shortlisted candidates are invited for an interview within 1 week of application."
    },
    {
      question: "Can I apply if I only have an idea without a working prototype?",
      answer: "Yes! Our 4-Month Pre-Incubation Program is specifically designed for early-stage idea validation and turning ideas into MVPs."
    },
    {
      question: "What support do selected startups receive?",
      answer: "Selected startups gain access to high-speed co-working space, 1-on-1 mentorship, legal & IPR support, state-of-the-art labs, and seed funding support up to ₹25 Lakhs."
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
              Application Process Guide
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300">Apply</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A transparent, step-by-step roadmap to guide founders, mentors, and investors into the Genesis - QUIC innovation ecosystem.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 max-w-4xl mx-auto">
              {[
                { stat: "5 Steps", label: "Simple Process" },
                { stat: "100%", label: "Online Application" },
                { stat: "3-5 Days", label: "Fast-track Review" },
                { stat: "₹0 Fee", label: "Free to Apply" }
              ].map((item, idx) => (
                <div key={idx} className="group relative rounded-3xl bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-[#6CBD45]/60 hover:shadow-[0_15px_35px_rgba(108,189,69,0.18)] overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300 group-hover:scale-105 transition-transform duration-300">{item.stat}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Process Timeline Section */}
      <section className="py-20 bg-[#0f1117] relative">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <Compass className="w-3.5 h-3.5 text-[#6CBD45]" />
              Structured Journey
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Our 5-Step Application Process</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Follow these simple steps to submit your application and join the incubation cohort.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Connecting Vertical Line for desktop */}
            <div className="hidden md:block absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#6CBD45] via-emerald-500/50 to-slate-800 pointer-events-none" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const IconComp = step.icon
                return (
                  <div key={index} className="relative flex flex-col md:flex-row items-start gap-6 group">
                    {/* 3D Step Badge Indicator */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-[0_10px_25px_-5px_rgba(108,189,69,0.4)] group-hover:shadow-[0_15px_30px_-5px_rgba(108,189,69,0.6)] transition-all duration-300 shrink-0">
                      <div className="w-full h-full bg-[#141824] backdrop-blur-sm rounded-[14px] flex items-center justify-center text-[#6CBD45] group-hover:text-white font-mono font-black text-xl border border-white/20 transition-colors">
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content Card */}
                    <div className="flex-1 bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 overflow-hidden relative group">
                      {/* Glowing Top Accent Line */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                      <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-[#6CBD45] via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Card Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          {/* 3D Gradient Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md shrink-0">
                            <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[10px] flex items-center justify-center border border-white/30">
                              <IconComp className="w-6 h-6 text-white drop-shadow-sm" />
                            </div>
                          </div>
                          <h3 className="text-xl font-extrabold text-white group-hover:text-[#6CBD45] transition-colors">
                            {step.title}
                          </h3>
                        </div>
                        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-slate-800">
                          {step.timeframe}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 relative z-10">
                        {step.description}
                      </p>

                      {/* Pro Tip Box */}
                      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 mb-6 relative z-10">
                        <Sparkles className="w-4 h-4 text-[#6CBD45] shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-slate-400">
                          <strong className="text-slate-200">Pro Tip:</strong> {step.proTip}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end relative z-10">
                        <Button
                          asChild
                          size="sm"
                          className="group/btn bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-2.5 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
                        >
                          <Link href={step.actionHref} className="flex items-center gap-2">
                            <span>{step.actionText}</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Program Tracks Quick Grid Section */}
      <section className="py-20 bg-[#0B0D12] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <Rocket className="w-3.5 h-3.5 text-[#6CBD45]" />
              Select Your Entry Point
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Choose Your Application Track</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Direct access to specialized application portals depending on your background.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {programTracks.map((track, idx) => {
              const TrackIcon = track.icon
              return (
                <div
                  key={idx}
                  className="group bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 hover:border-[#6CBD45]/60 rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,189,69,0.2)] overflow-hidden relative"
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-500" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      {/* 3D Gradient Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md">
                        <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/30">
                          <TrackIcon className="w-6 h-6 text-white drop-shadow-sm" />
                        </div>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 font-semibold">
                        {track.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-[#6CBD45] transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {track.description}
                    </p>
                  </div>

                  <Button
                    asChild
                    className="group/btn w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold py-3 px-6 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
                  >
                    <Link href={track.href} className="flex items-center gap-2">
                      <span>Apply for Incubation</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Preparation Checklist Section */}
      <section id="checklist" className="py-20 bg-[#0f1117] relative">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto bg-[#141824]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6CBD45]/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold uppercase mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Readiness Checklist
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white">What to Prepare Before Applying</h2>
              </div>
              <Button
                asChild
                className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-3 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] shrink-0"
              >
                <Link href="/apply" className="flex items-center gap-2">
                  <span>Submit Application</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
              {checklistItems.map((item, i) => (
                <div key={i} className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-[#6CBD45]/50 transition-all duration-300 p-5 sm:p-6 flex items-start gap-4 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* 3D Gradient Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CBD45] via-emerald-500 to-green-700 p-0.5 shadow-md shrink-0">
                    <div className="w-full h-full bg-slate-900/20 backdrop-blur-sm rounded-[10px] flex items-center justify-center border border-white/30">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-white text-base mb-1 group-hover:text-[#6CBD45] transition-colors">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#0B0D12] relative border-t border-slate-800/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-[#6CBD45]" />
                Got Questions?
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

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#0f1117] to-[#0B0D12] relative">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto bg-[#141824]/90 backdrop-blur-xl border border-[#6CBD45]/40 rounded-3xl p-10 lg:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(108,189,69,0.2)] group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#6CBD45] opacity-80" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#6CBD45]/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 relative z-10">
              Ready to Accelerate Your Venture?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
              Take the first step today. Submit your application and gain access to mentoring, lab infra, co-working, and seed funding support.
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
