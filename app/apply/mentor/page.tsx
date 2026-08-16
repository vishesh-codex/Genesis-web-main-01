"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, XCircle } from "lucide-react"
import { useState } from "react"
import * as React from "react"

export default function ApplyMentorPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0])
    }
  }

  const handleFileRemove = () => {
    setResumeFile(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Mentor Application submitted!")
    // In a real application, send data to backend
    alert("Mentor application submitted successfully! (Check console for data)")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Apply as Mentor</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mentor Program <span className="text-[#6CBD45]">Application</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Share your expertise and guide the next generation of entrepreneurs as a mentor in our ecosystem.
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
                </CardContent>
              </Card>

              {/* Professional Background */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Professional Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="currentRole">Current Role/Designation *</Label>
                    <Input
                      id="currentRole"
                      name="currentRole"
                      placeholder="e.g., CEO, Senior Engineer, Consultant"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company/Organization *</Label>
                    <Input id="company" name="company" placeholder="Enter your company name" required />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Professional Experience *</Label>
                    <Input
                      id="yearsExperience"
                      name="yearsExperience"
                      type="number"
                      min="1"
                      placeholder="e.g., 10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expertiseAreas">Areas of Expertise (Select all that apply) *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tech" name="expertise" value="technology" />
                        <Label htmlFor="tech">Technology</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" name="expertise" value="marketing" />
                        <Label htmlFor="marketing">Marketing & Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="finance" name="expertise" value="finance" />
                        <Label htmlFor="finance">Finance & Fundraising</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="product" name="expertise" value="product" />
                        <Label htmlFor="product">Product Development</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="legal" name="expertise" value="legal" />
                        <Label htmlFor="legal">Legal & Compliance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hr" name="expertise" value="hr" />
                        <Label htmlFor="hr">HR & Team Building</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="strategy" name="expertise" value="strategy" />
                        <Label htmlFor="strategy">Business Strategy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="operations" name="expertise" value="operations" />
                        <Label htmlFor="operations">Operations</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Short Bio / Mentoring Philosophy (Max 200 words) *</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about your background and what you hope to achieve as a mentor."
                      className="min-h-[120px]"
                      maxLength={200}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">Maximum 200 words</div>
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Preferences */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Mentorship Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Preferred Mentorship Style *</Label>
                    <RadioGroup name="mentorshipStyle" defaultValue="" className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="one-on-one" id="one-on-one" />
                        <Label htmlFor="one-on-one">One-on-one</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="group" />
                        <Label htmlFor="group">Group Sessions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Both</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="timeCommitment">Estimated Monthly Time Commitment (hours) *</Label>
                    <Select name="timeCommitment">
                      <SelectTrigger>
                        <SelectValue placeholder="Select hours per month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 hours</SelectItem>
                        <SelectItem value="3-5">3-5 hours</SelectItem>
                        <SelectItem value="6-10">6-10 hours</SelectItem>
                        <SelectItem value="10+">10+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resume">Attach Resume/CV (Optional, PDF only)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6CBD45] transition-colors relative">
                      {resumeFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{resumeFile.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={handleFileRemove}>
                            <XCircle className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF (max 10MB)</p>
                          <Input
                            id="resume"
                            name="resume"
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
                      knowledge. I understand that my participation as a mentor is subject to review and approval by
                      Genesis - QUIC.
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
    </div>
  )
}