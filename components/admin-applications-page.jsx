"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Lightbulb,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react"

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications/list')
      const data = await response.json()
      
      if (response.ok) {
        setApplications(data.applications)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.startupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.sector.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        )
        
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }))
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const exportToCSV = () => {
    const csvData = applications.map(app => ({
      'Full Name': app.fullName,
      'Email': app.email,
      'Mobile': app.mobile,
      'City': app.city,
      'State': app.state,
      'Institution': app.institution,
      'Startup Name': app.startupName || 'N/A',
      'Sector': app.sector,
      'Team Members': app.numTeamMembers,
      'Status': app.status,
      'Submitted At': new Date(app.submittedAt).toLocaleDateString()
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under-review': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />
      case 'under-review': return <AlertCircle className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6CBD45] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Applications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchApplications} className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Management</h1>
              <p className="text-gray-600">Pre-Incubation Program Applications</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                Total: {applications.length}
              </Badge>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="border-[#6CBD45] text-[#6CBD45] hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, startup name, or sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Applications List */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-6">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "No applications have been submitted yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <Card key={application._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.fullName}
                          </h3>
                          <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{application.mobile}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>{application.institution}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {application.sector}
                          </Badge>
                          {application.startupName && (
                            <Badge variant="outline" className="text-xs">
                              {application.startupName}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {application.numTeamMembers} members
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under-review">Under Review</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <Button
                          onClick={() => {
                            setSelectedApplication(application)
                            setShowDetails(true)
                          }}
                          size="sm"
                          className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="ghost"
                  size="sm"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Full Name:</strong> {selectedApplication.fullName}</div>
                  <div><strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</div>
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  <div><strong>Mobile:</strong> {selectedApplication.mobile}</div>
                  <div><strong>Gender:</strong> {selectedApplication.gender}</div>
                  <div><strong>City:</strong> {selectedApplication.city}</div>
                  <div><strong>State:</strong> {selectedApplication.state}</div>
                </div>
              </div>

              {/* Academic Background */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic/Professional Background</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Current Status:</strong> {selectedApplication.currentStatus}</div>
                  <div><strong>Institution:</strong> {selectedApplication.institution}</div>
                  <div><strong>Course:</strong> {selectedApplication.course || 'N/A'}</div>
                  <div><strong>Year of Study:</strong> {selectedApplication.yearOfStudy || 'N/A'}</div>
                </div>
              </div>

              {/* Startup Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup Idea Details</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Startup Name:</strong> {selectedApplication.startupName || 'N/A'}</div>
                  <div><strong>Sector:</strong> {selectedApplication.sector}</div>
                  <div><strong>Idea Stage:</strong> {selectedApplication.ideaStage}</div>
                  <div>
                    <strong>Idea Description:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded">{selectedApplication.ideaDescription}</p>
                  </div>
                  <div>
                    <strong>Problem Solving:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded">{selectedApplication.problemSolving}</p>
                  </div>
                  <div>
                    <strong>Target Customers:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded">{selectedApplication.targetCustomers}</p>
                  </div>
                </div>
              </div>

              {/* Team Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                <div className="text-sm">
                  <div className="mb-3"><strong>Number of Team Members:</strong> {selectedApplication.numTeamMembers}</div>
                  {selectedApplication.cofounders && selectedApplication.cofounders.length > 0 && (
                    <div>
                      <strong>Co-founders:</strong>
                      <div className="mt-2 space-y-2">
                        {selectedApplication.cofounders.map((cofounder, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded">
                            <div className="grid md:grid-cols-2 gap-2">
                              <div><strong>Name:</strong> {cofounder.name}</div>
                              <div><strong>Role:</strong> {cofounder.role}</div>
                              <div><strong>Email:</strong> {cofounder.email}</div>
                              <div><strong>Phone:</strong> {cofounder.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Program Commitment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Commitment</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Willing to Attend:</strong> {selectedApplication.willingToAttend}</div>
                  <div><strong>Committed to Work:</strong> {selectedApplication.committedToWork}</div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedApplication.pitchDeckUrl || selectedApplication.socialMedia) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedApplication.pitchDeckUrl && (
                      <div><strong>Pitch Deck:</strong> <a href={selectedApplication.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.pitchDeckUrl}</a></div>
                    )}
                    {selectedApplication.socialMedia && (
                      <div><strong>Social Media/Website:</strong> <a href={selectedApplication.socialMedia} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.socialMedia}</a></div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Metadata</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Submitted At:</strong> {new Date(selectedApplication.submittedAt).toLocaleString()}</div>
                  <div><strong>Status:</strong> <Badge className={getStatusColor(selectedApplication.status)}>{selectedApplication.status}</Badge></div>
                  <div><strong>Signature:</strong> {selectedApplication.signature}</div>
                  <div><strong>Signature Date:</strong> {new Date(selectedApplication.signatureDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}