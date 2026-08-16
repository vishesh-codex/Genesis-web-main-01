"use client" // This component needs to be a Client Component for interactivity

import * as React from "react"
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
import { Upload, Send, Calendar, MapPin, XCircle, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"


export default function PreIncubationApplyPage() {
  const [cofounders, setCofounders] = useState([{ name: "", role: "", email: "", phone: "" }])
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    applicationId?: string;
  }>({ type: null, message: '' })

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

  const getFormValue = (form: HTMLFormElement, name: string): string => {
    const element = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null
    return element?.value || ''
  }

  const getRadioValue = (form: HTMLFormElement, name: string): string => {
    const element = form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null
    return element?.value || ''
  }

  const getCheckboxValue = (form: HTMLFormElement, name: string): boolean => {
    const element = form.elements.namedItem(name) as HTMLInputElement | null
    return element?.checked || false
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const form = event.currentTarget

      // Collect all form data
      const formData = {
        // Applicant Details
        fullName: getFormValue(form, 'fullName'),
        dateOfBirth: getFormValue(form, 'dateOfBirth'),
        email: getFormValue(form, 'email'),
        mobile: getFormValue(form, 'mobile'),
        gender: getRadioValue(form, 'gender'),
        city: getFormValue(form, 'city'),
        state: getRadioValue(form, 'state'),
        otherState: getFormValue(form, 'otherState'),

        // Academic/Professional Background
        currentStatus: getRadioValue(form, 'currentStatus'),
        otherStatus: getFormValue(form, 'otherStatus'),
        institution: getFormValue(form, 'institution'),
        course: getFormValue(form, 'course'),
        yearOfStudy: getRadioValue(form, 'yearOfStudy'),
        otherYear: getFormValue(form, 'otherYear'),

        // Startup Idea Details
        startupName: getFormValue(form, 'startupName'),
        sector: getRadioValue(form, 'sector'),
        otherSector: getFormValue(form, 'otherSector'),
        ideaDescription: getFormValue(form, 'ideaDescription'),
        problemSolving: getFormValue(form, 'problemSolving'),
        targetCustomers: getFormValue(form, 'targetCustomers'),
        ideaStage: getRadioValue(form, 'ideaStage'),

        // Team Information
        numTeamMembers: (form.elements.namedItem('numTeamMembers') as HTMLSelectElement)?.value || '',
        cofounders: cofounders.filter(cf => cf.name || cf.role || cf.email || cf.phone),

        // Program Commitment
        willingToAttend: getRadioValue(form, 'willingToAttend'),
        committedToWork: getRadioValue(form, 'committedToWork'),

        // Additional Information
        pitchDeckUrl: getFormValue(form, 'pitchDeckUrl'),
        socialMedia: getFormValue(form, 'socialMedia'),

        // Declaration
        declaration: getCheckboxValue(form, 'declaration'),
        signature: getFormValue(form, 'signature'),
        signatureDate: getFormValue(form, 'date'),
      }

      // Submit to API
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message,
          applicationId: result.applicationId,
        })
        // Reset form
        form.reset()
        setCofounders([{ name: "", role: "", email: "", phone: "" }])
        setPitchDeckFile(null)
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Submission failed. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Success/Error Message */}
      {submitStatus.type && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {submitStatus.message}
                </p>
                {submitStatus.applicationId && (
                  <p className="text-sm text-green-600 mt-1">
                    Application ID: {submitStatus.applicationId}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubmitStatus({ type: null, message: '' })}
                className={submitStatus.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#6CBD45] text-white mb-4">Application Form</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pre-Incubation Program <span className="text-[#6CBD45]">Registration</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Organized by Genesis Incubator – QU Innovation Council, Quantum University
            </p>

            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#6CBD45]" />
                <span>Program Dates: 1st August – 30th November 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#6CBD45]" />
                <span>Quantum University, Roorkee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Applicant Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Applicant Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" name="fullName" placeholder="Enter your full name" required />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email ID *</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter your email address" required />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input id="mobile" name="mobile" type="tel" placeholder="Enter your mobile number" required />
                    </div>
                  </div>

                  <div>
                    <Label>Gender *</Label>
                    <RadioGroup name="gender" defaultValue="" className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city">City/Town *</Label>
                      <Input id="city" name="city" placeholder="Enter your city/town" required />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <RadioGroup name="state" defaultValue="" className="flex space-x-6 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="uttarakhand" id="uttarakhand" />
                          <Label htmlFor="uttarakhand">Uttarakhand</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other-state" id="other-state" />
                          <Label htmlFor="other-state">Other</Label>
                        </div>
                      </RadioGroup>
                      <Input className="mt-2" name="otherState" placeholder="If other, please specify" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic/Professional Background */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Academic/Professional Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Current Status *</Label>
                    <RadioGroup
                      name="currentStatus"
                      defaultValue=""
                      className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="faculty" id="faculty" />
                        <Label htmlFor="faculty">Faculty</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="working" id="working" />
                        <Label htmlFor="working">Working Professional</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="entrepreneur" id="entrepreneur" />
                        <Label htmlFor="entrepreneur">Entrepreneur</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="others" id="others" />
                        <Label htmlFor="others">Others</Label>
                      </div>
                    </RadioGroup>
                    <Input className="mt-2" name="otherStatus" placeholder="If others, please specify" />
                  </div>

                  <div>
                    <Label htmlFor="institution">Institution/Organization Name *</Label>
                    <Input
                      id="institution"
                      name="institution"
                      placeholder="Enter institution/organization name"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="course">Course/Department (if applicable)</Label>
                      <Input id="course" name="course" placeholder="Enter course/department" />
                    </div>
                    <div>
                      <Label>Year of Study (if student)</Label>
                      <RadioGroup name="yearOfStudy" defaultValue="" className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1st" id="1st" />
                          <Label htmlFor="1st">1st</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2nd" id="2nd" />
                          <Label htmlFor="2nd">2nd</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3rd" id="3rd" />
                          <Label htmlFor="3rd">3rd</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4th" id="4th" />
                          <Label htmlFor="4th">4th</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other-year" id="other-year" />
                          <Label htmlFor="other-year">Other</Label>
                        </div>
                      </RadioGroup>
                      <Input className="mt-2" name="otherYear" placeholder="If other, please specify" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Startup Idea Details */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Startup Idea Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="startupName">Startup/Team Name (if any)</Label>
                    <Input id="startupName" name="startupName" placeholder="Enter startup/team name" />
                  </div>

                  <div>
                    <Label>Sector/Industry *</Label>
                    <RadioGroup name="sector" defaultValue="" className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="technology" id="technology" />
                        <Label htmlFor="technology">Technology</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="agri" id="agri" />
                        <Label htmlFor="agri">Agri</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clean-energy" id="clean-energy" />
                        <Label htmlFor="clean-energy">Clean Energy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="social-impact" id="social-impact" />
                        <Label htmlFor="social-impact">Social Impact</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other-sector" id="other-sector" />
                        <Label htmlFor="other-sector">Other</Label>
                      </div>
                    </RadioGroup>
                    <Input className="mt-2" name="otherSector" placeholder="If other, please specify" />
                  </div>

                  <div>
                    <Label htmlFor="ideaDescription">Brief Description of Your Startup Idea (Max 200 words) *</Label>
                    <Textarea
                      id="ideaDescription"
                      name="ideaDescription"
                      placeholder="Describe your startup idea in detail..."
                      className="min-h-[120px]"
                      maxLength={1000}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">Maximum 200 words</div>
                  </div>

                  <div>
                    <Label htmlFor="problemSolving">Problem You Are Solving *</Label>
                    <Textarea
                      id="problemSolving"
                      name="problemSolving"
                      placeholder="What problem does your startup solve?"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetCustomers">Who Are Your Target Customers/Users? *</Label>
                    <Textarea
                      id="targetCustomers"
                      name="targetCustomers"
                      placeholder="Describe your target customers/users..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Stage of Your Idea *</Label>
                    <RadioGroup name="ideaStage" defaultValue="" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="just-idea" id="just-idea" />
                        <Label htmlFor="just-idea">Just an idea</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="validated" id="validated" />
                        <Label htmlFor="validated">Validated concept</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prototype" id="prototype" />
                        <Label htmlFor="prototype">Prototype/MVP built</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="operations" id="operations" />
                        <Label htmlFor="operations">Started operations</Label>
                      </div>
                    </RadioGroup>
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
                    <Label htmlFor="teamMembers">Number of Team Members *</Label>
                    <Select name="numTeamMembers">
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of team members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Solo founder)</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5+">5+</SelectItem>
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

              {/* Program Commitment */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Program Commitment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>
                      Are you willing to attend both online & in-person sessions during the 4-month period? *
                    </Label>
                    <RadioGroup name="willingToAttend" defaultValue="" className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes-attend" />
                        <Label htmlFor="yes-attend">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no-attend" />
                        <Label htmlFor="no-attend">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Are you committed to working on your startup idea throughout the program duration? *</Label>
                    <RadioGroup name="committedToWork" defaultValue="" className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes-committed" />
                        <Label htmlFor="yes-committed">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no-committed" />
                        <Label htmlFor="no-committed">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border-[#6CBD45] border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#6CBD45]">Additional Information (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="pitchDeckUrl">Attach pitch deck (if available)</Label>
                    <Input id="pitchDeckUrl" name="pitchDeckUrl" placeholder="Enter pitch deck URL" />
                  </div>

                  <div>
                    <Label htmlFor="socialMedia">Social Media/Website (if any)</Label>
                    <Input id="socialMedia" name="socialMedia" placeholder="Enter website URL or social media links" />
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
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white px-12 py-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
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