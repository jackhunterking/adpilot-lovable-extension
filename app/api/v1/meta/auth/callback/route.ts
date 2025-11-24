/**
 * Feature: Meta OAuth Callback (v1)
 * Purpose: Exchange OAuth code for tokens, fetch assets, and persist connection
 * References:
 *  - API v1 Middleware: app/api/v1/_middleware.ts
 *  - Facebook Login for Business: https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/
 *  - Meta Service: lib/meta/service.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, supabaseServer } from '@/lib/supabase/server'
import {
  exchangeCodeForTokens,
  fetchUserId,
  fetchBusinesses,
  fetchPagesWithTokens,
  fetchAdAccounts,
  chooseAssets,
  computeAdminSnapshot,
  persistConnection,
  updateCampaignState,
} from '@/lib/meta/service'
import { metaLogger } from '@/lib/meta/logger'

const CONTEXT = 'MetaOAuthCallback'

/**
 * OAuth Callback Handler
 * 
 * This endpoint is a special case that cannot use standard v1 middleware
 * because it needs to:
 * 1. Handle unauthenticated requests (OAuth flow may not have session yet)
 * 2. Read campaign ID from cookies (set during OAuth initiation)
 * 3. Perform complex token exchange with Meta
 * 4. Store tokens and connection data
 * 5. Redirect back to campaign page
 */
