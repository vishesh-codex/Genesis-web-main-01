// app/events/[slug]/check-in/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as React from "react"
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  AlertCircle,
  Timer
} from "lucide-react"

interface FormField {
  field_name: string
  field_label: string
  field_type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file'
  required: boolean
}

interface CheckInStatus {
  canCheckIn: boolean
  eventDate: string
  isEventDate: boolean
  error?: string
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  checkInFields: FormField[]
  checkInStatus: CheckInStatus
}

interface RegistrationData {
  [key: string]: any
}

export default function EventCheckIn() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [identifiers, setIdentifiers] = useState<Record<string, string>>({})
  const [confirmationToken, setConfirmationToken] = useState("")
  const [useToken, setUseToken] = useState(false)
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean
    message: string
    alreadyConfirmed?: boolean
    registration?: RegistrationData
  } | null>(null)

  // Fetch event details
  useEffect(() => {
    if (!slug) return

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${slug}/check-in`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data)

          // If no check-in fields, default to using token
          if (!data.checkInFields || data.checkInFields.length < 2) {
            setUseToken(true)
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  // Check for confirmation token in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      if (token) {
        setConfirmationToken(token)
        setUseToken(true)
      }
    }
  }, [])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useToken && !confirmationToken) {
      setCheckInResult({
        success: false,
        message: 'Please enter your confirmation token'
      })
      return
    }

    if (!useToken && event?.checkInFields) {
      const missingFields = event.checkInFields.filter(field => !identifiers[field.field_name])
      if (missingFields.length > 0) {
        setCheckInResult({
          success: false,
          message: `Please fill in: ${missingFields.map(f => f.field_label).join(' and ')}`
        })
        return
      }
    }

    setCheckingIn(true)
    setCheckInResult(null)

    try {
      const body = useToken
        ? { confirmationToken }
        : { identifiers }

      const response = await fetch(`/api/events/${slug}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setCheckInResult({
          success: true,
          message: data.message,
          alreadyConfirmed: data.alreadyConfirmed,
          registration: data.registration
        })
      } else {
        setCheckInResult({
          success: false,
          message: data.error || 'Check-in failed'
        })
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'An error occurred during check-in'
      })
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#6CBD45]" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
              <p className="text-gray-600">
                The event you're trying to check in to could not be found.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="mt-4"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Event Header - Always Show */}
        <Card>
          <CardHeader className="bg-[#6CBD45] text-white">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-5 h-5 text-[#6CBD45]" />
                <span>{new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-5 h-5 text-[#6CBD45]" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-5 h-5 text-[#6CBD45]" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {/* Check-in Status */}
            {event.checkInStatus.canCheckIn ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Check-in is now available for today's event!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200">
                <Timer className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <p className="font-medium mb-2">Check-in is only available on the event date</p>
                  <div className="space-y-1 text-sm">
                    <p>Event Date: <strong>{new Date(event.checkInStatus.eventDate || event.date).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    })}</strong></p>
                    <p className="text-xs text-blue-600 mt-2">
                      Please return on the event date to check in
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Only show check-in form if window is open */}
        {event.checkInStatus.canCheckIn && (
          <>
            {/* Check-in Result */}
            {checkInResult && (
              <Alert className={checkInResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                <div className="flex items-start space-x-2">
                  {checkInResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className={checkInResult.success ? "text-green-800" : "text-red-800"}>
                      <p className="font-semibold mb-2">{checkInResult.message}</p>

                      {checkInResult.success && checkInResult.registration && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                          <p className="font-semibold mb-3 text-gray-900">Registration Details:</p>
                          <div className="space-y-2 text-sm">
                            {Object.entries(checkInResult.registration).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="font-medium text-gray-900">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {checkInResult.alreadyConfirmed && (
                        <Badge className="mt-3 bg-blue-100 text-blue-800">
                          Previously Checked In
                        </Badge>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Check-in Form */}
            {!checkInResult?.success && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-6 h-6 text-[#6CBD45]" />
                    <span>Event Check-In</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCheckIn} className="space-y-4">
                    {!useToken && event.checkInFields.length >= 2 ? (
                      <>
                        {event.checkInFields.map((field) => (
                          <div key={field.field_name} className="space-y-2">
                            <Label htmlFor={field.field_name}>
                              {field.field_label}
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              id={field.field_name}
                              type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                              placeholder={`Enter your ${field.field_label.toLowerCase()}`}
                              value={identifiers[field.field_name] || ''}
                              onChange={(e) => setIdentifiers(prev => ({
                                ...prev,
                                [field.field_name]: e.target.value
                              }))}
                              required
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">
                          Enter both details exactly as you registered
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="confirmation_token">
                          Confirmation Token
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="confirmation_token"
                          type="text"
                          placeholder="Enter your confirmation token"
                          value={confirmationToken}
                          onChange={(e) => setConfirmationToken(e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Use the token from your confirmation email or QR code
                        </p>
                      </div>
                    )}

                    {event.checkInFields.length >= 2 && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <button
                            type="button"
                            onClick={() => setUseToken(!useToken)}
                            className="px-2 bg-white text-[#6CBD45] hover:underline"
                          >
                            {useToken ? 'Use registration details instead' : 'Use confirmation token instead'}
                          </button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#6CBD45] hover:bg-[#5ba83a]"
                      disabled={checkingIn}
                    >
                      {checkingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking In...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Check In Now
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Success Actions */}
            {checkInResult?.success && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      You're All Set!
                    </h3>
                    <p className="text-gray-600">
                      Welcome to {event.title}. Enjoy the event!
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="mt-4"
                    >
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* If check-in not started, show helpful message */}
        {!event.checkInStatus.canCheckIn && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-gray-600">
                Please return during the check-in window to mark your attendance.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}