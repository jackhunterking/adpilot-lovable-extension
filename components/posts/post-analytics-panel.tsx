"use client"

/**
 * Post Analytics Panel
 * Displays Facebook and Instagram insights for published posts
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ThumbsUp, MessageCircle, Share2, Eye, BarChart, Bookmark, Facebook, Instagram } from "lucide-react"
import { usePostService } from "@/lib/services/service-provider"
import type { PostAnalytics } from "@/lib/types/post"
import { toast } from "sonner"

interface PostAnalyticsPanelProps {
  postId: string
}

export function PostAnalyticsPanel({ postId }: PostAnalyticsPanelProps) {
  const postService = usePostService()
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const result = await postService.getPostAnalytics.execute({ postId })

      if (result.success) {
        setAnalytics(result.data)
      } else {
        console.error('Failed to load analytics:', result.error)
        toast.error(result.error?.message || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAnalytics()
    setIsRefreshing(false)
    toast.success('Analytics refreshed')
  }

  useEffect(() => {
    loadAnalytics()
  }, [postId])

  const facebookAnalytics = analytics.find(a => a.platform === 'facebook')
  const instagramAnalytics = analytics.find(a => a.platform === 'instagram')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Post Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Facebook Analytics */}
      {facebookAnalytics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <CardTitle>Facebook</CardTitle>
              </div>
              <Badge variant="outline">
                Last updated: {new Date(facebookAnalytics.synced_at).toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                icon={ThumbsUp}
                label="Likes"
                value={facebookAnalytics.likes}
                iconColor="text-blue-600"
              />
              <MetricCard
                icon={MessageCircle}
                label="Comments"
                value={facebookAnalytics.comments}
                iconColor="text-green-600"
              />
              <MetricCard
                icon={Share2}
                label="Shares"
                value={facebookAnalytics.shares}
                iconColor="text-purple-600"
              />
              <MetricCard
                icon={Eye}
                label="Reach"
                value={facebookAnalytics.reach}
                iconColor="text-orange-600"
              />
              <MetricCard
                icon={BarChart}
                label="Impressions"
                value={facebookAnalytics.impressions}
                iconColor="text-cyan-600"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instagram Analytics */}
      {instagramAnalytics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <CardTitle>Instagram</CardTitle>
              </div>
              <Badge variant="outline">
                Last updated: {new Date(instagramAnalytics.synced_at).toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                icon={ThumbsUp}
                label="Likes"
                value={instagramAnalytics.likes}
                iconColor="text-pink-600"
              />
              <MetricCard
                icon={MessageCircle}
                label="Comments"
                value={instagramAnalytics.comments}
                iconColor="text-green-600"
              />
              <MetricCard
                icon={Bookmark}
                label="Saves"
                value={instagramAnalytics.shares} // Using shares field for saves
                iconColor="text-purple-600"
              />
              <MetricCard
                icon={Eye}
                label="Reach"
                value={instagramAnalytics.reach}
                iconColor="text-orange-600"
              />
              <MetricCard
                icon={BarChart}
                label="Impressions"
                value={instagramAnalytics.impressions}
                iconColor="text-cyan-600"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Analytics Message */}
      {!facebookAnalytics && !instagramAnalytics && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Analytics will be available after the post is published
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper component for metric cards
function MetricCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType
  label: string
  value: number
  iconColor?: string
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}

