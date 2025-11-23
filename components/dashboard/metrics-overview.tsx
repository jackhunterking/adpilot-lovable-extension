"use client"

import { useEffect, useState } from "react"
import { MetricCard } from "./metric-card"
import { Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react"

interface MetricsData {
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  totalSpend: number
}

interface MetricsOverviewProps {
  lovableProjectId: string
}

export function MetricsOverview({ lovableProjectId }: MetricsOverviewProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [lovableProjectId])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // ⚠️ BACKEND OPERATION: Fetching aggregated metrics
      const response = await fetch(
        `/api/v1/metrics?lovableProjectId=${lovableProjectId}`
      )

      if (!response.ok) {
        // Gracefully handle 404 or other errors
        console.warn("Metrics API not available, showing placeholder")
        setMetrics({
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalSpend: 0,
        })
        setError(null) // Don't show error, just show zeros
        return
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.warn("Error fetching metrics, showing placeholder:", err)
      // Set default values on error - don't show error message
      setMetrics({
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
      })
      setError(null) // Gracefully handle by showing zeros instead of error
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Impressions"
          value={metrics ? formatNumber(metrics.totalImpressions) : "0"}
          icon={<Eye className="w-4 h-4" />}
          loading={loading}
        />
        <MetricCard
          title="Total Clicks"
          value={metrics ? formatNumber(metrics.totalClicks) : "0"}
          icon={<MousePointer className="w-4 h-4" />}
          loading={loading}
        />
        <MetricCard
          title="Total Conversions"
          value={metrics ? formatNumber(metrics.totalConversions) : "0"}
          icon={<TrendingUp className="w-4 h-4" />}
          loading={loading}
        />
        <MetricCard
          title="Total Spend"
          value={metrics ? formatCurrency(metrics.totalSpend) : "$0.00"}
          icon={<DollarSign className="w-4 h-4" />}
          loading={loading}
        />
      </div>

      {/* Additional Info */}
      {!loading && metrics && (
        <div className="text-sm text-muted-foreground">
          <p>
            Campaign metrics will appear here once ads are published and generating data.
          </p>
        </div>
      )}
    </div>
  )
}

