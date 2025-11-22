/**
 * Feature: Meta Location Search API
 * Purpose: Search for locations (countries, states, cities) via Meta Targeting Search
 * References:
 *  - Meta Targeting Search: https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search
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
      const mockSuggestions = getMockLocationSuggestions(query)
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
      const mockSuggestions = getMockLocationSuggestions(query)
      return NextResponse.json({ suggestions: mockSuggestions })
    }

    // ⚠️ BACKEND OPERATION: Call Meta Targeting Search API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/search?` +
        `type=adgeolocation&` +
        `q=${encodeURIComponent(query)}&` +
        `location_types=["country","region","city"]&` +
        `access_token=${metaConnection.access_token}`
    )

    if (!response.ok) {
      console.error('Meta API error:', await response.text())
      const mockSuggestions = getMockLocationSuggestions(query)
      return NextResponse.json({ suggestions: mockSuggestions })
    }

    const data = await response.json()

    const suggestions = (data.data || []).map((location: any) => ({
      key: location.key,
      name: location.name,
      type: location.type,
      country_code: location.country_code,
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Location search error:', error)
    
    // Return mock data as fallback
    const query = new URL(request.url).searchParams.get('q') || ''
    const mockSuggestions = getMockLocationSuggestions(query)
    return NextResponse.json({ suggestions: mockSuggestions })
  }
}

/**
 * Mock location suggestions for testing without Meta API
 */
function getMockLocationSuggestions(query: string): any[] {
  const allLocations = [
    { key: 'US', name: 'United States', type: 'country' },
    { key: 'GB', name: 'United Kingdom', type: 'country' },
    { key: 'CA', name: 'Canada', type: 'country' },
    { key: 'AU', name: 'Australia', type: 'country' },
    { key: 'US-NY', name: 'New York', type: 'region' },
    { key: 'US-CA', name: 'California', type: 'region' },
    { key: 'US-TX', name: 'Texas', type: 'region' },
    { key: 'US-FL', name: 'Florida', type: 'region' },
    { key: 'NYC', name: 'New York City', type: 'city' },
    { key: 'LA', name: 'Los Angeles', type: 'city' },
    { key: 'CHI', name: 'Chicago', type: 'city' },
    { key: 'SF', name: 'San Francisco', type: 'city' },
  ]

  const queryLower = query.toLowerCase()
  return allLocations
    .filter((loc) => loc.name.toLowerCase().includes(queryLower))
    .slice(0, 8)
}

