"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  Users, 
  Building, 
  GraduationCap, 
  DollarSign, 
  Presentation, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  HelpCircle,
  Compass,
  Clock,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import * as React from "react"

export default function ApplyPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const applicationTypes = [
    {
      title: "Apply as Startup",
      description:
        "Join our incubation program and get access to funding, mentorship, and resources to scale your startup.",
      icon: Rocket,
      benefits: ["Up to ₹25L funding", "6-month program", "Dedicated mentor", "Office space"],
      href: "/apply/startup",
      tag: "Startup Track"
    },
    {
      title: "Signup for Mentor",
      description: "Share your expertise and guide the next generation of entrepreneurs as a mentor in our ecosystem.",
      icon: Users,
      benefits: ["Flexible commitment", "Industry networking", "Give back to community", "Recognition"],
      href: "/apply/mentor",
      tag: "Mentorship"
    },
    {
      title: "Angel Investor",
      description: "Invest in promising startups and be part of their growth journey while generating returns.",
      icon: DollarSign,
      benefits: ["Curated deal flow", "Due diligence support", "Portfolio management", "Exit opportunities"],
      href: "/apply/investor",
      tag: "Investor Track"
    },
    {
      title: "Guest Lecture",
      description: "Share your knowledge and experience with our startup community through speaking engagements.",
      icon: Presentation,
      benefits: ["Thought leadership", "Brand visibility", "Network expansion", "Knowledge sharing"],
      href: "/apply/guest-lecture",
      tag: "Speaker Series"
    },
    {
      title: "Venture Capital",
      description: "Partner with us as an institutional investor to fund high-growth potential startups.",
      icon: Building,
      benefits: ["Deal sourcing", "Co-investment opportunities", "Market insights", "Portfolio support"],
      href: "/apply/venture-capital",
      tag: "Institutional"
    },
    {
      title: "Student Program",
      description: "Join our student entrepreneur program and turn your ideas into viable business ventures.",
      icon: GraduationCap,
      benefits: ["Idea validation", "Business training", "Peer network", "Faculty support"],
      href: "/apply/student",
      tag: "Academic Track"
    },
  ]

  const faqs = [
    {
      question: "Who is eligible to apply for incubation at The Genesis - QUIC?",
      answer: "Students, faculty, alumni of Quantum University, and external applicants from outside the institution are eligible to apply. The program is open to anyone with an innovative idea or startup looking for incubation support."
    },
    {
      question: "What is the typical duration of the incubation program?",
      answer: "Our standard incubation program runs for 6 months, with the possibility of extension based on progress and requirements. We also offer shorter intensive cohorts and long-term ecosystem support based on specific needs."
    },
    {
      question: "Is there any fee to join the incubation program?",
      answer: "No, there is no fee to join our incubation program. Selected startups receive funding guidance, mentorship, co-working space, and resources as part of the incubator support."
    },
    {
      question: "What kind of resources and infra are provided to incubated startups?",
      answer: "Incubated teams get access to high-speed internet co-working spaces, cloud credits, legal & IP advisory, prototyping labs, investor pitch events, and direct access to industry experts."
    }
  ]

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
              Applications Open 2026
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-lime-300">Genesis Ecosystem</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Whether you're an entrepreneur, mentor, investor, or student, there's a dedicated place for you in our thriving innovation community. Choose your path and start your journey with us.
            </p>
          </div>
        </div>
      </section>

      {/* Application Types Grid */}
      <section className="py-20 bg-slate-50 dark:bg-[#0f1117] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Compass className="w-3.5 h-3.5 text-[#6CBD45]" />
              Tailored Tracks
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">Choose Your Application Type</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Select the option that best describes your role and interests in the startup ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {applicationTypes.map((type, index) => {
              const IconComponent = type.icon
              return (
                <div 
                  key={index} 
                  className="group relative bg-white dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-xl dark:hover:shadow-[0_0_35px_-5px_rgba(108,189,69,0.25)] rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Glowing Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Header Row: Icon & Tag */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#6CBD45] group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(108,189,69,0.15)]">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-400/90 border border-slate-200 dark:border-slate-800">
                        {type.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#6CBD45] transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {type.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mb-8">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Key Benefits:
                      </h4>
                      <ul className="space-y-2.5">
                        {type.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#6CBD45] shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Apply Action Button */}
                  <Button 
                    asChild 
                    className="group/btn w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold py-3.5 px-6 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
                  >
                    <Link href={type.href} className="flex items-center gap-2">
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

      {/* Application Process Section */}
      <section className="py-24 bg-white dark:bg-[#0B0D12] border-y border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-300">
        {/* Glow Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6CBD45]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#6CBD45]" />
              Streamlined Pipeline
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">Application Process</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Our structured four-stage review process ensures speed, clarity, and perfect alignment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Process Step 1 */}
            <div className="bg-slate-50 dark:bg-[#141824]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/50 p-6 rounded-2xl text-center group hover:-translate-y-1.5 transition-all duration-300 shadow-sm dark:shadow-xl">
              <div className="w-14 h-14 bg-[#6CBD45]/15 border border-[#6CBD45]/40 text-[#6CBD45] rounded-2xl mx-auto mb-5 flex items-center justify-center font-extrabold text-xl shadow-[0_0_20px_rgba(108,189,69,0.2)] group-hover:bg-[#6CBD45] group-hover:text-white transition-all duration-300">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Submit Application</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Fill out the online application form with your startup details and requirements.
              </p>
            </div>

            {/* Process Step 2 */}
            <div className="bg-slate-50 dark:bg-[#141824]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/50 p-6 rounded-2xl text-center group hover:-translate-y-1.5 transition-all duration-300 shadow-sm dark:shadow-xl">
              <div className="w-14 h-14 bg-[#6CBD45]/15 border border-[#6CBD45]/40 text-[#6CBD45] rounded-2xl mx-auto mb-5 flex items-center justify-center font-extrabold text-xl shadow-[0_0_20px_rgba(108,189,69,0.2)] group-hover:bg-[#6CBD45] group-hover:text-white transition-all duration-300">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Initial Review</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Our committee reviews your proposal and conducts internal initial screening.
              </p>
            </div>

            {/* Process Step 3 */}
            <div className="bg-slate-50 dark:bg-[#141824]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/50 p-6 rounded-2xl text-center group hover:-translate-y-1.5 transition-all duration-300 shadow-sm dark:shadow-xl">
              <div className="w-14 h-14 bg-[#6CBD45]/15 border border-[#6CBD45]/40 text-[#6CBD45] rounded-2xl mx-auto mb-5 flex items-center justify-center font-extrabold text-xl shadow-[0_0_20px_rgba(108,189,69,0.2)] group-hover:bg-[#6CBD45] group-hover:text-white transition-all duration-300">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Pitch & Interview</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Shortlisted candidates present their idea in an interview with our expert panel.
              </p>
            </div>

            {/* Process Step 4 */}
            <div className="bg-slate-50 dark:bg-[#141824]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/50 p-6 rounded-2xl text-center group hover:-translate-y-1.5 transition-all duration-300 shadow-sm dark:shadow-xl">
              <div className="w-14 h-14 bg-[#6CBD45]/15 border border-[#6CBD45]/40 text-[#6CBD45] rounded-2xl mx-auto mb-5 flex items-center justify-center font-extrabold text-xl shadow-[0_0_20px_rgba(108,189,69,0.2)] group-hover:bg-[#6CBD45] group-hover:text-white transition-all duration-300">
                4
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Onboarding</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Accepted applicants get officially onboarded into Genesis resources & network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#0f1117] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-[#6CBD45]" />
                Got Questions?
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">
                Everything you need to know about the application criteria, incubation terms, and support.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = expandedFAQ === index
                return (
                  <div
                    key={index}
                    className={`bg-white dark:bg-[#141824]/90 backdrop-blur-md border rounded-2xl transition-all duration-300 overflow-hidden shadow-sm ${
                      isOpen ? "border-[#6CBD45]/60 shadow-[0_0_25px_rgba(108,189,69,0.15)]" : "border-slate-200 dark:border-slate-800/80 hover:border-[#6CBD45]/40"
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left flex items-center justify-between font-bold text-lg text-slate-900 dark:text-white hover:text-[#6CBD45] transition-colors"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-[#6CBD45] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="p-6 pt-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800/50 mt-1">
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

      {/* Bottom CTA Section */}
      <section className="pb-24 bg-slate-50 dark:bg-[#0f1117] transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-white via-green-50/50 to-white dark:from-[#141824] dark:via-[#1a2419] dark:to-[#141824] border border-slate-200 dark:border-[#6CBD45]/30 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden shadow-2xl dark:shadow-[0_0_50px_rgba(108,189,69,0.15)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6CBD45]/10 blur-3xl rounded-full pointer-events-none" />
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Have Questions Before Applying?</h3>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
              Our incubator management team is here to guide you through the process and help you choose the best track.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-3.5 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]">
                <Link href="/contact" className="flex items-center gap-2">
                  <span>Contact Our Team</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white dark:bg-[#141824] text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#6CBD45] hover:text-[#6CBD45] font-medium px-6 py-3 rounded-xl">
                <Link href="/startup-policy">View Incubation Policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
