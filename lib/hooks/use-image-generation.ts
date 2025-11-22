/**
 * Feature: Image Generation Hook
 * Purpose: Direct image generation without journey system
 */

import { useState, useCallback } from 'react'

export interface GeneratedImage {
  id: string
  url: string
  format: 'square' | 'vertical'
  prompt?: string
  createdAt: string
}

export function useImageGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  const generateImage = useCallback(async (
    prompt: string,
    format: 'square' | 'vertical' | 'dual' = 'dual',
    contextImages?: string[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/images/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          format,
          contextImages,
          count: format === 'dual' ? 2 : 1
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      const images = data.data?.images || []
      
      const formattedImages: GeneratedImage[] = images.map((img: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        url: img.url || img.imageUrl,
        format: img.format || (idx === 0 ? 'square' : 'vertical'),
        prompt,
        createdAt: new Date().toISOString()
      }))

      setGeneratedImages(prev => [...prev, ...formattedImages])
      return formattedImages
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearImages = useCallback(() => {
    setGeneratedImages([])
    setError(null)
  }, [])

  return {
    generateImage,
    clearImages,
    loading,
    error,
    generatedImages
  }
}

