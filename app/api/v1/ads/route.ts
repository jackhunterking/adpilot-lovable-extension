/**
 * Feature: Ads API (v1)
 * Purpose: List ads for campaign and create new ad drafts
 * References:
 *  - API v1 Middleware: app/api/v1/_middleware.ts
 *  - API v1 Docs: MASTER_API_DOCUMENTATION.mdc
 *  - Supabase: https://supabase.com/docs/reference/javascript/select
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireCampaignOwnership, errorResponse, successResponse, ValidationError } from '@/app/api/v1/_middleware'
import { createServerClient, supabaseServer } from "@/lib/supabase/server"
import { adDataService } from "@/lib/services/ad-data-service"
import { createCampaignManager } from "@/lib/services/lovable"

// GET /api/v1/ads?campaignId=xxx - List ads for campaign
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Get campaignId from query params
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    if (!campaignId) {
      throw new ValidationError('campaignId query parameter is required')
    }
    
    // Verify campaign ownership
    await requireCampaignOwnership(campaignId, user.id)

    // Fetch all ads with normalized data
    const completeAds = await adDataService.getCampaignAds(campaignId)

    // Build enriched response with snapshots from normalized tables
    const adsWithSnapshots = completeAds.map(adData => {
      const snapshot = adDataService.buildSnapshot(adData)
      
      return {
        id: adData.ad.id,
        campaign_id: adData.ad.campaign_id,
        name: adData.ad.name,
        status: adData.ad.status,
        meta_ad_id: adData.ad.meta_ad_id,
        metrics_snapshot: adData.ad.metrics_snapshot,
        created_at: adData.ad.created_at,
        updated_at: adData.ad.updated_at,
        setup_snapshot: snapshot
      }
    })

    return successResponse({ ads: adsWithSnapshots })
  } catch (error) {
    console.error('[GET /api/v1/ads] Error:', error)
    return errorResponse(error as Error)
  }
}

// POST /api/v1/ads - Create new ad
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const body: unknown = await request.json()
    
    if (typeof body !== 'object' || body === null) {
      throw new ValidationError('Invalid request body')
    }

    const {
      campaignId,
      name,
      status = "draft",
      meta_ad_id = null,
      lovableProjectId = null,
    } = body as {
      campaignId?: string
      name?: string
      status?: string
      meta_ad_id?: string | null
      lovableProjectId?: string | null
    }

    // Handle two scenarios:
    // 1. campaignId provided directly (traditional flow)
    // 2. lovableProjectId provided (Lovable extension flow - auto-create campaign)
    
    let finalCampaignId: string;
    let finalLovableProjectId: string | null = lovableProjectId;

    if (!campaignId && !lovableProjectId) {
      throw new ValidationError('Either campaignId or lovableProjectId is required')
    }
    
    if (!name) {
      throw new ValidationError('Ad name is required')
    }

    if (lovableProjectId && !campaignId) {
      // Lovable extension flow: auto-link project + auto-create campaign
      console.log('[POST /api/v1/ads] Lovable extension flow - project:', lovableProjectId)
      
      const supabase = await createServerClient()
      const campaignManager = createCampaignManager(supabase)
      
      try {
        // Step 1: Ensure project is linked (idempotent)
        console.log('[POST /api/v1/ads] Step 1: Linking project to user...')
        await campaignManager.linkProject(lovableProjectId, user.id)
        console.log('[POST /api/v1/ads] ✅ Project linked')
        
        // Step 2: Get or create campaign (now that project is linked)
        console.log('[POST /api/v1/ads] Step 2: Getting/creating campaign...')
        const campaignResult = await campaignManager.getOrCreateCampaign({
          userId: user.id,
          lovableProjectId: lovableProjectId,
          campaignName: undefined, // Let it auto-generate
        })
        
        finalCampaignId = campaignResult.campaign_id
        
        console.log('[POST /api/v1/ads] ✅ Campaign ready:', {
          campaignId: finalCampaignId,
          wasCreated: campaignResult.was_created,
          campaignName: campaignResult.campaign_name,
        })
      } catch (campaignError) {
        console.error('[POST /api/v1/ads] Failed to get/create campaign:', campaignError)
        throw new ValidationError(
          campaignError instanceof Error 
            ? campaignError.message 
            : 'Failed to get or create campaign for Lovable project'
        )
      }
    } else if (campaignId) {
      // Traditional flow: verify campaign ownership
      finalCampaignId = campaignId
      await requireCampaignOwnership(campaignId, user.id)
      
      // If lovableProjectId not provided but campaign has one, inherit it
      if (!finalLovableProjectId) {
        const { data: campaign } = await supabaseServer
          .from('campaigns')
          .select('lovable_project_id')
          .eq('id', campaignId)
          .single()
        
        if (campaign?.lovable_project_id) {
          finalLovableProjectId = campaign.lovable_project_id
        }
      }
    } else {
      // This shouldn't happen due to validation above, but TypeScript needs it
      throw new ValidationError('Invalid campaign configuration')
    }

    // Create new ad
    const { data: ad, error } = await supabaseServer
      .from("ads")
      .insert({
        campaign_id: finalCampaignId,
        name,
        status: status as 'draft' | 'active' | 'paused',
        meta_ad_id,
        metrics_snapshot: null,
        lovable_project_id: finalLovableProjectId,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/v1/ads] Error:', error)
      throw new Error('Failed to create ad')
    }

    console.log('[POST /api/v1/ads] ✅ Created ad:', ad.id, 'for campaign:', finalCampaignId)

    return successResponse({ ad, campaignId: finalCampaignId }, undefined, 201)
  } catch (error) {
    console.error('[POST /api/v1/ads] Error:', error)
    return errorResponse(error as Error)
  }
}
