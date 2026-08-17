// app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'
import * as React from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import Chatbot from '@/components/chatbot'

export const metadata: Metadata = {
  title: 'Genesis',
  description: 'Genesis',
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-[#6CBD45] selection:text-white min-h-screen transition-colors duration-300`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}

