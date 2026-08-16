// components/EventRegistrationModal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FormField {
  id: number
  field_name: string
  field_label: string
  field_type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file'
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
}

interface EventRegistrationModalProps {
  event: Event
  onClose: () => void
  onSuccess: () => void
}

export default function EventRegistrationModal({ event, onClose, onSuccess }: EventRegistrationModalProps) {
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFormFields()
  }, [event.id])

  const fetchFormFields = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}/form-fields`)
      if (response.ok) {
        const fields = await response.json()
        setFormFields(fields.sort((a: FormField, b: FormField) => a.order_index - b.order_index))
      }
    } catch (error) {
      console.error('Error fetching form fields:', error)
      toast({
        title: "Error",
        description: "Failed to load registration form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }))
    } else {
      setFiles(prev => {
        const newFiles = { ...prev }
        delete newFiles[fieldName]
        return newFiles
      })
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    formFields.forEach(field => {
      const value = formData[field.field_name]
      
      if (field.required && (!value || value === '')) {
        errors.push(`${field.field_label} is required`)
      }

      if (field.field_type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field.field_label} must be a valid email address`)
      }

      if (field.field_type === 'phone' && value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
        errors.push(`${field.field_label} must be a valid phone number`)
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join('\n'),
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Upload files first if any
      const uploadedFiles: Record<string, string> = {}
      
      for (const [fieldName, file] of Object.entries(files)) {
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadResponse = await fetch('/api/admin/events/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          uploadedFiles[fieldName] = uploadResult.url
        }
      }

      // Combine form data with uploaded file URLs
      const registrationData = {
        ...formData,
        ...uploadedFiles
      }

      const response = await fetch(`/api/admin/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration_data: registrationData }),
      })

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "You have been successfully registered for the event. Check your email for confirmation.",
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to register for the event. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting registration:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.field_name] || ''

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              required={field.required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              required={field.required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleInputChange(field.field_name, val)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.field_label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.field_options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleInputChange(field.field_name, val)}
              required={field.required}
            >
              {field.field_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.field_name}-${index}`} />
                  <Label htmlFor={`${field.field_name}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.field_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.field_name}-${index}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || []
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      handleInputChange(field.field_name, newValues)
                    }}
                  />
                  <Label htmlFor={`${field.field_name}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'file':
        const selectedFile = files[field.field_name]
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileChange(field.field_name, null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Label
                    htmlFor={field.field_name}
                    className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                  >
                    Click to upload or drag and drop
                  </Label>
                  <input
                    id={field.field_name}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange(field.field_name, file)
                    }}
                    required={field.required}
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Register for {event.title}
          </DialogTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📅 {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} at {event.time}</p>
            <p>📍 {event.location}</p>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#6CBD45]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields.map(renderFormField)}

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#6CBD45] hover:bg-[#5ba83a] text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Now'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}