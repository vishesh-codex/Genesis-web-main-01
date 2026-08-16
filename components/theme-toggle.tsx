'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = resolvedTheme || theme
  const isDark = currentTheme === 'dark'

  if (!mounted) {
    return (
      <button
        type="button"
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card/80 text-muted-foreground opacity-60 cursor-pointer ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-5 w-5 opacity-40" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card/80 hover:bg-card text-foreground hover:text-[#6CBD45] hover:border-[#6CBD45]/40 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:rotate-12" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-[#6CBD45] group-hover:-rotate-12" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

export default ThemeToggle

