"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Megaphone, Plus, Eye, Edit, Pause, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"

interface Ad {
  id: string
  name: string
  status: "active" | "paused" | "draft"
  thumbnail_url?: string
  impressions?: number
  clicks?: number
  conversions?: number
  created_at: string
}

interface DashboardAdsListProps {
  lovableProjectId?: string
}

export function DashboardAdsList({ lovableProjectId }: DashboardAdsListProps) {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lovableProjectId) {
      setLoading(false)
      return
    }

    fetchAds()
  }, [lovableProjectId])

  const fetchAds = async () => {
    try {
      setLoading(true)

      // ⚠️ BACKEND OPERATION: Fetching ads from Supabase
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("lovable_project_id", lovableProjectId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching ads:", error)
        return
      }

      setAds(data || [])
      
      // Auto-select first ad if none selected
      if (data && data.length > 0 && !selectedAd) {
        setSelectedAd(data[0])
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAd = () => {
    router.push("/ad/create")
  }

  const getStatusColor = (status: Ad["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "paused":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "draft":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Empty state
  if (!loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Create your first ad</h2>
            <p className="text-muted-foreground">
              Drive signups to your Lovable project with AI-powered Meta ads
            </p>
          </div>

          <Button onClick={handleCreateAd} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Ad
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading ads...</p>
        </div>
      </div>
    )
  }

  // Ads list view
  return (
    <div className="flex h-full bg-background">
      {/* Left: Ads List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Ads</h2>
            <Button onClick={handleCreateAd} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Ad
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {ads.length} {ads.length === 1 ? "ad" : "ads"} total
          </p>
        </div>

        {/* Ads List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {ads.map((ad) => (
            <Card
              key={ad.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAd?.id === ad.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedAd(ad)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {ad.thumbnail_url ? (
                      <img
                        src={ad.thumbnail_url}
                        alt={ad.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate mb-1">{ad.name}</h3>
                    <Badge variant="outline" className={getStatusColor(ad.status)}>
                      {ad.status}
                    </Badge>
                    
                    {/* Metrics */}
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span>{ad.impressions?.toLocaleString() || 0} views</span>
                      <span>{ad.clicks?.toLocaleString() || 0} clicks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Selected Ad Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedAd ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{selectedAd.name}</h1>
                  <Badge variant="outline" className={getStatusColor(selectedAd.status)}>
                    {selectedAd.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    {selectedAd.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ad Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAd.thumbnail_url ? (
                  <img
                    src={selectedAd.thumbnail_url}
                    alt={selectedAd.name}
                    className="w-full max-w-md rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-full max-w-md aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Megaphone className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {selectedAd.impressions?.toLocaleString() || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {selectedAd.clicks?.toLocaleString() || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {selectedAd.conversions?.toLocaleString() || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select an ad to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

