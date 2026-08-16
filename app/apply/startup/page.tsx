"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, XCircle } from "lucide-react"
import { useState } from "react"
import * as React from "react"

import { SuccessModal } from "@/components/ui/success-modal"

export default function ApplyStartupPage() {
  const [cofounders, setCofounders] = useState([{ name: "", role: "", email: "", phone: "" }])
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [refId, setRefId] = useState("")
  const [formData, setFormData] = useState({ startupName: "", sector: "" })

  const addCofounder = () => {
    setCofounders([...cofounders, { name: "", role: "", email: "", phone: "" }])
  }

  const removeCofounder = (index: number) => {
    const newCofounders = cofounders.filter((_, i) => i !== index)
    setCofounders(newCofounders)
  }

  const handleCofounderChange = (index: number, field: string, value: string) => {
    const newCofounders = cofounders.map((cofounder, i) => (i === index ? { ...cofounder, [field]: value } : cofounder))
    setCofounders(newCofounders)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPitchDeckFile(event.target.files[0])
    }
  }

  const handleFileRemove = () => {
    setPitchDeckFile(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.target as any
    const startupName = target.startupName?.value || "Incubatee Venture"
    const sector = target.sector?.value || "Deep Tech"
    
    // Generate unique Ref ID
    const randomRef = `#GEN-2026-X${Math.floor(1000 + Math.random() * 9000)}`
    setRefId(randomRef)
    setFormData({ startupName, sector })
    setShowSuccessModal(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Apply as Startup</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Startup Incubation <span className="text-[#6CBD45]">Application</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Join our incubation program and get access to funding, mentorship, and resources to scale your startup.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Startup Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Startup Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="startupName">Startup Name *</Label>
                    <Input id="startupName" name="startupName" placeholder="Enter your startup's name" required />
                  </div>
                  <div>
                    <Label htmlFor="website">Website/Social Media Link</Label>
                    <Input id="website" name="website" placeholder="e.g., https://yourstartup.com" />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector/Industry *</Label>
                    <Select name="sector">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fintech">FinTech</SelectItem>
                        <SelectItem value="edtech">EdTech</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="agritech">AgriTech</SelectItem>
                        <SelectItem value="cleantech">CleanTech</SelectItem>
                        <SelectItem value="social-impact">Social Impact</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ideaDescription">Brief Description of Your Startup Idea (Max 300 words) *</Label>
                    <Textarea
                      id="ideaDescription"
                      name="ideaDescription"
                      placeholder="Describe your startup idea, problem it solves, and solution..."
                      className="min-h-[150px]"
                      maxLength={300}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">Maximum 300 words</div>
                  </div>
                  <div>
                    <Label htmlFor="traction">Current Traction/Milestones (if any)</Label>
                    <Textarea
                      id="traction"
                      name="traction"
                      placeholder="e.g., users, revenue, partnerships, MVP status"
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Team Information */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Team Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="founderName">Founder's Full Name *</Label>
                    <Input id="founderName" name="founderName" placeholder="Enter your full name" required />
                  </div>
                  <div>
                    <Label htmlFor="founderEmail">Founder's Email ID *</Label>
                    <Input
                      id="founderEmail"
                      name="founderEmail"
                      type="email"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="founderMobile">Founder's Mobile Number *</Label>
                    <Input
                      id="founderMobile"
                      name="founderMobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamMembersCount">Number of Team Members (including founders) *</Label>
                    <Select name="teamMembersCount">
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of team members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Solo founder)</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5-10">5-10</SelectItem>
                        <SelectItem value="10+">10+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Details of Co-founders (if any)</Label>
                    <div className="space-y-4 mt-2">
                      <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-700">
                        <div>Name</div>
                        <div>Role</div>
                        <div>Email</div>
                        <div>Phone</div>
                      </div>

                      {cofounders.map((cofounder, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 relative">
                          <Input
                            placeholder="Co-founder name"
                            value={cofounder.name}
                            onChange={(e) => handleCofounderChange(index, "name", e.target.value)}
                          />
                          <Input
                            placeholder="Role/Position"
                            value={cofounder.role}
                            onChange={(e) => handleCofounderChange(index, "role", e.target.value)}
                          />
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={cofounder.email}
                            onChange={(e) => handleCofounderChange(index, "email", e.target.value)}
                          />
                          <Input
                            type="tel"
                            placeholder="Phone number"
                            value={cofounder.phone}
                            onChange={(e) => handleCofounderChange(index, "phone", e.target.value)}
                          />
                          {cofounders.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCofounder(index)}
                              className="absolute -right-8 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                            >
                              <XCircle className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCofounder}
                        className="border-[#6CBD45] text-[#6CBD45] hover:bg-green-50 bg-transparent"
                      >
                        Add More Co-founders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding & Pitch Deck */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Funding & Pitch Deck</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="fundingStage">Current Funding Stage *</Label>
                    <Select name="fundingStage">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current funding stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea Stage</SelectItem>
                        <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series-a">Series A</SelectItem>
                        <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pitchDeck">Attach Pitch Deck (PDF, PPT, PPTX - max 25MB) *</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6CBD45] transition-colors relative">
                      {pitchDeckFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{pitchDeckFile.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={handleFileRemove}>
                            <XCircle className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF, PPT, PPTX (max 25MB)</p>
                          <Input
                            id="pitchDeck"
                            name="pitchDeck"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.ppt,.pptx"
                            onChange={handleFileChange}
                            required
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Declaration */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      I hereby declare that all the information provided above is true and correct to the best of my
                      knowledge. I understand that selection into the program is based on evaluation and commitment.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="declaration" name="declaration" required />
                    <Label htmlFor="declaration" className="text-sm">
                      I agree to the above declaration and terms & conditions *
                    </Label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="signature">Digital Signature *</Label>
                      <Input id="signature" name="signature" placeholder="Type your full name as signature" required />
                    </div>
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center pt-8">
                <Button type="submit" size="lg" className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white px-12 py-4">
                  Submit Application
                  <Send className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Please review all information before submitting. You will receive a confirmation email after
                  successful submission.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Startup Application Submitted!"
        subtitle="Your incubation proposal has been logged successfully. Our investment committee will review your application within 48 hours."
        referenceId={refId}
        type="application"
        details={[
          { label: "Startup Name", value: formData.startupName || "Venture Inc." },
          { label: "Sector Track", value: formData.sector || "Deep Tech" },
          { label: "Review Status", value: "Under Screening" },
        ]}
        actionText="Back to Ecosystem"
        onAction={() => window.location.href = "/"}
      />
    </div>
  )
}