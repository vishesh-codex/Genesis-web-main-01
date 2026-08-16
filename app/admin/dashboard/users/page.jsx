"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search, Plus, Edit, Trash2, Eye, Shield, Users, UserCheck, UserX, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const users = [
    { id: 1, name: "Varun Tiwari", email: "varun@genesis.com", role: "admin", status: "active", lastLogin: "Jan 20, 2024", joinDate: "Jan 15, 2023", initials: "VT" },
    { id: 2, name: "John Doe", email: "john@techstart.com", role: "entrepreneur", status: "active", lastLogin: "Jan 19, 2024", joinDate: "Aug 15, 2023", initials: "JD" },
    { id: 3, name: "Sarah Smith", email: "sarah@ecoinnovate.com", role: "entrepreneur", status: "active", lastLogin: "Jan 18, 2024", joinDate: "Jun 20, 2023", initials: "SS" },
    { id: 4, name: "Mike Johnson", email: "mike@healthtech.com", role: "mentor", status: "inactive", lastLogin: "Jan 10, 2024", joinDate: "Dec 10, 2022", initials: "MJ" },
    { id: 5, name: "Emily Brown", email: "emily@financeai.com", role: "entrepreneur", status: "pending", lastLogin: "Never", joinDate: "Jan 12, 2024", initials: "EB" },
  ]

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleConfig = {
    admin: { label: "Admin", className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80" },
    mentor: { label: "Mentor", className: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-800/80" },
    entrepreneur: { label: "Entrepreneur", className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80" },
  }
  const statusConfig = {
    active: { label: "Active", className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80" },
    inactive: { label: "Inactive", className: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800" },
    pending: { label: "Pending", className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80" },
  }
  const initailBgColors = ["from-blue-600 to-indigo-600", "from-emerald-600 to-teal-600", "from-violet-600 to-purple-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600"]

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-[#6CBD45] bg-[#6CBD45]/10 border border-[#6CBD45]/30" },
    { label: "Active", value: users.filter((u) => u.status === "active").length, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
    { label: "Pending", value: users.filter((u) => u.status === "pending").length, icon: UserX, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20" },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: Shield, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20" },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Manage user accounts, roles, and access permissions</p>
        </div>
        <Button className="bg-gradient-to-r from-[#6CBD45] to-[#5ba83a] hover:brightness-110 text-white font-bold shadow-md shadow-[#6CBD45]/20 rounded-xl gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(stats || []).map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg hover:border-[#6CBD45]/50 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 pt-5 px-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">All Users</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 w-44"
                />
              </div>
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-8 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Roles</option>
                  <option value="admin" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Admin</option>
                  <option value="mentor" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Mentor</option>
                  <option value="entrepreneur" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Entrepreneur</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-900/40">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">Joined</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredUsers.map((user, idx) => {
                  const role = roleConfig[user.role] || roleConfig.entrepreneur
                  const status = statusConfig[user.status] || statusConfig.inactive
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br shadow-sm", initailBgColors[idx % initailBgColors.length])}>
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={cn("text-[11px] px-2.5 py-0.5 rounded-full font-medium border capitalize", role.className)}>{role.label}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={cn("text-[11px] px-2.5 py-0.5 rounded-full font-medium border capitalize", status.className)}>{status.label}</Badge>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.lastLogin}</span>
                      </td>
                      <td className="py-3.5 px-4 hidden xl:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.joinDate}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:border-[#6CBD45]/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:border-[#6CBD45]/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                <Users className="w-10 h-10 mb-3 opacity-30 text-[#6CBD45]" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-400">No users found</p>
                <p className="text-xs mt-1 text-slate-500">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Showing {filteredUsers.length} of {users.length} users</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}