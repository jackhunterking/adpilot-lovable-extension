/**
 * API Route: /api/v1/meta/connections/status
 * Get connection status for all three connection types (business, page, instagram)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCampaignMetaConnections } from '@/lib/services/meta-connection-manager'

/**
 * GET /api/v1/meta/connections/status?campaignId=xxx
 * Returns status of all three connection types
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing campaignId parameter' },
        { status: 400 }
      )
    }

    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id,user_id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 404 }
      )
    }

    // Get all three connection types
    const connections = await getCampaignMetaConnections(campaignId)

    // Build response
    const response = {
      business: {
        connected: !!connections.business && connections.business.connection_status === 'connected',
        data: connections.business ? {
          businessId: connections.business.business?.id,
          businessName: connections.business.business?.name,
          adAccountId: connections.business.adAccount?.id,
          adAccountName: connections.business.adAccount?.name,
          paymentConnected: connections.business.payment_connected,
          connectedAt: connections.business.connected_at,
        } : null,
      },
      page: {
        connected: !!connections.page && connections.page.connection_status === 'connected',
        data: connections.page ? {
          pageId: connections.page.page?.id,
          pageName: connections.page.page?.name,
          connectedAt: connections.page.connected_at,
        } : null,
      },
      instagram: {
        connected: !!connections.instagram && connections.instagram.connection_status === 'connected',
        data: connections.instagram ? {
          instagramId: connections.instagram.instagram?.id,
          instagramUsername: connections.instagram.instagram?.username,
          connectedAt: connections.instagram.connected_at,
        } : null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] GET /api/v1/meta/connections/status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

