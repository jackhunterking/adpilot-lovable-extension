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
        throw new Error("Failed to fetch metrics")
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error("Error fetching metrics:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch metrics")
      // Set default values on error
      setMetrics({
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
      })
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

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Additional Info */}
      {!loading && metrics && (
        <div className="text-sm text-muted-foreground">
          <p>
            Data aggregated from all ads in this project. Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