export async function GET(req: NextRequest) {
  metaLogger.info(CONTEXT, 'OAuth callback started')

  try {
    const { searchParams, origin } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const connectionType = searchParams.get('type') || 'business' // business, facebook_page, or instagram

    // Validate code exists
    if (!code) {
      const paramsLog: Record<string, string> = {}
      searchParams.forEach((v, k) => {
        paramsLog[k] = v
      })
      metaLogger.error(CONTEXT, 'Missing code parameter', 'No code in callback', {
        queryParams: paramsLog,
        state,
      })
      return NextResponse.redirect(`${origin}/?meta=missing_code`)
    }

    // Get campaign ID from type-specific cookie
    const cookieStore = await cookies()
    const cookieKey = `meta_cid_${connectionType}`
    const campaignId = cookieStore.get(cookieKey)?.value || 
                       cookieStore.get('meta_cid')?.value || // Fallback to old cookie for backward compatibility
                       null
    
    if (!campaignId) {
      metaLogger.error(CONTEXT, 'Missing campaign ID from cookie', `No ${cookieKey} cookie`)
      return NextResponse.redirect(`${origin}/?meta=missing_campaign`)
    }

    metaLogger.info(CONTEXT, 'Processing OAuth callback', {
      campaignId,
      connectionType,
      hasCode: true,
    })

    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      metaLogger.error(CONTEXT, 'No authenticated user in callback context', new Error('unauthorized'))
      return NextResponse.redirect(`${origin}/?meta=unauthorized`)
    }

    // Verify campaign ownership
    const { data: campaign } = await supabaseServer
      .from('campaigns')
      .select('id,user_id')
      .eq('id', campaignId)
      .maybeSingle()

    if (!campaign || campaign.user_id !== user.id) {
      metaLogger.error(CONTEXT, 'Campaign not found or unauthorized', new Error('forbidden'), {
        campaignId,
        userId: user.id,
      })
      return NextResponse.redirect(`${origin}/?meta=forbidden`)
    }

    const redirectUri = `${origin}/api/v1/meta/auth/callback?type=${connectionType}`

    // Step 1: Exchange code for tokens
    metaLogger.info(CONTEXT, 'Exchanging code for tokens')
    let longToken: string | null = null
    
    try {
      const tokens = await exchangeCodeForTokens({ code, redirectUri })
      longToken = tokens.longToken
      metaLogger.info(CONTEXT, 'Token exchange successful')
    } catch (err) {
      metaLogger.error(CONTEXT, 'Token exchange failed', err as Error)
      return NextResponse.redirect(`${origin}/${campaignId}?meta=token_exchange_failed`)
    }

    // Step 2: Store token in meta_tokens table
    const approxExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    const appId = process.env.NEXT_PUBLIC_FB_APP_ID || 'unknown'

    try {
      const upsertRes = await supabase
        .from('meta_tokens')
        .upsert({
          user_id: user.id,
          app_id: appId,
          token: longToken,
          token_type: 'user',
          expires_at: approxExpiresAt,
          scopes: [],
        }, { onConflict: 'user_id' })

      if (upsertRes.error) {
        metaLogger.error(CONTEXT, 'Failed to upsert meta_tokens', upsertRes.error)
        // Non-fatal - continue with OAuth flow
      } else {
        metaLogger.info(CONTEXT, 'Token persisted to meta_tokens table')
      }
    } catch (err) {
      metaLogger.error(CONTEXT, 'Error storing token', err as Error)
      // Non-fatal - continue
    }

    // Step 3: Fetch Facebook user ID
    metaLogger.info(CONTEXT, 'Fetching Facebook user ID')
    const fbUserId = await fetchUserId({ token: longToken })
    metaLogger.info(CONTEXT, 'Facebook user ID fetched', { fbUserId: fbUserId || 'null' })

    // Step 4-7: Fetch assets based on connection type
    let businesses: any[] = []
    let pages: any[] = []
    let adAccounts: any[] = []
    let assets: any

    if (connectionType === 'business') {
      // BUSINESS: Fetch all (businesses, pages, ad accounts)
      metaLogger.info(CONTEXT, 'Fetching businesses for business connection')
      businesses = await fetchBusinesses({ token: longToken })
      metaLogger.info(CONTEXT, 'Businesses fetched', { count: businesses.length })

      if (businesses.length === 0) {
        metaLogger.warn(CONTEXT, 'No businesses found for user')
        return NextResponse.redirect(`${origin}/${campaignId}?meta=no_businesses`)
      }

      metaLogger.info(CONTEXT, 'Fetching ad accounts')
      adAccounts = await fetchAdAccounts({ token: longToken })
      metaLogger.info(CONTEXT, 'Ad accounts fetched', { count: adAccounts.length })

      if (adAccounts.length === 0) {
        metaLogger.warn(CONTEXT, 'No ad accounts found for user')
        return NextResponse.redirect(`${origin}/${campaignId}?meta=no_ad_accounts`)
      }

      metaLogger.info(CONTEXT, 'Fetching pages for business connection')
      pages = await fetchPagesWithTokens({ token: longToken })
      metaLogger.info(CONTEXT, 'Pages fetched', { count: pages.length })

      assets = chooseAssets({ businesses, pages, adAccounts })
    } else if (connectionType === 'facebook_page') {
      // FACEBOOK PAGE: Fetch pages only
      metaLogger.info(CONTEXT, 'Fetching pages for page connection')
      pages = await fetchPagesWithTokens({ token: longToken })
      metaLogger.info(CONTEXT, 'Pages fetched', { count: pages.length })

      if (pages.length === 0) {
        metaLogger.warn(CONTEXT, 'No pages found for user')
        return NextResponse.redirect(`${origin}/${campaignId}?meta=no_pages`)
      }

      // Choose first page
      const firstPage = pages[0]
      assets = {
        page: {
          id: firstPage.id,
          name: firstPage.name,
          access_token: firstPage.access_token,
        },
      }
    } else if (connectionType === 'instagram') {
      // INSTAGRAM: Fetch pages + Instagram accounts
      metaLogger.info(CONTEXT, 'Fetching pages and Instagram accounts')
      pages = await fetchPagesWithTokens({ token: longToken })
      metaLogger.info(CONTEXT, 'Pages fetched', { count: pages.length })

      if (pages.length === 0) {
        metaLogger.warn(CONTEXT, 'No pages found (needed to get Instagram accounts)')
        return NextResponse.redirect(`${origin}/${campaignId}?meta=no_pages`)
      }

      // Find first page with Instagram account
      const pageWithInstagram = pages.find((p: any) => p.instagram_business_account?.id)
      
      if (!pageWithInstagram) {
        metaLogger.warn(CONTEXT, 'No Instagram Business accounts found')
        return NextResponse.redirect(`${origin}/${campaignId}?meta=no_instagram`)
      }

      assets = {
        page: {
          id: pageWithInstagram.id,
          name: pageWithInstagram.name,
          access_token: pageWithInstagram.access_token,
        },
        instagram: {
          id: pageWithInstagram.instagram_business_account.id,
          username: pageWithInstagram.instagram_business_account.username,
        },
      }
    } else {
      metaLogger.error(CONTEXT, 'Invalid connection type', new Error(`Unknown type: ${connectionType}`))
      return NextResponse.redirect(`${origin}/${campaignId}?meta=invalid_type`)
    }
    
    metaLogger.info(CONTEXT, 'Assets chosen', {
      connectionType,
      business: assets.business?.name || 'none',
      page: assets.page?.name || 'none',
      adAccount: assets.adAccount?.name || 'none',
      instagram: assets.instagram?.username || 'none',
    })

    // Step 8: Persist connection to campaign_meta_connections
    metaLogger.info(CONTEXT, 'Persisting connection to database', { connectionType })
    
    try {
      await persistConnection({
        campaignId,
        userId: user.id,
        fbUserId,
        longToken,
        assets,
        connectionType: connectionType as 'business' | 'facebook_page' | 'instagram',
      })
      metaLogger.info(CONTEXT, 'Connection persisted successfully', { connectionType })
    } catch (err) {
      metaLogger.error(CONTEXT, 'Failed to persist connection', err as Error)
      return NextResponse.redirect(`${origin}/${campaignId}?meta=persist_failed`)
    }

    // Step 9: Compute admin snapshot (roles) - only for business connections
    if (connectionType === 'business' && assets.business && assets.adAccount) {
      metaLogger.info(CONTEXT, 'Computing admin snapshot')
      
      try {
        const adminSnapshot = await computeAdminSnapshot({
          token: longToken,
          businessId: assets.business.id,
          adAccountId: assets.adAccount.id,
        })

        // Update connection with admin info
        await supabaseServer
          .from('campaign_meta_connections')
          .update({
            admin_connected: adminSnapshot.admin_connected,
            admin_business_role: adminSnapshot.admin_business_role || null,
            admin_ad_account_role: adminSnapshot.admin_ad_account_role || null,
            admin_checked_at: new Date().toISOString(),
          })
          .eq('campaign_id', campaignId)
          .eq('connection_type', connectionType)

        metaLogger.info(CONTEXT, 'Admin snapshot computed and stored', {
          adminConnected: adminSnapshot.admin_connected,
        })
      } catch (err) {
        metaLogger.error(CONTEXT, 'Failed to compute admin snapshot', err as Error)
        // Non-fatal - continue
      }
    }

    // Step 10: Update campaign state
    metaLogger.info(CONTEXT, 'Updating campaign state')
    
    try {
      await updateCampaignState({
        campaignId,
        status: 'token_ready',
      })
    } catch (err) {
      metaLogger.error(CONTEXT, 'Failed to update campaign state', err as Error)
      // Non-fatal
    }

    // Step 11: Clear cookie and redirect to success with connection type info
    const response = NextResponse.redirect(`${origin}/lovable/integrations?meta=connected&type=${connectionType}`)
    
    // Clear the type-specific campaign ID cookie
    response.cookies.delete(`meta_cid_${connectionType}`)
    // Also clear old generic cookie for backward compatibility
    response.cookies.delete('meta_cid')
    
    metaLogger.info(CONTEXT, 'OAuth callback completed successfully', {
      campaignId,
      connectionType,
      redirectUrl: `${origin}/lovable/integrations?meta=connected&type=${connectionType}`,
    })

    return response

  } catch (error) {
    metaLogger.error(CONTEXT, 'Unexpected error in OAuth callback', error as Error)
    
    const { origin, searchParams } = new URL(req.url)
    const connectionType = searchParams.get('type') || 'business'
    const cookieStore = await cookies()
    const campaignId = cookieStore.get(`meta_cid_${connectionType}`)?.value || 
                       cookieStore.get('meta_cid')?.value
    
    const redirectUrl = campaignId 
      ? `${origin}/lovable/integrations?meta=error&type=${connectionType}`
      : `${origin}/lovable/integrations?meta=error`
    
    return NextResponse.redirect(redirectUrl)
  }
}
