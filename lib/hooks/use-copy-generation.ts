/**
 * Feature: Copy Generation Hook
 * Purpose: Direct copy generation without journey system
 */

import { useState, useCallback } from 'react'

export interface GeneratedCopy {
  id: string
  headline: string
  body: string
  cta: string
  tone?: string
  createdAt: string
}

export function useCopyGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [variations, setVariations] = useState<GeneratedCopy[]>([])

  const generateCopy = useCallback(async (
    prompt: string,
    tone: string = 'professional',
    count: number = 3
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/creative/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          tone,
          variationsCount: count,
          includeHeadline: true,
          includeBody: true,
          includeCta: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate copy')
      }

      const data = await response.json()
      const copies = data.data?.variations || []
      
      const formattedCopies: GeneratedCopy[] = copies.map((copy: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        headline: copy.headline || copy.primaryText?.substring(0, 100) || '',
        body: copy.body || copy.primaryText || '',
        cta: copy.cta || copy.callToAction || 'Learn More',
        tone,
        createdAt: new Date().toISOString()
      }))

      setVariations(formattedCopies)
      return formattedCopies
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate copy'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearVariations = useCallback(() => {
    setVariations([])
    setError(null)
  }, [])

  return {
    generateCopy,
    clearVariations,
    loading,
    error,
    variations
  }
}

