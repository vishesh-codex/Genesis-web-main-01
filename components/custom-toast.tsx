// components/custom-toast.tsx
"use client"

import { useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
  type?: 'success' | 'error'
}

export function Toast({ message, isVisible, onClose, duration = 4000, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const isError = type === 'error' || message.toLowerCase().includes('failed') || message.toLowerCase().includes('error')

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`bg-white border rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px] max-w-md ${
        isError ? 'border-red-200 text-red-900' : 'border-green-200 text-gray-900'
      }`}>
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}