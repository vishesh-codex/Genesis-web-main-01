// components/admin/admin-sidebar.jsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Building,
  BookOpen,
  Briefcase,
  Image,
  Contact,
  Shield,
  X,
  ChevronRight,
  UserCog,
  KeyRound,
  UserCheck,
  Radio,
  ChevronDown as ChevronDownIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

// All sidebar items with their permission key
const MAIN_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "applications", label: "Applications", icon: FileText, href: "/admin/dashboard/applications", badge: null },
  { id: "startups", label: "Startups", icon: Building, href: "/admin/dashboard/startups" },
  { id: "events", label: "Events", icon: Calendar, href: "/admin/dashboard/events" },
  { id: "volunteers", label: "Volunteers", icon: UserCheck, href: "/admin/dashboard/volunteers" },
  { id: "scanner", label: "Event Scanner", icon: Radio, href: "/vishesh-event" },
  { id: "blogs", label: "Blogs", icon: BookOpen, href: "/admin/dashboard/blogs" },
  { id: "pages", label: "Pages", icon: FileText, href: "/admin/dashboard/pages" },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, href: "/admin/dashboard/portfolio" },
  { id: "gallery", label: "Gallery", icon: Image, href: "/admin/dashboard/gallery" },
  { id: "contact", label: "Contact", icon: Contact, href: "/admin/dashboard/contact" },
  { id: "users", label: "Users", icon: Users, href: "/admin/dashboard/users" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
]

const PERMISSION_ITEMS = [
  { id: "team", label: "Team Control", icon: Shield, href: "/admin/dashboard/team" },
  { id: "roles", label: "Roles", icon: KeyRound, href: "/admin/dashboard/roles" },
  { id: "admins", label: "Admins", icon: UserCog, href: "/admin/dashboard/admins" },
]

