"use client"

/**
 * Feature: Fullscreen Mode Context
 * Purpose: Manage fullscreen state for Ad Builder (hide sidebar)
 * References:
 *  - Used by Ad Builder to request fullscreen mode
 *  - Consumed by main layout to conditionally hide sidebar
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface FullscreenModeContextType {
  isFullscreen: boolean
  enterFullscreen: () => void
  exitFullscreen: () => void
}

const FullscreenModeContext = createContext<FullscreenModeContextType | undefined>(undefined)

interface FullscreenModeProviderProps {
  children: ReactNode
}

export function FullscreenModeProvider({ children }: FullscreenModeProviderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true)
    console.log('[FullscreenMode] Entered fullscreen mode')
  }, [])

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false)
    console.log('[FullscreenMode] Exited fullscreen mode')
  }, [])

  const value: FullscreenModeContextType = {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
  }

  return (
    <FullscreenModeContext.Provider value={value}>
      {children}
    </FullscreenModeContext.Provider>
  )
}

export function useFullscreenMode(): FullscreenModeContextType {
  const context = useContext(FullscreenModeContext)
  
  if (context === undefined) {
    throw new Error('useFullscreenMode must be used within a FullscreenModeProvider')
  }
  
  return context
}

/**
 * Hook to automatically enter/exit fullscreen mode on mount/unmount
 * Use this in components that need fullscreen mode (e.g., Ad Builder)
 */
export function useAutoFullscreen() {
  const { enterFullscreen, exitFullscreen } = useFullscreenMode()

  useEffect(() => {
    enterFullscreen()
    
    return () => {
      exitFullscreen()
    }
  }, [enterFullscreen, exitFullscreen])
}

