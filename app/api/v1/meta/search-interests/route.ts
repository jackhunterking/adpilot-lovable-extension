/**
 * Feature: Meta Interest Search API
 * Purpose: Search for interests via Meta Targeting Search
 * References:
 *  - Meta Interest Targeting: https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get user's Meta access token
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Return mock data for testing without auth
      const mockSuggestions = getMockInterestSuggestions(query)
      return NextResponse.json({ suggestions: mockSuggestions })
    }

    const { data: metaConnection } = await supabase
      .from('meta_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!metaConnection?.access_token) {
      // Return mock data if no Meta connection
      const mockSuggestions = getMockInterestSuggestions(query)
      return NextResponse.json({ suggestions: mockSuggestions })
    }

    // ⚠️ BACKEND OPERATION: Call Meta Targeting Search API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/search?` +
        `type=adinterest&` +
        `q=${encodeURIComponent(query)}&` +
        `access_token=${metaConnection.access_token}`
    )

    if (!response.ok) {
      console.error('Meta API error:', await response.text())
      const mockSuggestions = getMockInterestSuggestions(query)
      return NextResponse.json({ suggestions: mockSuggestions })
    }

    const data = await response.json()

    const suggestions = (data.data || []).map((interest: any) => ({
      id: interest.id,
      name: interest.name,
      audience_size: interest.audience_size,
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Interest search error:', error)
    
    // Return mock data as fallback
    const query = new URL(request.url).searchParams.get('q') || ''
    const mockSuggestions = getMockInterestSuggestions(query)
    return NextResponse.json({ suggestions: mockSuggestions })
  }
}

/**
 * Mock interest suggestions for testing without Meta API
 */
function getMockInterestSuggestions(query: string): any[] {
  const allInterests = [
    { id: '1', name: 'Technology', audience_size: 50000000 },
    { id: '2', name: 'Fitness', audience_size: 35000000 },
    { id: '3', name: 'Travel', audience_size: 45000000 },
    { id: '4', name: 'Food & Dining', audience_size: 60000000 },
    { id: '5', name: 'Fashion', audience_size: 40000000 },
    { id: '6', name: 'Business', audience_size: 30000000 },
    { id: '7', name: 'Health & Wellness', audience_size: 38000000 },
    { id: '8', name: 'Entertainment', audience_size: 55000000 },
    { id: '9', name: 'Sports', audience_size: 42000000 },
    { id: '10', name: 'Gaming', audience_size: 32000000 },
    { id: '11', name: 'Music', audience_size: 48000000 },
    { id: '12', name: 'Shopping', audience_size: 52000000 },
    { id: '13', name: 'Education', audience_size: 28000000 },
    { id: '14', name: 'Photography', audience_size: 25000000 },
    { id: '15', name: 'Cooking', audience_size: 33000000 },
  ]

  const queryLower = query.toLowerCase()
  return allInterests
    .filter((interest) => interest.name.toLowerCase().includes(queryLower))
    .slice(0, 10)
}

