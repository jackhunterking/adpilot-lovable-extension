"use client"

/**
 * Feature: Location Targeting Context
 * Purpose: Share location targeting state between Ad Builder steps
 * References:
 *  - React Context: https://react.dev/reference/react/createContext
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface LocationTargeting {
  id: string
  name: string
  type: 'city' | 'region' | 'country'
  mode: 'include' | 'exclude'
  coverage: 'radius' | 'full'
  radius?: number // Only if coverage === 'radius'
  coordinates: [number, number] // [lng, lat]
  bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  key?: string // Meta location key
  country_code?: string
}

interface LocationTargetingContextType {
  locations: LocationTargeting[]
  addLocation: (location: LocationTargeting) => void
  removeLocation: (id: string) => void
  updateLocation: (id: string, updates: Partial<LocationTargeting>) => void
  clearLocations: () => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const LocationTargetingContext = createContext<LocationTargetingContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface LocationTargetingProviderProps {
  children: ReactNode
  initialLocations?: LocationTargeting[]
}

export function LocationTargetingProvider({ 
  children, 
  initialLocations = [] 
}: LocationTargetingProviderProps) {
  const [locations, setLocations] = useState<LocationTargeting[]>(initialLocations)

  const addLocation = useCallback((location: LocationTargeting) => {
    setLocations(prev => {
      // Check if location already exists
      const exists = prev.some(loc => loc.id === location.id)
      if (exists) {
        console.warn('[LocationTargeting] Location already exists:', location.id)
        return prev
      }
      return [...prev, location]
    })
  }, [])

  const removeLocation = useCallback((id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }, [])

  const updateLocation = useCallback((id: string, updates: Partial<LocationTargeting>) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === id 
          ? { ...loc, ...updates }
          : loc
      )
    )
  }, [])

  const clearLocations = useCallback(() => {
    setLocations([])
  }, [])

  const value: LocationTargetingContextType = {
    locations,
    addLocation,
    removeLocation,
    updateLocation,
    clearLocations,
  }

  return (
    <LocationTargetingContext.Provider value={value}>
      {children}
    </LocationTargetingContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useLocationTargeting(): LocationTargetingContextType {
  const context = useContext(LocationTargetingContext)
  
  if (context === undefined) {
    throw new Error('useLocationTargeting must be used within a LocationTargetingProvider')
  }
  
  return context
}

