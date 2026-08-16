import { Button } from "@/components/ui/button"
import { Twitter, Facebook, Instagram, Github, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#0B0D12] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6CBD45]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group inline-flex">
              {/* Parent Logo: Quantum University */}
              <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm flex items-center justify-center">
                <img
                  src="/qu-logo-name.svg"
                  alt="Quantum University"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>

              {/* Vertical Divider */}
              <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700 shrink-0" />

              {/* Subsidiary Logo: Genesis Incubator */}
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm hover:shadow-md transition-all duration-300 inline-flex items-center justify-center">
                <img
                  src="/white-logo.svg"
                  alt="Genesis Logo"
                  className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              QU Innovation Council (QUIC) - Genesis Incubator fosters research, innovation, and technology startups across Uttarakhand & India.
            </p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#6CBD45] shrink-0 mt-0.5" />
                <span>Quantum University, Roorkee, Uttarakhand - 247667</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#6CBD45] shrink-0" />
                <a href="tel:+917417615486" className="hover:text-slate-900 dark:hover:text-white transition-colors">+91 74176 15486</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#6CBD45] shrink-0" />
                <a href="mailto:contact@genesis-quic.in" className="hover:text-slate-900 dark:hover:text-white transition-colors">contact@genesis-quic.in</a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6CBD45]"></span>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  About Genesis
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  Media & Gallery
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  Portfolio Startups
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  Latest Blogs & News
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1.5">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Application Tracks */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6CBD45]"></span>
              Application Portals
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/apply/startup" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Apply as Startup
                </Link>
              </li>
              <li>
                <Link href="/pre-incubation" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  4-Month Pre-Incubation
                </Link>
              </li>
              <li>
                <Link href="/apply/mentor" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Join as Mentor
                </Link>
              </li>
              <li>
                <Link href="/apply/investor" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Angel Investor Circle
                </Link>
              </li>
              <li>
                <Link href="/apply/guest-lecture" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Guest Speaker Portal
                </Link>
              </li>
              <li>
                <Link href="/apply/venture-capital" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Venture Capital Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Social */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6CBD45]"></span>
              Policies & Connect
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <li>
                <Link href="/startup-policy" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Startup Policy & IPR
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/how-to-apply" className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors">
                  How to Apply Guide
                </Link>
              </li>
              <li>
                <a
                  href="https://startuputtarakhand.uk.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6CBD45] dark:hover:text-[#6CBD45] transition-colors flex items-center gap-1"
                >
                  Startup Uttarakhand <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex space-x-3">
              <Button
                size="sm"
                variant="outline"
                className="w-9 h-9 p-0 rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white dark:hover:bg-[#6CBD45] dark:hover:text-white transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-9 h-9 p-0 rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white dark:hover:bg-[#6CBD45] dark:hover:text-white transition-all shadow-sm"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-9 h-9 p-0 rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white dark:hover:bg-[#6CBD45] dark:hover:text-white transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <a
                href="https://github.com/vishesh-codex"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-9 h-9 p-0 rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white dark:hover:bg-[#6CBD45] dark:hover:text-white transition-all shadow-sm"
                >
                  <Github className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8 text-xs text-slate-500 dark:text-slate-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p>© 2026 Genesis - QUIC (Section 8 Company). All rights reserved.</p>
              <p className="mt-1">Managed by Genesis Incubation Center, Quantum University.</p>
            </div>
            <div className="flex items-center gap-2">
              <span>Made with ❤️ by Genesis Tech Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}