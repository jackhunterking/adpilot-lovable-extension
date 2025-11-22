import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * GET /api/v1/conversions
 * 
 * ⚠️ BACKEND OPERATION: Fetches conversions for a Lovable project
 * 
 * Query params:
 * - lovableProjectId: The Lovable project ID to fetch conversions for
 * - limit: Optional limit (default: 50)
 * - offset: Optional offset for pagination (default: 0)
 * - conversionType: Optional filter by conversion type
 * 
 * Returns array of conversions with basic info: type, count, timestamp
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const lovableProjectId = searchParams.get("lovableProjectId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const conversionType = searchParams.get("conversionType")

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

    // For demo or unauthenticated users, return empty data
    if (!session || lovableProjectId === "demo-project") {
      return NextResponse.json({
        conversions: [],
        summary: {},
        total: 0,
        limit,
        offset,
      })
    }

    // ⚠️ BACKEND OPERATION: First, get all campaigns for this Lovable project
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("user_id", session.user.id)

    if (campaignsError) {
      console.error("[Conversions API] Error fetching campaigns:", campaignsError)
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      )
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        conversions: [],
        total: 0,
        limit,
        offset,
      })
    }

    const campaignIds = campaigns.map((c) => c.id)

    // Build query for conversions
    let query = supabase
      .from("campaign_conversions")
      .select("id, conversion_type, timestamp, created_at", { count: "exact" })
      .in("campaign_id", campaignIds)
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply conversion type filter if provided
    if (conversionType) {
      query = query.eq("conversion_type", conversionType)
    }

    const { data: conversions, error: conversionsError, count } = await query

    if (conversionsError) {
      console.error("[Conversions API] Error fetching conversions:", conversionsError)
      return NextResponse.json(
        { error: "Failed to fetch conversions" },
        { status: 500 }
      )
    }

    // Group conversions by type for summary
    const conversionsByType: Record<string, number> = {}
    if (conversions) {
      conversions.forEach((conv) => {
        conversionsByType[conv.conversion_type] =
          (conversionsByType[conv.conversion_type] || 0) + 1
      })
    }

    return NextResponse.json({
      conversions: conversions || [],
      summary: conversionsByType,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("[Conversions API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

