"use client"

/**
 * Platform Selector Component
 * Dropdown for selecting social media platform (Meta, TikTok, LinkedIn, etc.)
 * Placed in sidebar header, replacing AdPilot logo
 */

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/context/platform-context"
import Image from "next/image"

interface Platform {
  id: string
  name: string
  logo: string // SVG path or emoji
  available: boolean
  comingSoon?: boolean
  isImage?: boolean // Flag to indicate if logo is an image path
}

const PLATFORMS: Platform[] = [
  {
    id: "meta",
    name: "Meta",
    logo: "/meta-logo.svg",
    available: true,
    isImage: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    logo: "🎵",
    available: false,
    comingSoon: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logo: "💼",
    available: false,
    comingSoon: true,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    logo: "🐦",
    available: false,
    comingSoon: true,
  },
]

export function PlatformSelector() {
  const { selectedPlatform, setSelectedPlatform } = usePlatform()
  const [open, setOpen] = useState(false)

  const currentPlatform = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0]

  const handleSelect = (platformId: string) => {
    const platform = PLATFORMS.find((p) => p.id === platformId)
    if (platform?.available) {
      setSelectedPlatform(platformId)
      setOpen(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 w-full px-2 py-2 hover:bg-accent rounded-lg transition-colors">
          {/* Platform Logo */}
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            {currentPlatform.isImage ? (
              <Image 
                src={currentPlatform.logo} 
                alt={`${currentPlatform.name} logo`}
                width={24}
                height={24}
                className="text-primary"
              />
            ) : (
              <span className="text-2xl">{currentPlatform.logo}</span>
            )}
          </div>

          {/* Platform Name */}
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm">{currentPlatform.name}</div>
            <div className="text-xs text-muted-foreground">Platform</div>
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Select Platform
        </div>
        <DropdownMenuSeparator />

        {PLATFORMS.map((platform) => (
          <DropdownMenuItem
            key={platform.id}
            disabled={!platform.available}
            onSelect={() => handleSelect(platform.id)}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5",
              !platform.available && "opacity-60"
            )}
          >
            {/* Platform Logo */}
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
              {platform.isImage ? (
                <Image 
                  src={platform.logo} 
                  alt={`${platform.name} logo`}
                  width={20}
                  height={20}
                />
              ) : (
                <span className="text-xl">{platform.logo}</span>
              )}
            </div>

            {/* Platform Name & Status */}
            <div className="flex-1">
              <div className="font-medium text-sm">{platform.name}</div>
              {platform.comingSoon && (
                <div className="text-xs text-muted-foreground">Coming Soon</div>
              )}
            </div>

            {/* Selected Check */}
            {platform.id === selectedPlatform && platform.available && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

