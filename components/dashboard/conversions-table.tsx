"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Conversion {
  id: string
  conversion_type: string
  timestamp: string
  created_at: string
}

interface ConversionsTableProps {
  lovableProjectId: string
  campaignId?: string
  compact?: boolean
}

export function ConversionsTable({ lovableProjectId, campaignId, compact = false }: ConversionsTableProps) {
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchConversions()
  }, [lovableProjectId, campaignId, filter])

  const fetchConversions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        lovableProjectId,
        limit: "50",
        offset: "0",
      })

      if (filter !== "all") {
        params.append("conversionType", filter)
      }

      // ⚠️ BACKEND OPERATION: Fetching conversions
      const response = await fetch(`/api/v1/conversions?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch conversions")
      }

      const data = await response.json()
      setConversions(data.conversions || [])
      setSummary(data.summary || {})
      setTotal(data.total || 0)
    } catch (err) {
      console.error("Error fetching conversions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch conversions")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getConversionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      signup: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      purchase: "bg-green-500/10 text-green-500 border-green-500/20",
      call: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      form_submit: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      custom: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }

    return colors[type] || colors.custom
  }

  const formatConversionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Empty state
  if (!loading && conversions.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-border rounded-lg">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No conversions found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Reload to check again or ensure your conversion tracking is set up
        </p>
        <Button onClick={fetchConversions} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reload
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {!compact && Object.keys(summary).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(summary).map(([type, count]) => (
            <div
              key={type}
              className="border border-border rounded-lg p-4 bg-card"
            >
              <div className="text-sm text-muted-foreground mb-1">
                {formatConversionType(type)}
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="signup">Signups</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="form_submit">Form Submits</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {total} total conversion{total !== 1 ? "s" : ""}
            </div>
          </div>
          <Button
            onClick={fetchConversions}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>
        </div>
      )}

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
              <TableHead>Conversion Type</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading conversions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : conversions.length > 0 ? (
              conversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getConversionTypeBadge(conversion.conversion_type)}
                    >
                      {formatConversionType(conversion.conversion_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(conversion.timestamp)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  No conversions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

