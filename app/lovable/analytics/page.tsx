/**
 * Feature: Lovable Analytics Page
 * Purpose: Performance metrics and analytics dashboard
 */

"use client"

import { useState, useEffect } from "react"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMetaMetrics, MetricsSummary } from "@/lib/hooks/use-meta-metrics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp, Users, MousePointer, DollarSign, Download } from "lucide-react"
import { subDays, format } from "date-fns"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const { fetchMetrics, loading } = useMetaMetrics()
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [dateRange, setDateRange] = useState("7")
  const [campaignId, setCampaignId] = useState<string | null>(null)

  // Get campaign ID from session storage
  useEffect(() => {
    const storedCampaignId = sessionStorage.getItem('lovable_campaign_id')
    if (storedCampaignId) {
      setCampaignId(storedCampaignId)
    }
  }, [])

  // Load metrics when campaign or date range changes
  useEffect(() => {
    if (campaignId) {
      loadMetrics()
    }
  }, [campaignId, dateRange])

  const loadMetrics = async () => {
    if (!campaignId) return

    const days = parseInt(dateRange)
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    const data = await fetchMetrics(campaignId, {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    })

    if (data) {
      setMetrics(data)
    }
  }

  const handleExport = () => {
    if (!metrics) return

    const csvContent = [
      'Date,Impressions,Clicks,Spend,Conversions,CTR,CPC,CPM',
      ...metrics.data.map(d =>
        `${d.date},${d.impressions},${d.clicks},${d.spend},${d.conversions},${d.ctr},${d.cpc},${d.cpm}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Analytics exported successfully!")
  }

  if (!campaignId) {
    return (
      <LovableLayout requireMeta>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Campaign Selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select a campaign from the Campaigns page to view analytics
              </p>
              <Button onClick={() => window.location.href = '/lovable/campaigns'}>
                Go to Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>
      </LovableLayout>
    )
  }

  return (
    <LovableLayout requireMeta>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your campaign performance and metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="14">Last 14 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={!metrics}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : metrics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Impressions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalImpressions?.toLocaleString() ?? '0'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    People reached
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Clicks
                  </CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalClicks?.toLocaleString() ?? '0'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics?.averageCtr?.toFixed(2) ?? '0.00'}% CTR
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Spend
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics?.totalSpend?.toFixed(2) ?? '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${metrics?.averageCpc?.toFixed(2) ?? '0.00'} CPC
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversions
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalConversions?.toLocaleString() ?? '0'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics?.totalClicks && metrics.totalConversions 
                      ? ((metrics.totalConversions / metrics.totalClicks) * 100).toFixed(2) 
                      : '0.00'}% conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  Daily breakdown of key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-right py-3 px-4">Impressions</th>
                        <th className="text-right py-3 px-4">Clicks</th>
                        <th className="text-right py-3 px-4">CTR</th>
                        <th className="text-right py-3 px-4">Spend</th>
                        <th className="text-right py-3 px-4">CPC</th>
                        <th className="text-right py-3 px-4">Conversions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.data.map((row) => (
                        <tr key={row.date} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{format(new Date(row.date), 'MMM d')}</td>
                          <td className="text-right py-3 px-4">{row.impressions.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">{row.clicks.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">{row.ctr.toFixed(2)}%</td>
                          <td className="text-right py-3 px-4">${row.spend.toFixed(2)}</td>
                          <td className="text-right py-3 px-4">${row.cpc.toFixed(2)}</td>
                          <td className="text-right py-3 px-4">{row.conversions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key observations about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics && metrics.averageCtr > 2 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Strong Click-Through Rate
                      </p>
                      <p className="text-green-700 dark:text-green-300 mt-1">
                        Your {metrics.averageCtr.toFixed(2)}% CTR is above average. Your ad creative is resonating well with your audience.
                      </p>
                    </div>
                  </div>
                )}

                {metrics && metrics.averageCpc < 1 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Cost-Effective Clicks
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 mt-1">
                        At ${metrics.averageCpc.toFixed(2)} per click, you're getting great value. Consider scaling your budget.
                      </p>
                    </div>
                  </div>
                )}

                {metrics && metrics.totalConversions === 0 && metrics.totalClicks > 50 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                    <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Conversion Tracking Needed
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                        You're getting clicks but no recorded conversions. Make sure your conversion tracking is set up correctly.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No analytics data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </LovableLayout>
  )
}

