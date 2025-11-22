/**
 * API Route: Import Image from Lovable
 * POST /api/v1/lovable/import-image
 * 
 * ⚠️ BACKEND OPERATION - Uses Supabase and LovableSyncService
 * 
 * Purpose:
 * - Download image from Lovable Storage
 * - Upload to AdPilot Supabase Storage
 * - Create ad_creative record
 * - Return AdPilot URL (source of truth)
 * 
 * Authentication: Required
 * Permissions: User must own the campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { LovableSyncService } from '@/lib/services/lovable/lovable-sync-service-impl'

interface ImportImageRequest {
  sourceUrl: string
  campaignId: string
  adId: string
  format?: 'square' | 'vertical'
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = user.id
    
    // Parse request body
    const body: ImportImageRequest = await request.json()
    const { sourceUrl, campaignId, adId, format } = body
    
    // Validate required fields
    if (!sourceUrl || !campaignId || !adId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceUrl, campaignId, adId' },
        { status: 400 }
      )
    }
    
    // Validate URL format
    try {
      new URL(sourceUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid source URL' },
        { status: 400 }
      )
    }
    
    console.log('[ImportImage] Request:', {
      userId,
      sourceUrl: sourceUrl.substring(0, 50) + '...',
      campaignId,
      adId,
      format
    })
    
    // Verify user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, user_id')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single()
    
    if (campaignError || !campaign) {
      console.error('[ImportImage] Campaign verification failed:', campaignError)
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 403 }
      )
    }
    
    // Use LovableSyncService to import image
    const lovableSync = new LovableSyncService(supabase)
    
    const result = await lovableSync.importImageFromLovable({
      sourceUrl,
      campaignId,
      adId,
      userId,
      metadata: {
        format,
        importedAt: new Date().toISOString(),
        importMethod: 'auto-sync'
      }
    })
    
    if (!result.success) {
      console.error('[ImportImage] Import failed:', result.error)
      return NextResponse.json(
        { 
          error: result.error?.message || 'Import failed',
          code: result.error?.code
        },
        { status: 500 }
      )
    }
    
    console.log('[ImportImage] Import successful:', result.data?.creative.id)
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('[ImportImage] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

