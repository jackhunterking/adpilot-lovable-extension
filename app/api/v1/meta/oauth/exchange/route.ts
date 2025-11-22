/**
 * Feature: Meta OAuth Code Exchange
 * Purpose: Exchange OAuth authorization code for access token and fetch ad accounts
 * References:
 *  - Meta OAuth: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 *  - Meta Marketing API: https://developers.facebook.com/docs/marketing-api/reference/user/adaccounts
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_FB_APP_ID
    const clientSecret = process.env.FB_APP_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/meta/oauth`

    // ⚠️ BACKEND OPERATION: Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${clientId}&` +
        `client_secret=${clientSecret}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `code=${code}`
    )

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('Token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // ⚠️ BACKEND OPERATION: Fetch user's ad accounts
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?` +
        `fields=id,name,account_id&` +
        `access_token=${accessToken}`
    )

    if (!adAccountsResponse.ok) {
      const error = await adAccountsResponse.json()
      console.error('Failed to fetch ad accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ad accounts' },
        { status: 400 }
      )
    }

    const adAccountsData = await adAccountsResponse.json()

    return NextResponse.json({
      access_token: accessToken,
      ad_accounts: adAccountsData.data || [],
    })
  } catch (error) {
    console.error('OAuth exchange error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

