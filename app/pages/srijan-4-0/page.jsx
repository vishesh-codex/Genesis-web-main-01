"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Users, 
  Trophy, 
  Rocket, 
  Lightbulb, 
  Clock,
  ArrowRight,
  Globe,
  Briefcase,
  Monitor,
  Zap,
  Target,
  Handshake,
  TrendingUp,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SrijanPage() {
  const [activeDay, setActiveDay] = useState("day1")
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 6,
    minutes: 45,
    seconds: 48
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const agenda = {
    day1: [
      { time: "9:00 AM", title: "ACE the Case", desc: "Case study competition for aspiring strategists.", image: "/srijan/activities.png" },
      { time: "11:00 AM", title: "Corporate Deal", desc: "Simulate real-world corporate deals and negotiations.", image: "/srijan/activities.png" }
    ],
    day2: [
      { time: "10:00 AM", title: "GVFP Demo Day", desc: "Pitch your product to investors. Get feedback, funding leads, and visibility.", image: "/srijan/activities.png" },
      { time: "02:00 PM", title: "Partner Unity Fest", desc: "Collaboration & engagement activities with ecosystem partners.", image: "/srijan/activities.png" }
    ],
    day3: [
      { time: "11:00 AM", title: "Startup Expo", desc: "North India's premier startup showcase. Booths, demos, and investor meetings.", image: "/srijan/activities.png" },
      { time: "04:00 PM", title: "Project Exhibition", desc: "Exhibit your prototypes and innovative projects to a live audience.", image: "/srijan/activities.png" }
    ]
  }

  const featuredEvents = [
    { title: "ACE the Case", desc: "Case study competition for aspiring strategists and problem solvers.", icon: <Lightbulb />, day: "Day 1" },
    { title: "Corporate Deal", desc: "Simulate real-world corporate deals and negotiations.", icon: <Briefcase />, day: "Day 1" },
    { title: "GVFP Demo Day", desc: "Pitch your product to investors. Get feedback, funding leads, and visibility.", icon: <Monitor />, day: "Day 2" },
    { title: "Partner Unity Fest", desc: "Collaboration & engagement activities with ecosystem partners.", icon: <Users />, day: "Day 2" },
    { title: "Bid and Build", desc: "Competitive bidding and team-building startup challenge.", icon: <Rocket />, day: "Day 2" },
    { title: "Startup Expo", desc: "North India's premier startup showcase. Booths, demos, and investor meetings.", icon: <Globe />, day: "Day 3" },
    { title: "Project Exhibition", desc: "Exhibit your prototypes and innovative projects to a live audience.", icon: <Trophy />, day: "Day 3" },
    { title: "Speed Mentoring", desc: "Rapid mentoring sessions with industry experts and investors.", icon: <Zap />, day: "Day 3" }
  ]

  const registrationEvents = [
    "ACE the Case", "Corporate Deal", "USPL (Uttrakhand Startup Premier League)", 
    "GVFP Demo Day", "Partner Unity Fest", "Bid and Build", 
    "Startup Expo", "Project Exhibition", "Main Stage Panel Discussions - Fireside Chat", 
    "Speed Mentoring"
  ]

  const focusAreas = [
    { title: "Innovation Showcase", desc: "Present groundbreaking projects and ideas to industry leaders and investors.", icon: <Target /> },
    { title: "Speed Networking", desc: "Connect with founders, mentors, and collaborators in structured networking sessions.", icon: <Handshake /> },
    { title: "Startup Expo", desc: "Top-level North India startup showcase with demo booths and live pitches.", icon: <TrendingUp /> },
    { title: "Project Expo", desc: "Special recognition for unique and innovative standout projects.", icon: <Trophy /> }
  ]

  const speakers = [
    { name: "Shorya Mittal", role: "Angel Investor", image: "https://media.genesis-quic.in/gallery/1776632702549-40z07j3-1776337121538-3tihopimyzm.jpeg" , link: "https://www.linkedin.com/in/shorya-mittal"},
    { name: "Rahul D Bahadur", role: "CEO-Shoolini Pehal Foundation", image: "https://media.genesis-quic.in/gallery/1776632716778-rs9qgx9-1776337845371-vjtww6x935.png" , link: "https://www.linkedin.com/in/rahul-bahadur/"},
    { name: "Gautham Sivaramakrishnan", role: "Capital & Market Networks at Blume Ventures", image: "https://media.genesis-quic.in/gallery/1776632728210-nyuheq6-1776338399179-v9lwmhgteoj.png" , link: "https://www.linkedin.com/in/sgautham/"},
    { name: "Vikram Singh", role: "Angel Investor - GreenFund Capital", image: "https://media.genesis-quic.in/gallery/1776632739288-qpy3tmx-speaker-4-dz-xqt3n.jpg" , link: "https://www.linkedin.com/"}
  ]

  const warmUpSessions = [
    { title: "Club Clash", date: "16 April", icon: <Rocket /> },
    { title: "The Reel Showcase", date: "17 April", icon: <Monitor /> },
    { title: "Poster Reveal", date: "20 April", icon: <Trophy /> },
    { title: "How To Build A Pitch Deck", date: "21 April", icon: <Target /> }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(108, 189, 69, 0.95), rgba(108, 189, 69, 0.8)), url('/srijan/hero-bg.png')` 
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="space-y-6">
                <div className="text-primary-foreground tracking-[0.2em] font-medium text-xs md:text-sm uppercase border-l-2 border-white pl-4">
                  3-Day Innovation & Startup Event · Quantum University
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-[100px] font-bold leading-[0.9] text-white">
                  NORTH INDIA'S <br />
                  <span className="text-white opacity-80">PREMIER</span> STARTUP <br />
                  SUMMIT
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed font-medium">
                  Empowering innovators, connecting founders, and showcasing the brightest startups. Three days. 5,000+ attendees. Unlimited connections.
                </p>

                {/* Countdown Timer */}
                <div className="flex flex-wrap gap-3 mt-8">
                  {Object.entries(timeLeft).map(([label, value]) => (
                    <div key={label} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center min-w-[90px] transition-transform hover:scale-105">
                      <div className="text-3xl font-bold text-white">{value.toString().padStart(2, '0')}</div>
                      <div className="text-[10px] uppercase font-medium text-white/60 tracking-wider mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl shadow-2xl">
                    Register Now
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-xl bg-transparent">
                    View Agenda
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 space-y-10 shadow-2xl">
                <div className="space-y-4 text-center lg:text-left">
                  <div className="text-xs font-medium text-white/60 tracking-widest uppercase">SAVE THE DATE</div>
                  <div className="text-4xl font-bold text-white">23–25 April 2026</div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-white/80 text-sm">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <span>Quantum University, Uttarakhand</span>
                    <button className="text-white underline text-[10px] font-medium ml-2">View on Google Maps</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  {[
                    { label: "Attendees", val: "5K+" },
                    { label: "Speakers", val: "20+" },
                    { label: "Startups", val: "20+" },
                    { label: "Days", val: "3" }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center lg:text-left">
                      <div className="text-3xl font-bold text-white">{stat.val}</div>
                      <div className="text-xs text-white/60 mt-1 uppercase font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Event (Where Ideas Meet Opportunity) */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">ABOUT THE EVENT</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Where Ideas Meet <span className="text-primary italic">Opportunity</span></h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
            SRIJAN is a 3-day innovation summit bringing together startups, investors, incubators, and visionaries for collaboration, showcasing, and building the future together.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {focusAreas.map((area, idx) => (
              <div key={idx} className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group text-left">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {React.cloneElement(area.icon, { className: "w-7 h-7" })}
                </div>
                <h4 className="text-xl font-medium mb-3 text-foreground">{area.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {area.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">GUEST TALKS</h2>
              <h3 className="text-4xl md:text-5xl font-bold">Meet Our <span className="text-primary italic">Speakers</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {speakers.map((speaker, idx) => (
              <div key={idx} className="text-center group cursor-pointer">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted mb-6 relative">
                  <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <a href={speaker.link} target="_blank" rel="noopener noreferrer">
                      <span className="text-white text-xs font-medium">VIEW PROFILE</span>
                    </a>
                  </div>
                </div>
                <h4 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{speaker.name}</h4>
                <p className="text-sm text-muted-foreground font-medium mt-1 uppercase tracking-tighter opacity-80">{speaker.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda Section */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">EVENT SCHEDULE</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Three Days of <span className="text-primary italic font-serif">Innovation</span></h3>
            
            <div className="flex flex-wrap justify-center gap-4 mt-12 mb-12">
              {[
                { id: "day1", label: "Day 1 — 23rd April" },
                { id: "day2", label: "Day 2 — 24th April" },
                { id: "day3", label: "Day 3 — 25th April" }
              ].map((day) => (
                <button 
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={cn(
                    "px-8 py-4 rounded-xl font-medium text-sm transition-all border",
                    activeDay === day.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" 
                      : "bg-background text-muted-foreground border-border hover:bg-accent"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {agenda[activeDay].map((event, idx) => (
              <div key={idx} className="bg-background rounded-3xl overflow-hidden border border-border group hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl p-3">
                <div className="rounded-2xl overflow-hidden h-72 mb-6 relative">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="px-5 pb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold text-sm tracking-widest">{event.time}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{activeDay}</span>
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{event.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">{event.desc}</p>
                  <Button className="w-full bg-primary hover:opacity-90 py-7 rounded-xl font-bold mt-6 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest">
                    Register Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warm Up Sessions Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">PRE-EVENT</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Warm Up <span className="text-primary italic">Sessions</span></h3>
          </div>

          <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border/50 shadow-card overflow-hidden">
            {warmUpSessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {React.cloneElement(session.icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">{session.title}</h4>
                    <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase mt-1 block px-2 py-0.5 bg-muted rounded-md w-max md:hidden">{session.date}</span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground tracking-widest uppercase">{session.date}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium opacity-60">Session Date</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-card/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">FEATURED EVENTS</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Don't Miss <span className="text-primary italic">These</span></h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {featuredEvents.map((event, idx) => (
              <div key={idx} className="bg-background p-8 rounded-3xl relative shadow-sm border border-border/50 hover:border-primary/50 transition-all group overflow-hidden hover:-translate-y-1">
                <div className="absolute top-5 right-5 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{event.day}</div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                  {React.cloneElement(event.icon, { className: "w-7 h-7" })}
                </div>
                <h4 className="text-xl font-medium mb-3 text-foreground">{event.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {event.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backed by Leaders (Partners) Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xs font-medium text-primary uppercase tracking-[0.1em] mb-4">PARTNERS</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-16 italic">Backed by <span className="text-primary">Leaders</span></h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
            {[
              { name: "Startup Uttarakhand", logo: "/startup_uttrakhand_logo.svg" },
              { name: "ADIF", logo: "/adif_logo.svg" },
              { name: "HEADSTART", logo: "/headstart-logo.png" },
              { name: "WOMENNOVATOR", logo: "/women_innovator.svg" }
            ].map((partner, idx) => (
              <div key={idx} className="bg-muted/20 p-8 rounded-2xl border border-border/50 hover:bg-muted/40 transition-all flex items-center justify-center min-w-[240px] group grayscale hover:grayscale-0">
                <img src={partner.logo} alt={partner.name} className="h-10 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Grid Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">REGISTRATION</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Secure Your <span className="text-primary italic">Spot</span></h3>
            <p className="text-muted-foreground font-medium text-lg opacity-80">Select the event you want to register for:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
            {registrationEvents.map((event, idx) => (
              <div key={idx} className="bg-background rounded-2xl p-7 shadow-sm hover:shadow-xl border border-border transition-all hover:border-primary/40 cursor-pointer group flex flex-col justify-between items-start min-h-[160px] hover:-translate-y-1">
                <h4 className="text-sm font-bold text-foreground leading-snug uppercase tracking-tight">{event}</h4>
                <div className="text-primary text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform mt-4">
                  Register <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