export function AdminSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { admin, hasPermission, isSuper, loading } = useAdminAuth()

  // Auto-open permissions section if on a permission sub-page
  useEffect(() => {
    if (pathname?.startsWith("/admin/dashboard/roles") || pathname?.startsWith("/admin/dashboard/admins") || pathname?.startsWith("/admin/dashboard/team")) {
      setPermissionsOpen(true)
    }
  }, [pathname])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Filter main items by permission
  const visibleMainItems = MAIN_ITEMS.filter((item) =>
    item.id === "dashboard"
      ? true
      : item.id === "scanner"
      ? (isSuper || hasPermission("scanner") || hasPermission("volunteers") || hasPermission("events"))
      : (isSuper || hasPermission(item.id))
  )
  const visiblePermItems = PERMISSION_ITEMS.filter((item) => isSuper || hasPermission(item.id))
  const showPermissionsSection = visiblePermItems.length > 0

  const allItems = [...MAIN_ITEMS, ...PERMISSION_ITEMS]
  const getCurrentPageTitle = () => {
    const current = allItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
    return current ? current.label : "Admin Panel"
  }
  const getCurrentPageIcon = () => {
    const current = allItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
    return current ? current.icon : LayoutDashboard
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        router.push("/admin")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  const NavItem = ({ item, collapsed }) => {
    const isActive =
      (item.href === "/admin/dashboard" && pathname === "/admin/dashboard") ||
      (item.href !== "/admin/dashboard" && (pathname === item.href || pathname?.startsWith(item.href + "/")))

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative",
            collapsed ? "justify-center" : "",
            isActive
              ? "bg-[#6CBD45] text-white shadow-md shadow-[#6CBD45]/25"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white"
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon
            className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
              isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
            )}
          />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-5 flex items-center justify-center px-1.5 rounded-full">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </>
          )}
          {collapsed && item.badge && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </Link>
    )
  }

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("border-b border-slate-200 dark:border-white/10 flex items-center", collapsed ? "p-4 justify-center" : "p-5")}>
        <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0 group">
          {/* Parent Logo */}
          <div className="px-2 py-1 rounded-lg bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm flex items-center justify-center flex-shrink-0">
            <img
              src="/qu-logo-name.svg"
              alt="Quantum University"
              className="h-5 w-auto object-contain"
            />
          </div>
          {/* Genesis Logo */}
          <div className="px-2 py-1 rounded-lg bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm flex items-center justify-center flex-shrink-0">
            <img
              src="/white-logo.svg"
              alt="Genesis Logo"
              className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">Genesis Admin</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Incubation Centre</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Main Menu */}
        {!collapsed && (
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-2 pt-1">Main Menu</p>
        )}
        {loading
          ? // Skeleton placeholder while loading permissions
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse mx-1 mb-1" />
          ))
          : visibleMainItems.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}

        {/* Permissions Section */}
        {!loading && showPermissionsSection && (
          <div className="mt-3">
            {collapsed ? (
              // Collapsed: show divider + icons directly
              <>
                <div className="border-t border-slate-200 dark:border-white/10 my-2" />
                {visiblePermItems.map((item) => (
                  <NavItem key={item.id} item={item} collapsed={collapsed} />
                ))}
              </>
            ) : (
              <>
                <button
                  onClick={() => setPermissionsOpen((o) => !o)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">Permissions</span>
                  <ChevronDownIcon
                    className={cn("w-3.5 h-3.5 transition-transform duration-200", permissionsOpen ? "rotate-180" : "")}
                  />
                </button>
                {permissionsOpen && (
                  <div className="mt-1 space-y-1">
                    {visiblePermItems.map((item) => (
                      <NavItem key={item.id} item={item} collapsed={collapsed} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      {/* Admin info + Logout + ThemeToggle */}
      <div className={cn("border-t border-slate-200 dark:border-white/10 p-3 space-y-1.5")}>
        {/* Current admin info */}
        {!collapsed && admin && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-[#6CBD45] to-[#4a9e32] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">
                {(admin.first_name?.[0] || admin.username?.[0] || "A").toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {admin.first_name ? `${admin.first_name} ${admin.last_name || ""}`.trim() : admin.username}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{admin.role_name || "Admin"}</p>
            </div>
          </div>
        )}

        {/* Sidebar Theme Toggle */}
        <div className={cn("flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors", collapsed ? "justify-center" : "")}>
          {!collapsed && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Theme</span>
          )}
          <ThemeToggle />
        </div>

        <div
          onClick={() => setShowLogoutDialog(true)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-500/10 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer group",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Sign Out</span>}
        </div>
      </div>
    </div>
  )

  const PageIcon = getCurrentPageIcon()

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#141824] text-slate-900 dark:text-slate-100 flex w-full font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex bg-white dark:bg-[#0B0D12] border-r border-slate-200 dark:border-slate-800/80 flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out shadow-sm",
          sidebarOpen ? "w-64" : "w-[70px]"
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#0B0D12] border-r border-slate-200 dark:border-slate-800/80 z-50 lg:hidden transition-transform duration-300 ease-in-out flex flex-col shadow-xl",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            {/* Parent Logo */}
            <div className="px-2 py-1 rounded-lg bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/qu-logo-name.svg"
                alt="Quantum University"
                className="h-5 w-auto object-contain"
              />
            </div>
            {/* Genesis Logo */}
            <div className="px-2 py-1 rounded-lg bg-white dark:bg-white border border-slate-200 dark:border-white shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/white-logo.svg"
                alt="Genesis Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base">Genesis Admin</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Incubation Centre</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent collapsed={false} />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0 bg-[#f8fafc] dark:bg-[#141824]",
          "lg:ml-64",
          !sidebarOpen && "lg:ml-[70px]"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0D12]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6CBD45]/10 border border-[#6CBD45]/30 flex items-center justify-center">
                  <PageIcon className="w-4 h-4 text-[#6CBD45]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{getCurrentPageTitle()}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Genesis Incubation Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden md:flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search portal..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] transition-all w-52"
                />
              </div>

              {/* Header Theme Toggle */}
              <ThemeToggle />

              <div className="relative">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative border border-slate-200 dark:border-slate-800/80">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6CBD45] rounded-full" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6CBD45] to-[#4a9e32] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">
                    {admin ? (admin.first_name?.[0] || admin.username?.[0] || "A").toUpperCase() : "A"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {admin ? (admin.first_name || admin.username) : "Admin"}
                  </p>
                  <p className="text-xs text-[#6CBD45] font-mono">{admin?.role_name || "Administrator"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-[#f8fafc] dark:bg-[#141824] text-slate-900 dark:text-slate-100 transition-colors duration-200">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-sm bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-lg text-slate-900 dark:text-white">Sign Out?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to sign out? You will need to enter your credentials to access the admin panel again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing out...
                </div>
              ) : (
                "Sign Out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}