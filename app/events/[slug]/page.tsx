// app/events/[slug]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toast } from "@/components/custom-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import * as React from "react"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  X,
  History,
  QrCode,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { SuccessModal } from "@/components/ui/success-modal"

interface FormField {
  id: number
  field_name: string
  field_label: string
  field_type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | string
  field_options?: string[]
  required: boolean
  placeholder?: string
  validation_rules?: any
  order_index: number
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  max_attendees: number
  category: string
  image_url?: string
  featured: boolean
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  current_registrations?: number
  slug: string
}

export const FALLBACK_EVENT: Event = {
  id: 101,
  title: "Genesis Tech & Innovation Summit 2026",
  description: "Join us for an exclusive ecosystem summit featuring keynote speakers, startup pitches, investor panels, and strategic networking sessions.",
  date: "2026-09-15",
  time: "10:00 AM - 04:00 PM",
  location: "Genesis Incubation Center Auditorium",
  max_attendees: 150,
  category: "Summit",
  image_url: "/1381732341471.png",
  featured: true,
  status: "upcoming",
  current_registrations: 42,
  slug: "genesis-tech-summit-2026"
}

export const getFallbackEvent = (slug: string): Event => {
  const formattedTitle = slug
    ? String(slug || '')
        .split('-')
        ?.map((w) => String(w || '').charAt(0)?.toUpperCase() + String(w || '').slice(1))
        .join(' ')
    : FALLBACK_EVENT.title

  return {
    ...FALLBACK_EVENT,
    slug: slug || FALLBACK_EVENT.slug,
    title: formattedTitle
  }
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  {
    id: 1,
    field_name: 'qu_id',
    field_label: 'QU ID / Student ID',
    field_type: 'text',
    required: false,
    placeholder: 'e.g. QU20261001',
    order_index: 1
  },
  {
    id: 2,
    field_name: 'full_name',
    field_label: 'Full Name',
    field_type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    order_index: 2
  },
  {
    id: 3,
    field_name: 'email',
    field_label: 'Email Address',
    field_type: 'email',
    required: true,
    placeholder: 'name@example.com',
    order_index: 3
  },
  {
    id: 4,
    field_name: 'phone',
    field_label: 'Phone Number',
    field_type: 'phone',
    required: true,
    placeholder: '+91 98765 43210',
    order_index: 4
  },
  {
    id: 5,
    field_name: 'organization',
    field_label: 'Company / Institution',
    field_type: 'text',
    required: false,
    placeholder: 'Your startup, company, or university',
    order_index: 5
  }
]

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_FORM_FIELDS)
  const [formLoading, setFormLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [ticketRefId, setTicketRefId] = useState('')
  
  // Dual QR code state
  const [inQrCodeData, setInQrCodeData] = useState<string>('')
  const [outQrCodeData, setOutQrCodeData] = useState<string>('')
  const [attendeeInfo, setAttendeeInfo] = useState<{ qu_id?: string; name?: string; email?: string; phone?: string }>({})

  useEffect(() => {
    if (params && params.slug) {
      fetchEventBySlug(params.slug as string)
    } else {
      setEvent(FALLBACK_EVENT)
      fetchFormFields(FALLBACK_EVENT.id)
      setLoading(false)
    }
  }, [params])

  const fetchEventBySlug = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/slug/${encodeURIComponent(slug)}`)
      
      if (response.ok) {
        const foundEvent = await response.json()
        
        if (foundEvent && (foundEvent.id || foundEvent.title)) {
          setEvent(foundEvent)
          fetchFormFields(foundEvent.id || 101)
        } else {
          const fallback = getFallbackEvent(slug)
          setEvent(fallback)
          fetchFormFields(fallback.id)
        }
      } else {
        const fallback = getFallbackEvent(slug)
        setEvent(fallback)
        fetchFormFields(fallback.id)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      const fallback = getFallbackEvent(slug)
      setEvent(fallback)
      fetchFormFields(fallback.id)
    } finally {
      setLoading(false)
    }
  }

  const fetchFormFields = async (eventId: number | string) => {
    try {
      setFormLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/form-fields`)
      if (response.ok) {
        const fields = await response.json()
        if (Array.isArray(fields) && fields.length > 0) {
          setFormFields(fields.sort((a: FormField, b: FormField) => a.order_index - b.order_index))
        } else {
          setFormFields(DEFAULT_FORM_FIELDS)
        }
      } else {
        setFormFields(DEFAULT_FORM_FIELDS)
      }
    } catch (error) {
      console.error('Error fetching form fields:', error)
      setFormFields(DEFAULT_FORM_FIELDS)
    } finally {
      setFormLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }))
    } else {
      setFiles(prev => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    formFields.forEach(field => {
      const val = formData[field.field_name]
      const isRequired = field.required

      if (field.field_type === 'file') {
        if (isRequired && !files[field.field_name]) {
          errors.push(`${field.field_label} is required`)
        }
      } else if (field.field_type === 'checkbox') {
        if (isRequired && (!Array.isArray(val) || val.length === 0) && !val) {
          errors.push(`Please select at least one option for ${field.field_label}`)
        }
      } else {
        const strVal = typeof val === 'string' ? val.trim() : (val != null ? String(val).trim() : '')
        if (isRequired && !strVal) {
          errors.push(`${field.field_label} is required`)
        } else if (strVal) {
          // Format validation for email
          if (field.field_type === 'email' || field.field_name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(strVal)) {
              errors.push(`Please enter a valid email address for ${field.field_label}`)
            }
          }
          // Format validation for phone
          if (field.field_type === 'phone' || field.field_name === 'phone') {
            const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/
            if (!phoneRegex.test(strVal)) {
              errors.push(`Please enter a valid phone number for ${field.field_label}`)
            }
          }
          // Custom validation rules if specified
          if (field.validation_rules) {
            try {
              const rules = typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : field.validation_rules
              if (rules.minLength && strVal.length < rules.minLength) {
                errors.push(`${field.field_label} must be at least ${rules.minLength} characters`)
              }
              if (rules.maxLength && strVal.length > rules.maxLength) {
                errors.push(`${field.field_label} cannot exceed ${rules.maxLength} characters`)
              }
              if (rules.pattern) {
                const reg = new RegExp(rules.pattern)
                if (!reg.test(strVal)) {
                  errors.push(`${field.field_label} format is invalid`)
                }
              }
            } catch {
              // Ignore rule parse errors
            }
          }
        }
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setToastType('error')
      setSuccessMessage(`Validation Error: ${validationErrors.join(' | ')}`)
      setShowSuccessToast(true)
      return
    }

    setSubmitting(true)

    try {
      // Upload files first if any
      const uploadedFiles: Record<string, string> = {}
      
      for (const [fieldName, file] of Object.entries(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        
        const uploadResponse = await fetch('/api/admin/events/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          uploadedFiles[fieldName] = uploadResult.url || uploadResult.key || '/uploads/' + file.name
        }
      }

      // Combine form data with uploaded file URLs
      const registrationData = {
        ...formData,
        ...uploadedFiles
      }

      const eventId = event?.id || 101
      const response = await fetch(`/api/admin/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration_data: registrationData }),
      })

      if (response.ok) {
        const resData = await response.json().catch(() => ({}))
        const generatedTicket = resData.confirmation_token || resData.registration?.confirmation_token || `#EVT-2026-X${Math.floor(1000 + Math.random() * 9000)}`
        setTicketRefId(generatedTicket)
        
        const quIdVal = formData.qu_id || `QU2026${Math.floor(1000 + Math.random() * 9000)}`
        const nameVal = formData.full_name || "Attendee"
        const emailVal = formData.email || ""
        const phoneVal = formData.phone || ""

        // Dual QR Payloads for IN and OUT gates
        const inPayload = JSON.stringify({
          type: "IN_GATE",
          ticket: generatedTicket,
          qu_id: quIdVal,
          event: event?.title || "Genesis Event",
          eventId: eventId,
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          gate: "ENTRY_GATE_MAIN",
          created_at: new Date().toISOString()
        })

        const outPayload = JSON.stringify({
          type: "OUT_GATE",
          ticket: generatedTicket,
          qu_id: quIdVal,
          event: event?.title || "Genesis Event",
          eventId: eventId,
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          gate: "EXIT_GATE_MAIN",
          created_at: new Date().toISOString()
        })

        setInQrCodeData(inPayload)
        setOutQrCodeData(outPayload)
        setAttendeeInfo({
          qu_id: quIdVal,
          name: nameVal,
          email: emailVal,
          phone: phoneVal
        })

        setShowSuccessModal(true)
        
        setFormData({})
        setFiles({})
        
        setEvent(prev => prev ? {
          ...prev,
          current_registrations: (prev.current_registrations || 0) + 1
        } : null)

        if (params && params.slug) {
          fetchEventBySlug(params.slug as string)
        }
      } else {
        const error = await response.json().catch(() => ({}))
        setToastType('error')
        setSuccessMessage(`Registration Failed: ${error.message || "Failed to register for the event. Please try again."}`)
        setShowSuccessToast(true)
      }
    } catch (error) {
      console.error('Error submitting registration:', error)
      setToastType('error')
      setSuccessMessage("An unexpected error occurred. Please try again.")
      setShowSuccessToast(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: url,
        })
      } catch {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      ongoing: { label: 'Live Now', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
      completed: { label: 'Completed', className: 'bg-slate-200 dark:bg-[#141824] text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }
    }

    return badges[status as keyof typeof badges] || badges.upcoming
  }

  const isEventFull = () => {
    if (!event) return false
    return (event.current_registrations || 0) >= event.max_attendees
  }

  const canRegister = () => {
    if (!event) return false
    return event.status === 'upcoming' && !isEventFull()
  }

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "September 15, 2026"
    try {
      const parsed = new Date(dateString)
      if (isNaN(parsed.getTime())) return dateString
      return parsed.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.field_name] ?? ''

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type === 'phone' ? 'tel' : field.field_type}
              placeholder={field.placeholder || `Enter ${String(field?.field_label || '')?.toLowerCase()}`}
              value={value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-[#6CBD45]"
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              placeholder={field.placeholder || `Enter ${String(field?.field_label || '')?.toLowerCase()}`}
              value={value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-[#6CBD45] min-h-[100px]"
            />
          </div>
        )

      case 'select':
        const options = field.field_options || []
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleInputChange(field.field_name, val)}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                <SelectValue placeholder={field.placeholder || `Select ${field.field_label}`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#141824] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                {options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'radio':
        const radioOptions = field.field_options || []
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleInputChange(field.field_name, val)}
              className="flex flex-wrap gap-4 pt-1"
            >
              {radioOptions?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.field_name}-${index}`} />
                  <Label htmlFor={`${field.field_name}-${index}`} className="text-slate-700 dark:text-slate-300 font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'checkbox':
        const checkboxOptions = field.field_options || []
        const selectedValues: string[] = Array.isArray(value) ? value : []
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {checkboxOptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {checkboxOptions?.map((option, index) => {
                  const isChecked = selectedValues.includes(option)
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.field_name}-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...selectedValues, option]
                            : selectedValues?.filter((v) => v !== option)
                          handleInputChange(field.field_name, updated)
                        }}
                      />
                      <Label htmlFor={`${field.field_name}-${index}`} className="text-slate-700 dark:text-slate-300 font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id={field.field_name}
                  checked={!!value}
                  onCheckedChange={(checked) => handleInputChange(field.field_name, !!checked)}
                />
                <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-normal cursor-pointer">
                  {field.placeholder || `I agree / confirm`}
                </Label>
              </div>
            )}
          </div>
        )

      case 'file':
        const selectedFile = files[field.field_name]
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-[#0b0c10] hover:border-[#6CBD45] transition-colors">
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-[#6CBD45]" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileChange(field.field_name, null)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <Label
                    htmlFor={field.field_name}
                    className="cursor-pointer text-sm text-slate-600 dark:text-slate-400 hover:text-[#6CBD45] font-medium"
                  >
                    {field.placeholder || 'Click to upload document/image'}
                  </Label>
                  <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                  <input
                    id={field.field_name}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange(field.field_name, file)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name} className="text-slate-700 dark:text-slate-300 font-medium">
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type="text"
              placeholder={field.placeholder || `Enter ${String(field?.field_label || '')?.toLowerCase()}`}
              value={value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="bg-slate-50 dark:bg-[#0b0c10] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#6CBD45]" />
      </div>
    )
  }

  const currentEvent = event || FALLBACK_EVENT
  const statusBadge = getStatusBadge(currentEvent.status)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#6CBD45] selection:text-white transition-colors duration-300">
      <Header />

      {/* Toast Notification */}
      <Toast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        type={toastType}
      />

      {/* Navigation Top Bar */}
      <div className="container mx-auto px-4 lg:px-6 pt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/events')}
          className="text-slate-700 dark:text-slate-300 hover:text-[#6CBD45]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push('/events/history')}
          className="border-[#6CBD45]/40 text-[#6CBD45] hover:bg-[#6CBD45]/10 text-xs font-semibold rounded-full flex items-center gap-1.5"
        >
          <History className="w-3.5 h-3.5 text-[#6CBD45]" />
          <span>Attendance & Dual QR Portal</span>
        </Button>
      </div>

      {/* Event Details */}
      <section className="py-8 bg-slate-50 dark:bg-[#0f1117] transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141824] text-slate-900 dark:text-white shadow-xl rounded-3xl border-t-4 border-t-[#6CBD45]">
              {/* Event Image */}
              {currentEvent.image_url && (
                <div className="relative h-64 md:h-96 bg-black flex items-center justify-center">
                  <Image
                    src={currentEvent.image_url}
                    alt={currentEvent.title}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className="bg-[#6CBD45] text-white">{currentEvent.category}</Badge>
                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    {currentEvent.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                {/* Event Header */}
                <div className="mb-8">
                  {!currentEvent.image_url && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className="bg-[#6CBD45] text-white">{currentEvent.category}</Badge>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      {currentEvent.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                  )}

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    {currentEvent.title}
                  </h1>

                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentEvent.description}
                  </p>
                </div>

                {/* Event Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-400">
                      <Calendar className="w-5 h-5 text-[#6CBD45]" />
                      <span className="font-medium">
                        {formatEventDate(currentEvent.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-400">
                      <Clock className="w-5 h-5 text-[#6CBD45]" />
                      <span className="font-medium">{currentEvent.time}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-400">
                      <MapPin className="w-5 h-5 text-[#6CBD45]" />
                      <span className="font-medium">{currentEvent.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-400">
                      <Users className="w-5 h-5 text-[#6CBD45]" />
                      <span className="font-medium">
                        {currentEvent.current_registrations || 0} registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Only show if can't register */}
                {!canRegister() && (
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
                    {isEventFull() && currentEvent.status === 'upcoming' && (
                      <Button
                        disabled
                        className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white px-8 py-3"
                        size="lg"
                      >
                        Event Full
                      </Button>
                    )}

                    {currentEvent.status === 'completed' && (
                      <Button
                        disabled
                        className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white px-8 py-3"
                        size="lg"
                      >
                        Event Completed
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="border-[#6CBD45] text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white px-8 py-3"
                      size="lg"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Share Event'}
                    </Button>
                  </div>
                )}

                {/* Registration Form */}
                {canRegister() && (
                  <>
                    <hr className="my-8 border-slate-200 dark:border-slate-800/80" />
                    <div id="registration-form">
                      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            Register for {currentEvent.title}
                          </h2>
                          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                            <p>📅 {formatEventDate(currentEvent.date)} at {currentEvent.time}</p>
                            <p>📍 {currentEvent.location}</p>
                          </div>
                        </div>
                      </div>

                      {formLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#6CBD45]" />
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {formFields?.map(renderFormField)}

                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                            <Button
                              type="submit"
                              disabled={submitting}
                              size="lg"
                              className="group bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#4ca02c] text-white font-extrabold px-8 py-4 rounded-full [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_-5px_rgba(108,189,69,0.4)] border-none flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_15px_30px_-5px_rgba(108,189,69,0.6)] disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Submitting Application...
                                </>
                              ) : (
                                <>
                                  <span>Complete Registration</span>
                                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                              )}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleShare}
                              className="border-[#6CBD45] text-[#6CBD45] hover:bg-[#6CBD45] hover:text-white px-8 py-3 font-semibold"
                              size="lg"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              {copied ? 'Copied!' : 'Share Event'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Modal with Dual QR Codes */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Event Registration Confirmed!"
        subtitle={`Your Dual Gate Pass (IN QR & OUT QR) for "${currentEvent.title}" has been issued.`}
        referenceId={ticketRefId}
        type="event"
        inQrCode={inQrCodeData}
        outQrCode={outQrCodeData}
        attendeeInfo={attendeeInfo}
        details={[
          { label: "Event Name", value: currentEvent.title },
          { label: "QU ID", value: attendeeInfo.qu_id || "QU2026-PASS" },
          { label: "Date & Time", value: `${formatEventDate(currentEvent.date)} • ${currentEvent.time}` },
          { label: "Venue", value: currentEvent.location },
          { label: "Ticket Status", value: "Confirmed Pass (Dual QR Active)" },
        ]}
        actionText="View All Events"
        onAction={() => router.push("/events")}
      />
    </div>
  )
}