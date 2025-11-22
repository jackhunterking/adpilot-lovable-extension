/**
 * Feature: Test Meta Conversion Event
 * Purpose: Send a test conversion event to Meta Conversions API
 * References:
 *  - Meta Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, event_type = 'Lead' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // ⚠️ BACKEND OPERATION: Get user's Meta connection
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: metaConnection } = await supabase
      .from('meta_connections')
      .select('access_token, pixel_id')
      .eq('user_id', user.user.id)
      .single()

    if (!metaConnection) {
      return NextResponse.json(
        { error: 'Meta account not connected' },
        { status: 400 }
      )
    }

    // Hash email with SHA-256
    const hashedEmail = crypto
      .createHash('sha256')
      .update(email.toLowerCase().trim())
      .digest('hex')

    // ⚠️ BACKEND OPERATION: Send test event to Meta Conversions API
    const pixelId = metaConnection.pixel_id || process.env.FB_PIXEL_ID
    
    const conversionData = {
      data: [
        {
          event_name: event_type,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: process.env.NEXT_PUBLIC_APP_URL,
          user_data: {
            em: [hashedEmail],
          },
          custom_data: {
            test_event: true,
          },
        },
      ],
      test_event_code: 'TEST12345', // For testing in Meta Events Manager
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?` +
        `access_token=${metaConnection.access_token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversionData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Conversion API error:', error)
      return NextResponse.json(
        { error: 'Failed to send conversion event' },
        { status: 400 }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Test conversion event sent successfully',
      events_received: result.events_received || 0,
      fbtrace_id: result.fbtrace_id,
    })
  } catch (error) {
    console.error('Test conversion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

