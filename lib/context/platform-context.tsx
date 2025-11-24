"use client"

/**
 * Platform Context
 * Manages selected social media platform state across the app
 * Future-proof for multi-platform support (Meta, TikTok, LinkedIn, etc.)
 */

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type PlatformId = "meta" | "tiktok" | "linkedin" | "twitter"

interface PlatformContextValue {
  selectedPlatform: PlatformId
  setSelectedPlatform: (platform: PlatformId) => void
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined)

const STORAGE_KEY = "adpilot_selected_platform"

export function PlatformContextProvider({ children }: { children: ReactNode }) {
  const [selectedPlatform, setSelectedPlatformState] = useState<PlatformId>("meta")
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as PlatformId | null
      if (stored && ["meta", "tiktok", "linkedin", "twitter"].includes(stored)) {
        setSelectedPlatformState(stored)
      }
      setHydrated(true)
    }
  }, [])

  // Save to localStorage when changed
  const setSelectedPlatform = (platform: PlatformId) => {
    setSelectedPlatformState(platform)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, platform)
    }
  }

  // Prevent hydration mismatch by not rendering until client-side hydration complete
  if (!hydrated) {
    return null
  }

  return (
    <PlatformContext.Provider value={{ selectedPlatform, setSelectedPlatform }}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error("usePlatform must be used within PlatformContextProvider")
  }
  return context
}

