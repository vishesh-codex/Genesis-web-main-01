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

export default function ApplyInvestorPage() {
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPortfolioFile(event.target.files[0])
    }
  }

  const handleFileRemove = () => {
    setPortfolioFile(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Investor Application submitted!")
    // In a real application, send data to backend
    alert("Investor application submitted successfully! (Check console for data)")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Apply as Investor</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Angel Investor <span className="text-[#6CBD45]">Application</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Invest in promising startups and be part of their growth journey while generating returns.
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

              {/* Investment Preferences */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Investment Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="investmentFocus">Preferred Investment Sectors (Select all that apply) *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tech" name="investmentFocus" value="technology" />
                        <Label htmlFor="tech">Technology</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fintech" name="investmentFocus" value="fintech" />
                        <Label htmlFor="fintech">FinTech</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edtech" name="investmentFocus" value="edtech" />
                        <Label htmlFor="edtech">EdTech</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="healthcare" name="investmentFocus" value="healthcare" />
                        <Label htmlFor="healthcare">Healthcare</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="agritech" name="investmentFocus" value="agritech" />
                        <Label htmlFor="agritech">AgriTech</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cleantech" name="investmentFocus" value="cleantech" />
                        <Label htmlFor="cleantech">CleanTech</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="social-impact" name="investmentFocus" value="social-impact" />
                        <Label htmlFor="social-impact">Social Impact</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ticketSize">Typical Investment Ticket Size *</Label>
                    <Select name="ticketSize">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your typical investment range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-10L">₹5L - ₹10L</SelectItem>
                        <SelectItem value="10-25L">₹10L - ₹25L</SelectItem>
                        <SelectItem value="25-50L">₹25L - ₹50L</SelectItem>
                        <SelectItem value="50L-1Cr">₹50L - ₹1Cr</SelectItem>
                        <SelectItem value="1Cr+">₹1Cr+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pastInvestments">Brief on Past Investments (Optional)</Label>
                    <Textarea
                      id="pastInvestments"
                      name="pastInvestments"
                      placeholder="Mention any notable past startup investments or exits."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Attach Investment Portfolio/Profile (Optional, PDF only)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6CBD45] transition-colors relative">
                      {portfolioFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{portfolioFile.name}</span>
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
                            id="portfolio"
                            name="portfolio"
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
                      knowledge. I understand that my interest in investing is subject to due diligence and mutual
                      agreement with Genesis - QUIC and the startups.
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