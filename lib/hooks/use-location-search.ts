/**
 * Feature: Location Search Hook
 * Purpose: Direct location search without journey system
 */

import { useState, useCallback } from 'react'

export interface LocationResult {
  id: string
  name: string
  type: string
  country_code?: string
  region?: string
  supports_city?: boolean
  supports_region?: boolean
}

export function useLocationSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LocationResult[]>([])

  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([])
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/meta/search-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ q: query })
      })

      if (!response.ok) {
        throw new Error('Failed to search locations')
      }

      const data = await response.json()
      const locationResults = data.data || []
      setResults(locationResults)
      return locationResults
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search locations'
      setError(errorMessage)
      setResults([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    searchLocations,
    clearResults,
    loading,
    error,
    results
  }
}

