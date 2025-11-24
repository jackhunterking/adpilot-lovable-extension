/**
 * Hook: useConnectionRequirements
 * Purpose: Check if user has required connections for specific actions
 * Usage: Validate before creating ads or posts
 */

"use client"

import { usePlatformConnections } from './use-platform-connections'

export type ActionType = 'ad' | 'post_facebook' | 'post_instagram'
export type ConnectionType = 'business' | 'facebook_page' | 'instagram'

export interface ConnectionRequirements {
  canCreateAd: () => boolean
  canCreatePost: (platform: 'facebook' | 'instagram') => boolean
  getMissingConnections: (action: ActionType) => ConnectionType[]
  hasAllConnections: () => boolean
}

/**
 * Hook to check connection requirements for different actions
 */
export function useConnectionRequirements(): ConnectionRequirements {
  const { businessConnected, facebookConnected, instagramConnected, loading } = usePlatformConnections()

  /**
   * Check if user can create ads
   * Requires: Business + Facebook Page + Instagram (all three)
   */
  const canCreateAd = () => {
    if (loading) return false
    return businessConnected && facebookConnected && instagramConnected
  }

  /**
   * Check if user can create posts for a specific platform
   * @param platform - 'facebook' or 'instagram'
   */
  const canCreatePost = (platform: 'facebook' | 'instagram') => {
    if (loading) return false
    
    if (platform === 'facebook') {
      return facebookConnected
    } else {
      return instagramConnected
    }
  }

  /**
   * Get list of missing connections for a specific action
   * @param action - 'ad', 'post_facebook', or 'post_instagram'
   * @returns Array of missing connection types
   */
  const getMissingConnections = (action: ActionType): ConnectionType[] => {
    const missing: ConnectionType[] = []

    if (action === 'ad') {
      // Ads require all three
      if (!businessConnected) missing.push('business')
      if (!facebookConnected) missing.push('facebook_page')
      if (!instagramConnected) missing.push('instagram')
    } else if (action === 'post_facebook') {
      // Facebook posts only require Facebook Page
      if (!facebookConnected) missing.push('facebook_page')
    } else if (action === 'post_instagram') {
      // Instagram posts only require Instagram
      if (!instagramConnected) missing.push('instagram')
    }

    return missing
  }

  /**
   * Check if all three connections are present
   */
  const hasAllConnections = () => {
    if (loading) return false
    return businessConnected && facebookConnected && instagramConnected
  }

  return {
    canCreateAd,
    canCreatePost,
    getMissingConnections,
    hasAllConnections,
  }
}

