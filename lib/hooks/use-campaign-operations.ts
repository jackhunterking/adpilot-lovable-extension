/**
 * Feature: Campaign Operations Hook
 * Purpose: Direct campaign management without journey system
 */

import { useState, useCallback } from 'react'

export interface Campaign {
  id: string
  name: string
  status: string
  user_id: string
  initial_goal?: string | null
  created_at: string
  updated_at: string
}

export interface Ad {
  id: string
  campaign_id: string
  name: string
  status: string
  headline?: string
  body?: string
  cta?: string
  image_url?: string
  created_at: string
}

export function useCampaignOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCampaign = useCallback(async (name: string, goal?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, initial_goal: goal || 'leads' })
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const data = await response.json()
      return data.data?.campaign as Campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCampaign = useCallback(async (campaignId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/campaigns/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const listCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/campaigns', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to list campaigns')
      }

      const data = await response.json()
      return (data.data?.campaigns || []) as Campaign[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list campaigns'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createAd = useCallback(async (campaignId: string, adName: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ campaign_id: campaignId, name: adName })
      })

      if (!response.ok) {
        throw new Error('Failed to create ad')
      }

      const data = await response.json()
      return data.data?.ad as Ad
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ad'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAd = useCallback(async (adId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/ads/${adId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete ad')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ad'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createCampaign,
    deleteCampaign,
    listCampaigns,
    createAd,
    deleteAd,
    loading,
    error
  }
}

