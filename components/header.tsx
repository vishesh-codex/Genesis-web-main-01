"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Main Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
          {/* Brand & Parent Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
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
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white border border-slate-200/80 dark:border-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center">
              <img
                src="/white-logo.svg"
                alt="Genesis Logo"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              href="/blogs"
              className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
            >
              Blogs
            </Link>
            <div className="flex items-center space-x-1.5">
              <Link
                href="/portfolio"
                className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
              >
                Portfolio
              </Link>
              <Badge className="bg-gradient-to-r from-[#6CBD45] to-emerald-500 text-white text-[10px] px-1.5 py-0.5 font-mono shadow-sm">
                Active
              </Badge>
            </div>
            <Link
              href="/events"
              className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
            >
              Events
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium text-sm transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button
              asChild
              variant="default"
              shape="full"
              className="font-semibold px-6 py-2.5"
            >
              <Link href="/apply">Apply for Incubation</Link>
            </Button>
          </div>

          {/* Mobile Menu Action */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              shape="full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0B0D12] border-b border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60"
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60"
              >
                About Us
              </Link>
              <Link
                href="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60"
              >
                Blogs
              </Link>
              <Link
                href="/portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between"
              >
                <span>Portfolio</span>
                <Badge className="bg-[#6CBD45] text-white text-xs">Active</Badge>
              </Link>
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60"
              >
                Events
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] font-medium py-2 border-b border-slate-100 dark:border-slate-800/60"
              >
                Contact
              </Link>
              
              <div className="pt-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
                <ThemeToggle />
              </div>

              <Button
                asChild
                variant="default"
                shape="full"
                className="w-full font-semibold py-3 mt-4 text-base"
              >
                <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
                  Apply for Incubation
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
