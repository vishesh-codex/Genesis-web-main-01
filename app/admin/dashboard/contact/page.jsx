"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  Mail,
  Phone,
  MessageCircle,
  Eye,
  Trash2,
  Reply,
  Archive,
  Star,
  Clock,
  Download,
  Filter,
  MoreHorizontal
} from "lucide-react"

export default function ContactPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState([])

  const contacts = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+91 98765 43210",
      subject: "Inquiry about incubation program",
      message: "I'm interested in applying for your incubation program. Could you provide more details about the application process? I have a tech startup focused on AI solutions for healthcare and would love to learn more about your selection criteria, timeline, and support offered during the incubation period.",
      status: "new",
      priority: "high",
      date: "2024-01-20",
      time: "10:30 AM",
      source: "website",
      tags: ["incubation", "healthcare", "AI"]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@startup.com",
      phone: "+91 98765 43211",
      subject: "Partnership opportunity",
      message: "We'd like to explore partnership opportunities with Genesis. Our startup focuses on AI-driven solutions for e-commerce and we believe there could be synergies with your incubated companies. Would love to schedule a meeting to discuss potential collaboration.",
      status: "replied",
      priority: "medium",
      date: "2024-01-19",
      time: "03:45 PM",
      source: "referral",
      tags: ["partnership", "e-commerce", "AI"]
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "m.brown@investor.com",
      phone: "+91 98765 43212",
      subject: "Mentorship & Investment interest",
      message: "I'm an angel investor interested in mentoring startups at Genesis. I have 15+ years of experience in FinTech and DeepTech and would love to contribute to your ecosystem as a mentor or potential investor.",
      status: "pending",
      priority: "high",
      date: "2024-01-18",
      time: "11:15 AM",
      source: "social_media",
      tags: ["investor", "mentorship", "fintech"]
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@university.edu",
      phone: "+91 98765 43213",
      subject: "Student Innovation Program Inquiry",
      message: "Our university student club wants to visit Genesis TBI to learn about startup incubation. We have around 40 engineering students interested in entrepreneurship.",
      status: "resolved",
      priority: "low",
      date: "2024-01-17",
      time: "02:20 PM",
      source: "website",
      tags: ["student", "visit", "event"]
    }
  ]

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter
    const matchesPriority = priorityFilter === "all" || contact.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status) => {
    switch(status) {
      case "new": return "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800/80"
      case "replied": return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80"
      case "pending": return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80"
      case "resolved": return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
      default: return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80"
      case "medium": return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80"
      case "low": return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80"
      default: return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
    }
  }

  const getSourceIcon = (source) => {
    switch(source) {
      case "website": return "🌐"
      case "referral": return "👥"
      case "social_media": return "📱"
      default: return "📧"
    }
  }

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on contacts:`, selectedContacts)
    setSelectedContacts([])
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contact Messages</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Manage inquiries and communication from potential startups and partners</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white font-bold">
            <Mail className="w-4 h-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Messages</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{contacts.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+3 from last week</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">New Messages</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {contacts.filter(c => c.status === "new").length}
                </p>
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">Requires attention</p>
              </div>
              <Mail className="w-8 h-8 text-rose-500 dark:text-rose-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {contacts.filter(c => c.status === "pending").length}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Awaiting response</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Response Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">94%</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">↑ 2% from last month</p>
              </div>
              <MessageCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Messages Table */}
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <span>All Messages</span>
              {selectedContacts.length > 0 && (
                <Badge className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800/80">
                  {selectedContacts.length} selected
                </Badge>
              )}
            </CardTitle>
            
            {/* Filters and Search */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search messages, names, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full lg:w-64 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white text-sm"
              >
                <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Status</option>
                <option value="new" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">New</option>
                <option value="replied" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Replied</option>
                <option value="pending" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Pending</option>
                <option value="resolved" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6CBD45] focus:border-[#6CBD45] bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-white text-sm"
              >
                <option value="all" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">All Priority</option>
                <option value="high" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">High</option>
                <option value="medium" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Medium</option>
                <option value="low" className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white">Low</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Bulk actions:</span>
              <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300" onClick={() => handleBulkAction('reply')}>
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>
              <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300" onClick={() => handleBulkAction('archive')}>
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-rose-600 dark:text-rose-400 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-[#6CBD45] focus:ring-[#6CBD45] border-slate-300 dark:border-slate-700 rounded bg-slate-100 dark:bg-slate-900"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Select all ({filteredContacts.length} messages)
              </span>
            </div>

            {/* Contact Messages List */}
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-900/60 hover:shadow-md transition-all">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    className="mt-1 h-4 w-4 text-[#6CBD45] focus:ring-[#6CBD45] border-slate-300 dark:border-slate-700 rounded bg-slate-100 dark:bg-slate-900"
                  />
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{contact.name}</h3>
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                        <Badge className={getPriorityColor(contact.priority)}>
                          {contact.priority} priority
                        </Badge>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {getSourceIcon(contact.source)} {contact.source.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {contact.date} at {contact.time}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-slate-800 dark:text-slate-200 mb-1">
                        <strong>Subject:</strong> {contact.subject}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{contact.message}</p>
                    </div>
                    
                    {/* Contact Info and Tags */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-[#6CBD45]" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" title="View Full Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white" title="Reply">
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" title="Archive">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" title="More Actions">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No messages found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "When people contact you, their messages will appear here."}
              </p>
              {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button
                  variant="outline"
                  className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}