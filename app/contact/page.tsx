"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Building2,
  ExternalLink,
  MessageSquare,
  Loader2,
  Headphones,
  Compass,
  ArrowRight,
} from "lucide-react"
import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { SuccessModal } from "@/components/ui/success-modal"

export default function ContactPage() {
  const [category, setCategory] = useState("Incubation Application")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [trackingId, setTrackingId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
    const generatedRef = `GEN-CNT-${randomCode}`
    setTrackingId(generatedRef)

    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

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
              <MessageSquare className="w-3.5 h-3.5" />
              <span>INCUBATION HELP & INQUIRIES</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-[#80d853]">Touch</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Have questions about startup incubation, mentorship, funding opportunities, or ecosystem partnerships? 
              Reach out to our team at Genesis Innovation Hub.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-white dark:bg-[#0d0f14] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: Contact Details Cards */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20 mb-3">DIRECT REACH</Badge>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Contact Information</h2>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  We're here to accelerate your entrepreneurial journey. Connect directly with our incubation team through any of the channels below.
                </p>
              </div>

              <div className="space-y-4">
                {/* Address Card */}
                <div className="relative group rounded-3xl bg-white/80 dark:bg-[#131620]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:shadow-2xl hover:shadow-[#6CBD45]/15 dark:hover:shadow-[#6CBD45]/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  {/* Top Glowing Accent Line */}
                  <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-70 group-hover:opacity-100 group-hover:scale-x-110 transition-all duration-500 shadow-[0_0_12px_#6CBD45]" />
                  
                  {/* Ambient Hover Blur Blob */}
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#6CBD45]/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="relative z-10 flex items-start gap-5">
                    {/* 3D Gradient Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] p-[1px] shadow-lg shadow-[#6CBD45]/30 group-hover:shadow-xl group-hover:shadow-[#6CBD45]/40 group-hover:scale-105 transition-all duration-300 shrink-0">
                      <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-white/25 via-transparent to-black/25 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <MapPin className="w-7 h-7 drop-shadow-md" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-0.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Campus Address</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        Genesis Innovation Hub, Quantum University<br />
                        Mandawar (22 Km Milestone), Roorkee - Dehradun Highway<br />
                        Roorkee, Uttarakhand 247167, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="relative group rounded-3xl bg-white/80 dark:bg-[#131620]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:shadow-2xl hover:shadow-[#6CBD45]/15 dark:hover:shadow-[#6CBD45]/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  {/* Top Glowing Accent Line */}
                  <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-70 group-hover:opacity-100 group-hover:scale-x-110 transition-all duration-500 shadow-[0_0_12px_#6CBD45]" />
                  
                  {/* Ambient Hover Blur Blob */}
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#6CBD45]/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="relative z-10 flex items-start gap-5">
                    {/* 3D Gradient Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] p-[1px] shadow-lg shadow-[#6CBD45]/30 group-hover:shadow-xl group-hover:shadow-[#6CBD45]/40 group-hover:scale-105 transition-all duration-300 shrink-0">
                      <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-white/25 via-transparent to-black/25 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <Phone className="w-7 h-7 drop-shadow-md" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-0.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Phone & Helpline</h3>
                      <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                        <a href="tel:+917417615486" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors font-mono block font-medium">+91 74176 15486</a>
                        <a href="tel:+911332275275" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors font-mono block font-medium">+91 1332 275 275</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="relative group rounded-3xl bg-white/80 dark:bg-[#131620]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:shadow-2xl hover:shadow-[#6CBD45]/15 dark:hover:shadow-[#6CBD45]/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  {/* Top Glowing Accent Line */}
                  <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-70 group-hover:opacity-100 group-hover:scale-x-110 transition-all duration-500 shadow-[0_0_12px_#6CBD45]" />
                  
                  {/* Ambient Hover Blur Blob */}
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#6CBD45]/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="relative z-10 flex items-start gap-5">
                    {/* 3D Gradient Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] p-[1px] shadow-lg shadow-[#6CBD45]/30 group-hover:shadow-xl group-hover:shadow-[#6CBD45]/40 group-hover:scale-105 transition-all duration-300 shrink-0">
                      <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-white/25 via-transparent to-black/25 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <Mail className="w-7 h-7 drop-shadow-md" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-0.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Email Inquiries</h3>
                      <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                        <a href="mailto:contact@genesis-quic.in" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors font-mono block font-medium">contact@genesis-quic.in</a>
                        <a href="mailto:hello@genesis.com" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors font-mono block font-medium">hello@genesis.com</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="relative group rounded-3xl bg-white/80 dark:bg-[#131620]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:shadow-2xl hover:shadow-[#6CBD45]/15 dark:hover:shadow-[#6CBD45]/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  {/* Top Glowing Accent Line */}
                  <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-70 group-hover:opacity-100 group-hover:scale-x-110 transition-all duration-500 shadow-[0_0_12px_#6CBD45]" />
                  
                  {/* Ambient Hover Blur Blob */}
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#6CBD45]/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="relative z-10 flex items-start gap-5">
                    {/* 3D Gradient Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6CBD45] via-[#5ba83a] to-[#3f7a26] p-[1px] shadow-lg shadow-[#6CBD45]/30 group-hover:shadow-xl group-hover:shadow-[#6CBD45]/40 group-hover:scale-105 transition-all duration-300 shrink-0">
                      <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-white/25 via-transparent to-black/25 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <Clock className="w-7 h-7 drop-shadow-md" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-0.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Working Hours</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl bg-white dark:bg-[#131620]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl hover:border-slate-300 dark:hover:border-slate-700/90 transition-all">
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send us a Message</h2>
                    <span className="text-xs font-mono text-[#6CBD45] bg-[#6CBD45]/10 px-2.5 py-1 rounded-full border border-[#6CBD45]/20">Fast Response</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Fill out the form below. An incubation officer will review your message and reply within 24 hours.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="p-8 rounded-xl bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-14 h-14 bg-[#6CBD45] text-white rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#6CBD45]/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto">
                      Thank you for reaching out to Genesis - QUIC. Our incubation team has received your message and will respond shortly.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:from-[#5ba83a] text-white mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category Selector */}
                    <div>
                      <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        I am interested in *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Incubation Application",
                          "Mentorship",
                          "Investment Inquiry",
                          "General Support"
                        ].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                              category === cat
                                ? "bg-[#6CBD45] text-white shadow-md shadow-[#6CBD45]/20 font-semibold"
                                : "bg-slate-100 dark:bg-[#0b0c10] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="e.g. Rahul"
                          required
                          className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="e.g. Sharma"
                          required
                          className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@domain.com"
                          required
                          className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Company / Venture / Institution
                      </label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Quantum University / Tech Venture"
                        className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What is your query regarding?"
                        required
                        className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your startup idea, query, or how we can assist your venture..."
                        required
                        className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45] rounded-xl min-h-[130px] p-4 text-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative group/btn overflow-hidden w-full bg-gradient-to-r from-[#6CBD45] via-[#5cb538] to-[#4f9630] hover:from-[#5ba83a] hover:via-[#4f9630] hover:to-[#3f7a26] text-white py-4 rounded-xl font-bold text-base shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_25px_-4px_rgba(108,189,69,0.45)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_32px_-4px_rgba(108,189,69,0.6)] active:scale-[0.99] border border-[#7ed453]/40 transition-all duration-300 flex items-center justify-center gap-2.5"
                    >
                      {/* Shiny Light Sheen Sweep Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span className="tracking-wide">Send Message</span>
                          <Send className="w-4.5 h-4.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                      🔒 Your contact information is kept strictly confidential under our Privacy Policy.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Campus Map & Navigation Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#0f1117] relative border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-[#6CBD45]/10 text-[#6CBD45] border border-[#6CBD45]/20">CAMPUS LOCATION</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find Us in Roorkee</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">
              Visit the Genesis Innovation Hub inside Quantum University campus, Uttarakhand.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-2 shadow-2xl overflow-hidden group">
            <div className="h-[380px] w-full rounded-xl bg-slate-100 dark:bg-[#0b0c10] relative flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800/80">
              {/* Map Visual Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6CBD45]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10 text-center p-8 max-w-md mx-auto space-y-4 bg-white/95 dark:bg-[#131620]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
                <div className="relative inline-block">
                  <span className="absolute -inset-1 rounded-full bg-[#6CBD45]/40 animate-ping opacity-75" />
                  <div className="w-14 h-14 bg-[#6CBD45] text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#6CBD45]/30">
                    <MapPin className="w-7 h-7" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Genesis Innovation Hub</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                    Quantum University Campus, Roorkee - Dehradun Highway, Uttarakhand 247167
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white text-xs px-5 py-2.5 rounded-xl shadow-md border-none"
                >
                  <a
                    href="https://maps.google.com/?q=Quantum+University+Roorkee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help & Incubation CTA */}
      <section className="py-20 bg-white dark:bg-[#0d0f14] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-[#6CBD45]/40 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 border border-[#6CBD45]/20 flex items-center justify-center text-[#6CBD45]">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Apply for Incubation</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Submit your startup application to get access to mentoring, lab facilities, and grant funding.
                </p>
              </div>
              <Button asChild variant="link" className="text-[#6CBD45] p-0 h-auto justify-start font-semibold hover:underline">
                <Link href="/apply" className="flex items-center gap-1.5 text-xs">
                  <span>Start Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-[#6CBD45]/40 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 border border-[#6CBD45]/20 flex items-center justify-center text-[#6CBD45]">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Schedule Mentor Call</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Book an advisory slot with domain experts and startup mentors to refine your venture strategy.
                </p>
              </div>
              <Button asChild variant="link" className="text-[#6CBD45] p-0 h-auto justify-start font-semibold hover:underline">
                <Link href="/apply/mentor" className="flex items-center gap-1.5 text-xs">
                  <span>Connect with Mentors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-[#6CBD45]/40 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#6CBD45]/10 border border-[#6CBD45]/20 flex items-center justify-center text-[#6CBD45]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Investor & Corporate Partnership</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Partner with Genesis - QUIC as an angel investor, VC fund, or corporate innovation partner.
                </p>
              </div>
              <Button asChild variant="link" className="text-[#6CBD45] p-0 h-auto justify-start font-semibold hover:underline">
                <Link href="/apply/investor" className="flex items-center gap-1.5 text-xs">
                  <span>Explore Partnerships</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Celebration Modal */}
      <SuccessModal
        isOpen={isSubmitted}
        onClose={() => setIsSubmitted(false)}
        title="Message Sent Successfully!"
        subtitle="Thank you for reaching out to Genesis - QUIC. Our incubation team has received your message and will respond within 24 hours."
        referenceId={trackingId || "#GEN-CNT-9012"}
        type="contact"
        details={[
          { label: "Contact Name", value: `${formData.firstName} ${formData.lastName}`.trim() || "Valued Visitor" },
          { label: "Category", value: category || "General Inquiry" },
          { label: "Response Window", value: "Within 24 Hours" },
        ]}
        actionText="Back to Home"
        onAction={() => window.location.href = "/"}
      />
    </div>
  )
}
