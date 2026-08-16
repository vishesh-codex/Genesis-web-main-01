import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Lock, FileText } from "lucide-react"
import * as React from "react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-[#0B0D12] via-[#0f1117] to-[#141824] overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6CBD45]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Governance & Trust
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300">Policy</span>
          </h1>
          <p className="text-slate-400 text-sm font-mono">Last updated: December 2024 • Genesis - QUIC Section 8 Company</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-[#0f1117]">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-[#141824]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl text-slate-300 border-t-4 border-t-[#6CBD45]">
              <CardContent className="p-8 sm:p-12 space-y-8">
                <section className="space-y-3">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">1.</span> Information We Collect
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    We collect information you provide directly to us, such as when you create an account, apply for our incubation or pre-incubation programs, or contact us. This includes:
                  </p>
                  <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm sm:text-base pl-2">
                    <li>Personal contact data (full name, official email address, phone number)</li>
                    <li>Professional background (startup role, technical skills, founder bios)</li>
                    <li>Application materials (pitch decks, financial projections, prototype links)</li>
                    <li>Communication records (inquiries, mentorship check-ins, application notes)</li>
                  </ul>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">2.</span> How We Use Your Information
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">We use the collected information exclusively to:</p>
                  <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm sm:text-base pl-2">
                    <li>Process, triage, and evaluate incubator applications</li>
                    <li>Deliver mentorship, co-working space access, and laboratory facilities</li>
                    <li>Connect shortlisted founders with angel investor and VC networks (with prior consent)</li>
                    <li>Comply with regulatory reporting for Section 8 incubators</li>
                  </ul>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">3.</span> Confidentiality & Data Security
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    We implement enterprise-grade technical and organizational measures to safeguard your proprietary startup ideas, business plans, and personal data against unauthorized disclosure or loss.
                  </p>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">4.</span> Contact & Data Requests
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    For questions or data modification requests, contact our privacy officer at:
                    <br />
                    <span className="text-[#6CBD45] font-mono">Email: privacy@genesis-quic.in</span>
                    <br />
                    Address: Genesis Innovation Hub, Quantum University, Roorkee, Uttarakhand 247167
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
