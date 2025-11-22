/**
 * Feature: Meta Metrics Hook
 * Purpose: Direct metrics fetching without journey system
 */

import { useState, useCallback } from 'react'

export interface MetricData {
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface MetricsSummary {
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  data: MetricData[]
}

export function useMetaMetrics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async (
    campaignId: string,
    dateRange: { start: string; end: string }
  ): Promise<MetricsSummary | null> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        campaignId,
        startDate: dateRange.start,
        endDate: dateRange.end
      })

      const response = await fetch(`/api/v1/meta/metrics?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const data = await response.json()
      return data.data as MetricsSummary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBreakdown = useCallback(async (
    campaignId: string,
    breakdownType: 'age' | 'gender' | 'region' | 'device'
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/meta/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ campaignId, breakdownType })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch breakdown')
      }

      const data = await response.json()
      return data.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch breakdown'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    fetchMetrics,
    fetchBreakdown,
    loading,
    error
  }
}

