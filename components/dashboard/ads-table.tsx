"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Edit, Pause, Play, RefreshCw, Megaphone } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Ad {
  id: string
  name: string
  status: "active" | "paused" | "draft"
  impressions?: number
  clicks?: number
  conversions?: number
  created_at: string
  metrics_snapshot?: {
    impressions?: number
    clicks?: number
    conversions?: number
  }
}

interface AdsTableProps {
  lovableProjectId: string
}

export function AdsTable({ lovableProjectId }: AdsTableProps) {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAds()
  }, [lovableProjectId])

  const fetchAds = async () => {
    try {
      setLoading(true)
      setError(null)

      // ⚠️ BACKEND OPERATION: Fetching ads from Supabase
      const { data, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("lovable_project_id", lovableProjectId)
        .order("created_at", { ascending: false })

      if (adsError) {
        throw adsError
      }

      setAds(data || [])
    } catch (err) {
      console.error("Error fetching ads:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch ads")
    } finally {
      setLoading(false)
    }
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

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return "0"
    return new Intl.NumberFormat("en-US").format(value)
  }

  const getMetricValue = (ad: Ad, metric: "impressions" | "clicks" | "conversions") => {
    // Try metrics_snapshot first, then direct column
    if (ad.metrics_snapshot && ad.metrics_snapshot[metric] !== undefined) {
      return ad.metrics_snapshot[metric]
    }
    return ad[metric]
  }

  const filteredAds = ads.filter((ad) =>
    ad.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Empty state
  if (!loading && ads.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-border rounded-lg">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Megaphone className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ads yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first ad to start driving traffic
        </p>
        <Button onClick={() => router.push("/ad/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Ad
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ad name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAds}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button onClick={() => router.push("/ad/create")} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Ad
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading ads...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAds.length > 0 ? (
              filteredAds.map((ad) => (
                <TableRow
                  key={ad.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/${ad.id}`)}
                >
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ad.status)}>
                      {ad.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(getMetricValue(ad, "impressions"))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(getMetricValue(ad, "clicks"))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(getMetricValue(ad, "conversions"))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/${ad.id}?view=results`)
                        }}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/${ad.id}?view=edit`)
                        }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement pause/resume functionality
                        }}
                        title={ad.status === "active" ? "Pause" : "Resume"}
                      >
                        {ad.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No ads found matching your search"
                    : "No ads found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Info */}
      {!loading && filteredAds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAds.length} of {ads.length} ad{ads.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}

