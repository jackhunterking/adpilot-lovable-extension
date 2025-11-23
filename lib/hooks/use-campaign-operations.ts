/**
 * Feature: Campaign Operations Hook
 * Purpose: Campaign and ad management using service layer
 */

import { useState, useCallback } from 'react'
import { useCampaignService, useAdService } from '@/lib/services/service-provider'

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
  const campaignService = useCampaignService()
  const adService = useAdService()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCampaign = useCallback(async (name: string, goal?: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await campaignService.createCampaign.execute({
        name,
        goalType: (goal || 'leads') as 'leads' | 'calls' | 'website-visits',
      })

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create campaign')
      }

      return result.data as Campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [campaignService])

  const deleteCampaign = useCallback(async (campaignId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await campaignService.deleteCampaign.execute(campaignId)

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete campaign')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [campaignService])

  const listCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await campaignService.listCampaigns.execute({
        userId: '', // userId is handled by auth in service
      })

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to list campaigns')
      }

      return (result.data || []) as Campaign[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list campaigns'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [campaignService])

  const createAd = useCallback(async (
    adName: string,
    options: { campaignId?: string; lovableProjectId?: string }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await adService.createAd.execute({
        name: adName,
        status: 'draft',
        campaignId: options.campaignId,
        lovableProjectId: options.lovableProjectId,
      })

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create ad')
      }

      return result.data as Ad
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ad'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [adService])

  const deleteAd = useCallback(async (adId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await adService.deleteAd.execute(adId)

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete ad')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ad'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [adService])

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

