"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { User } from "lucide-react"

interface AuthorAvatarProps {
  authorName: string
  avatarUrl?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AuthorAvatar({
  authorName,
  avatarUrl,
  className = "",
  size = "md"
}: AuthorAvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Map author names to default public avatars if avatarUrl isn't provided
  const knownAvatars: Record<string, string> = {
    "Varun Tiwari": "/Mr_Varun_Tiwari.jpg",
    "Shobhit Goyal": "/Mr_Shobhit_Goyal.jpg",
    "Ajay Goyal": "/Mr_Ajay_Goyal.jpg",
    "Prof. Vivek Kumar": "/Prof_Vivek_Kumar.jpeg",
    "Raksha Thammaiah": "/raksha-thammaiah.jpg"
  }

  const effectiveSrc = avatarUrl || knownAvatars[authorName] || null

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  }[size]

  const getInitials = (name: string) => {
    if (!name) return "G"
    const parts = name.replace(/^(Mr\.|Ms\.|Prof\.|Dr\.)\s+/i, "").trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  if (effectiveSrc && !imgError) {
    return (
      <div className={`relative rounded-full overflow-hidden border border-slate-700/80 bg-slate-900 shrink-0 shadow-sm ${sizeClasses} ${className}`}>
        <img
          src={effectiveSrc}
          alt={authorName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className={`rounded-full bg-gradient-to-br from-[#6CBD45] to-emerald-700 text-white font-bold flex items-center justify-center shrink-0 border border-white/20 shadow-sm ${sizeClasses} ${className}`}>
      {getInitials(authorName)}
    </div>
  )
}

interface BlogImageProps {
  src: string | null
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}

export function SafeBlogImage({
  src,
  alt,
  fill = true,
  className = "",
  priority = false,
  sizes
}: BlogImageProps) {
  const [error, setError] = useState(false)
  const defaultFallback = "/1381732341471.png"

  const imageSrc = !src || error ? defaultFallback : src

  return (
    <Image
      src={imageSrc}
      alt={alt || "Genesis Blog Image"}
      fill={fill}
      priority={priority}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      className={className}
      onError={() => setError(true)}
    />
  )
}
