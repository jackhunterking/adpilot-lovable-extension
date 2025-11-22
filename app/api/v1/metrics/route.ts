import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * GET /api/v1/metrics
 * 
 * ⚠️ BACKEND OPERATION: Aggregates metrics from all ads in a Lovable project
 * 
 * Query params:
 * - lovableProjectId: The Lovable project ID to fetch metrics for
 * 
 * Returns aggregated metrics: impressions, clicks, conversions, spend
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const lovableProjectId = searchParams.get("lovableProjectId")

    if (!lovableProjectId) {
      return NextResponse.json(
        { error: "lovableProjectId is required" },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // For demo or unauthenticated users, return zeros
    if (!session || lovableProjectId === "demo-project") {
      return NextResponse.json({
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
        adsCount: 0,
      })
    }

    // ⚠️ BACKEND OPERATION: Fetch all ads for this Lovable project
    const { data: ads, error: adsError } = await supabase
      .from("ads")
      .select("metrics_snapshot, impressions, clicks, conversions")
      .eq("lovable_project_id", lovableProjectId)

    if (adsError) {
      console.error("[Metrics API] Error fetching ads:", adsError)
      return NextResponse.json(
        { error: "Failed to fetch ads" },
        { status: 500 }
      )
    }

    // Aggregate metrics from all ads
    let totalImpressions = 0
    let totalClicks = 0
    let totalConversions = 0
    let totalSpend = 0

    if (ads && ads.length > 0) {
      ads.forEach((ad) => {
        // Try to get from metrics_snapshot first, fallback to direct columns
        if (ad.metrics_snapshot) {
          totalImpressions += ad.metrics_snapshot.impressions || 0
          totalClicks += ad.metrics_snapshot.clicks || 0
          totalConversions += ad.metrics_snapshot.conversions || 0
          totalSpend += ad.metrics_snapshot.spend || 0
        } else {
          // Fallback to direct columns if available
          totalImpressions += ad.impressions || 0
          totalClicks += ad.clicks || 0
          totalConversions += ad.conversions || 0
        }
      })
    }

    return NextResponse.json({
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend,
      adsCount: ads?.length || 0,
    })
  } catch (error) {
    console.error("[Metrics API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

