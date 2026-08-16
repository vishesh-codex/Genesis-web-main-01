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

export default function ApplyVentureCapitalPage() {
  const [fundDeckFile, setFundDeckFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFundDeckFile(event.target.files[0])
    }
  }

  const handleFileRemove = () => {
    setFundDeckFile(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Venture Capital Application submitted!")
    // In a real application, send data to backend
    alert("Venture Capital application submitted successfully! (Check console for data)")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Apply as Venture Capital</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Venture Capital <span className="text-[#6CBD45]">Partnership</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Partner with us as an institutional investor to fund high-growth potential startups.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Firm Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Firm Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="firmName">Venture Capital Firm Name *</Label>
                    <Input id="firmName" name="firmName" placeholder="Enter your firm's name" required />
                  </div>
                  <div>
                    <Label htmlFor="firmWebsite">Firm Website *</Label>
                    <Input
                      id="firmWebsite"
                      name="firmWebsite"
                      type="url"
                      placeholder="e.g., https://yourvcfirm.com"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person Full Name *</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        placeholder="Enter contact person's name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Person Email ID *</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        placeholder="Enter contact email address"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contactMobile">Contact Person Mobile Number</Label>
                    <Input
                      id="contactMobile"
                      name="contactMobile"
                      type="tel"
                      placeholder="Enter contact mobile number"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Investment Focus */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Investment Focus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="investmentThesis">Investment Thesis/Focus Areas (Max 300 words) *</Label>
                    <Textarea
                      id="investmentThesis"
                      name="investmentThesis"
                      placeholder="Describe your firm's investment strategy and preferred sectors."
                      className="min-h-[150px]"
                      maxLength={300}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">Maximum 300 words</div>
                  </div>
                  <div>
                    <Label htmlFor="fundSize">Current Fund Size (in INR Crores) *</Label>
                    <Input id="fundSize" name="fundSize" type="number" min="1" placeholder="e.g., 100" required />
                  </div>
                  <div>
                    <Label htmlFor="ticketSize">Typical Investment Ticket Size *</Label>
                    <Select name="ticketSize">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your typical investment range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5Cr">₹1Cr - ₹5Cr</SelectItem>
                        <SelectItem value="5-10Cr">₹5Cr - ₹10Cr</SelectItem>
                        <SelectItem value="10-25Cr">₹10Cr - ₹25Cr</SelectItem>
                        <SelectItem value="25Cr+">₹25Cr+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="portfolioCompanies">Notable Portfolio Companies (Optional)</Label>
                    <Textarea
                      id="portfolioCompanies"
                      name="portfolioCompanies"
                      placeholder="List a few key companies in your portfolio."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fundDeck">Attach Fund Deck/Profile (Optional, PDF only)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6CBD45] transition-colors relative">
                      {fundDeckFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{fundDeckFile.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={handleFileRemove}>
                            <XCircle className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF (max 25MB)</p>
                          <Input
                            id="fundDeck"
                            name="fundDeck"
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
                      knowledge. I understand that partnership opportunities are subject to mutual agreement and due
                      diligence by Genesis - QUIC.
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