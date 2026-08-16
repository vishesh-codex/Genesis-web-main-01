import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, Scale } from "lucide-react"
import * as React from "react"

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-[#0B0D12] via-[#0f1117] to-[#141824] overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6CBD45]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6CBD45]/10 border border-[#6CBD45]/30 text-[#6CBD45] text-xs font-semibold tracking-wider uppercase">
            <Scale className="w-3.5 h-3.5" />
            Terms of Service
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6CBD45] via-emerald-400 to-lime-300">Conditions</span>
          </h1>
          <p className="text-slate-400 text-sm font-mono">Last updated: December 2024 • Genesis - QUIC Framework</p>
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
                    <span className="text-[#6CBD45]">1.</span> Acceptance of Terms
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    By accessing and using the Genesis - QUIC portal, submitting incubator applications, or engaging with our mentor and lab facilities, you agree to be bound by these terms.
                  </p>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">2.</span> Incubation Program Governance
                  </h2>
                  <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm sm:text-base pl-2">
                    <li>Selection into cohorts is evaluated by our independent technical committee.</li>
                    <li>Incubated ventures must maintain milestone progress and ethical standards.</li>
                    <li>Grant disbursements and lab usage follow official university policies.</li>
                  </ul>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">3.</span> Intellectual Property Rights
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    Founders retain full IP ownership over their proprietary code, hardware designs, and patent disclosures. Genesis - QUIC assists in IPR filing without claiming default equity unless explicitly agreed upon.
                  </p>
                </section>

                <section className="space-y-3 pt-6 border-t border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#6CBD45]">4.</span> Contact Legal Team
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    For legal or compliance inquiries:
                    <br />
                    <span className="text-[#6CBD45] font-mono">Email: legal@genesis-quic.in</span>
                    <br />
                    Genesis Innovation Hub, Quantum University, Roorkee, Uttarakhand 247167
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
