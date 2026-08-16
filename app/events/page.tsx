// app/events/page.tsx
"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import EventRegistrationModal from "@/components/EventRegistrationModal"
import { Toast } from "@/components/custom-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, ExternalLink, Loader2, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  max_attendees: number
  category: string
  image_url?: string
  featured: boolean
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  current_registrations?: number
  slug: string
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events/event', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setError(false)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = (event: Event) => {
    const slugOrId = event.slug || event.id;
    router.push(`/events/${encodeURIComponent(slugOrId)}`)
  }

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false)
    setSuccessMessage(`Successfully registered for "${selectedEvent?.title}"! Check your email for confirmation details.`)
    setShowSuccessToast(true)
    setSelectedEvent(null)
    fetchEvents()
  }

  const upcomingEvents = events.filter(event =>
    event.status === 'upcoming' || event.status === 'ongoing'
  )
  const pastEvents = events.filter(event =>
    event.status === 'completed'
  )
  const featuredEvent = upcomingEvents.find(event => event.featured)
  const regularUpcomingEvents = upcomingEvents.filter(event => !event.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#6CBD45]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex flex-col text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-500 mb-4">Failed to Load Events</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Please try again later.</p>
            <Button onClick={() => { setLoading(true); fetchEvents(); }} className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white">
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Success Toast */}
      <Toast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0B0D12] dark:via-[#0f1117] dark:to-[#141824] overflow-hidden border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6CBD45]/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#6CBD45]/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(108,189,69,0.15)]">
              <Calendar className="w-3.5 h-3.5" />
              Ecosystem Summits & Workshops
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Connect, Learn & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-green-600 dark:from-[#6CBD45] dark:via-emerald-400 dark:to-lime-300">Grow Together</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join our community events, pitch days, hackathons, and investor summits designed to accelerate your venture.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Event Card */}
      {featuredEvent && (
        <section className="py-16 bg-white dark:bg-[#0B0D12] border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-[#6CBD45]" />
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">Featured Event</h2>
            </div>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#141824]/90 backdrop-blur-2xl shadow-2xl hover:shadow-[0_25px_50px_rgba(108,189,69,0.2)] hover:border-[#6CBD45]/60 transition-all duration-500 group">
              {/* Glowing Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_12px_#6CBD45]" />

              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative min-h-[320px] lg:min-h-[440px] bg-slate-900 overflow-hidden">
                  <Image
                    src={featuredEvent.image_url || "/placeholder.svg?height=400&width=600"}
                    alt={featuredEvent.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white dark:to-[#141824] hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#141824] via-transparent to-transparent lg:hidden" />
                  
                  {/* 3D Glass Badge */}
                  <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {featuredEvent.category}
                  </Badge>
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-white/80 dark:bg-[#141824]/90">
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-[#6CBD45] transition-colors leading-tight">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed line-clamp-3">
                      {featuredEvent.description}
                    </p>
                  </div>

                  <div className="space-y-4 text-sm pt-2">
                    <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300 group/item">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#6CBD45] shrink-0 transform group-hover/item:scale-110 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-base">
                        {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300 group/item">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#6CBD45] shrink-0 transform group-hover/item:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-base">{featuredEvent.time}</span>
                    </div>

                    <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300 group/item">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#6CBD45] shrink-0 transform group-hover/item:scale-110 transition-transform">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-base">{featuredEvent.location}</span>
                    </div>

                    <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300 group/item">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6CBD45]/20 via-emerald-500/15 to-teal-500/20 border border-[#6CBD45]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#6CBD45] shrink-0 transform group-hover/item:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-base">
                        <strong className="text-[#6CBD45]">{featuredEvent.current_registrations || 0}</strong> / {featuredEvent.max_attendees} Registered
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      size="lg"
                      className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => handleRegisterClick(featuredEvent)}
                      disabled={(featuredEvent.current_registrations ?? 0) >= featuredEvent.max_attendees}
                    >
                      <span>
                        {(featuredEvent.current_registrations ?? 0) >= featuredEvent.max_attendees
                          ? 'Event Full'
                          : 'Register Now'
                        }
                      </span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Upcoming Events - Android Fluid Grid Layout */}
      {regularUpcomingEvents.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-[#0f1117] border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Upcoming Events</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Secure your slot in our upcoming sessions and workshops.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularUpcomingEvents.map((event) => (
                <Card key={event.id} className="bg-white/80 dark:bg-[#141824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/60 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(108,189,69,0.25)] transition-all duration-500 hover:-translate-y-2 overflow-hidden group flex flex-col rounded-3xl relative">
                  {/* Glowing Top Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6CBD45] to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20" />

                  <div className="relative w-full h-52 bg-slate-900 overflow-hidden">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">Genesis Event</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#141824] via-transparent to-transparent opacity-90" />
                    
                    {/* 3D Glass Category Badge */}
                    <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-[0_4px_14px_rgba(108,189,69,0.4)] backdrop-blur-md border border-white/20 uppercase tracking-wider">
                      {event.category}
                    </Badge>
                  </div>

                  <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 bg-white/80 dark:bg-[#141824]/90">
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-[#6CBD45] transition-colors line-clamp-1 leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-3.5 py-4 border-y border-slate-200/80 dark:border-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45] shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45] shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold">{event.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45] shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6CBD45]/20 to-emerald-500/15 border border-[#6CBD45]/30 flex items-center justify-center text-[#6CBD45] shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span><strong className="text-[#6CBD45]">{event.current_registrations || 0}</strong> / {event.max_attendees} Registered</span>
                      </div>
                    </div>

                    <Button
                      className="group/btn w-full bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-6 py-3 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => handleRegisterClick(event)}
                      disabled={(event.current_registrations ?? 0) >= event.max_attendees}
                    >
                      <span>
                        {(event.current_registrations ?? 0) >= event.max_attendees
                          ? 'Event Full'
                          : 'Register Now'
                        }
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events - Android Fluid Grid Layout */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-white dark:bg-[#0B0D12] border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Past Events</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Take a look at our successful past events and cohort milestones.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {pastEvents.map((event) => (
                <Card key={event.id} className="bg-white/60 dark:bg-[#141824]/70 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6CBD45]/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden group flex flex-col rounded-3xl relative shadow-md">
                  {/* Top Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-400/40 via-[#6CBD45]/50 to-slate-400/40 opacity-70 group-hover:opacity-100 transition-opacity z-20" />

                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <Image
                      src={event.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 z-10 bg-slate-800/90 text-slate-200 border border-slate-700/80 backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full">
                      {event.category}
                    </Badge>
                    <Badge className="absolute top-4 right-4 z-10 bg-emerald-600/90 text-white font-bold backdrop-blur-md text-xs px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-4 bg-white/60 dark:bg-[#141824]/70">
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-[#6CBD45] transition-colors">{event.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#6CBD45]" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#6CBD45]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#6CBD45]" />
                        <span>{event.current_registrations || 0} Attendees</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-white to-green-50/50 dark:from-[#0f1117] dark:to-[#0B0D12] relative transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto bg-white/80 dark:bg-[#141824]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-[#6CBD45]/30 rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl dark:shadow-[0_0_50px_rgba(108,189,69,0.15)] group hover:border-[#6CBD45]/60 transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-[#5ba83a] z-20 shadow-[0_0_12px_#6CBD45]" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#6CBD45]/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 relative z-10">
              Don't Miss Our Next Event
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
              Stay updated with our latest events and be the first to know about pitch competitions, workshops, and investor sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)]"
              >
                <Link href="/apply" className="flex items-center gap-2">
                  <span>Explore Programs</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}