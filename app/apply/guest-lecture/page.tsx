"use client"

import * as React from "react"
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

export default function ApplyGuestLecturePage() {
  const [bioFile, setBioFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setBioFile(event.target.files[0])
    }
  }

  const handleFileRemove = () => {
    setBioFile(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Guest Lecture Application submitted!")
    // In a real application, send data to backend
    alert("Guest Lecture application submitted successfully! (Check console for data)")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Apply for Guest Lecture</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Guest Lecture <span className="text-[#6CBD45]">Application</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Share your knowledge and experience with our startup community through engaging speaking engagements.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" name="fullName" placeholder="Enter your full name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email ID *</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter your email address" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input id="mobile" name="mobile" type="tel" placeholder="Enter your mobile number" required />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                      <Input id="linkedin" name="linkedin" placeholder="e.g., https://linkedin.com/in/yourprofile" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization/Company</Label>
                    <Input id="organization" name="organization" placeholder="Your organization or company" />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" name="designation" placeholder="Your current designation" />
                  </div>
                </CardContent>
              </Card>

              {/* Lecture Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Lecture Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="topic">Proposed Lecture Topic *</Label>
                    <Input id="topic" name="topic" placeholder="e.g., The Future of AI in Startups" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Brief Description of Lecture Content (Max 300 words) *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Outline the key points and takeaways for the audience."
                      className="min-h-[150px]"
                      maxLength={300}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">Maximum 300 words</div>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience *</Label>
                    <Select name="targetAudience">
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="early-stage-startups">Early-Stage Startups</SelectItem>
                        <SelectItem value="growth-stage-startups">Growth-Stage Startups</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="general">General Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date(s) (Optional)</Label>
                    <Input id="preferredDate" name="preferredDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Estimated Duration (minutes) *</Label>
                    <Input id="duration" name="duration" type="number" min="30" placeholder="e.g., 60" required />
                  </div>
                  <div>
                    <Label htmlFor="bioFile">Attach Speaker Bio/Profile (Optional, PDF only)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6CBD45] transition-colors relative">
                      {bioFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{bioFile.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={handleFileRemove}>
                            <XCircle className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF (max 5MB)</p>
                          <Input
                            id="bioFile"
                            name="bioFile"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf"
                            onChange={handleFileChange}
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
                      knowledge. I understand that the invitation for a guest lecture is subject to review and approval
                      by Genesis - QUIC.
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
                  Please review all information before submitting. We will contact you shortly.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
