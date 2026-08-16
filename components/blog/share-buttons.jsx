"use client"

import { Button } from "@/components/ui/button"
import { Twitter, Facebook, Linkedin, Share2, Check } from "lucide-react"
import { useState } from "react"

export default function ShareButtons({ title, slug }) {
  const [copied, setCopied] = useState(false)

  const getShareUrl = (platform) => {
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/${slug}` : ''
    const text = encodeURIComponent(title)
    const link = encodeURIComponent(currentUrl)

    switch (platform) {
      case 'twitter': return `https://twitter.com/intent/tweet?text=${text}&url=${link}`
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${link}`
      case 'linkedin': return `https://www.linkedin.com/shareArticle?mini=true&url=${link}&title=${text}`
      default: return '#'
    }
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/blogs/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-3">
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full w-10 h-10 hover:text-[#6CBD45] hover:border-[#6CBD45]"
        onClick={() => window.open(getShareUrl('twitter'), '_blank', 'width=600,height=400')}
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full w-10 h-10 hover:text-[#6CBD45] hover:border-[#6CBD45]"
        onClick={() => window.open(getShareUrl('facebook'), '_blank', 'width=600,height=400')}
      >
        <Facebook className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full w-10 h-10 hover:text-[#6CBD45] hover:border-[#6CBD45]"
        onClick={() => window.open(getShareUrl('linkedin'), '_blank', 'width=600,height=400')}
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full w-10 h-10 hover:text-[#6CBD45] hover:border-[#6CBD45]"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </Button>
    </div>
  )
}