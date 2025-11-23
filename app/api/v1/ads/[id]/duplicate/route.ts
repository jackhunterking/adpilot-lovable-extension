/**
 * Feature: Duplicate Ad API Endpoint
 * Purpose: Clone an existing ad with all its data (creative, copy, destinations, locations, budget)
 * References:
 *  - API v1 Middleware: app/api/v1/_middleware.ts
 *  - Ad Data Service: lib/services/ad-data-service.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdOwnership, errorResponse, successResponse, NotFoundError } from '@/app/api/v1/_middleware'
import { supabaseServer } from '@/lib/supabase/server'
import { adDataService } from '@/lib/services/ad-data-service'

/**
 * POST /api/v1/ads/[id]/duplicate - Duplicate an ad
 * 
 * Creates a complete copy of an ad including:
 * - Ad record (with new name)
 * - All creative variations
 * - All copy variations
 * - Destination configuration
 * - Target locations
 * - Budget configuration
 * 
 * The duplicate is created in draft status and can be edited before publishing.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: sourceAdId } = await context.params
    
    // Verify ownership of source ad
    await requireAdOwnership(sourceAdId, user.id)
    
    // Get complete ad data using ad-data-service
    const sourceData = await adDataService.getCompleteAdData(sourceAdId)
    
    if (!sourceData) {
      throw new NotFoundError('Source ad not found')
    }
    
    // Create duplicate ad record
    const { data: newAd, error: createError } = await supabaseServer
      .from('ads')
      .insert({
        campaign_id: sourceData.ad.campaign_id,
        name: `${sourceData.ad.name} (Copy)`,
        status: 'draft',
        destination_type: sourceData.ad.destination_type,
        lovable_project_id: sourceData.ad.lovable_project_id,
      })
      .select()
      .single()
    
    if (createError || !newAd) {
      console.error('[POST /api/v1/ads/:id/duplicate] Failed to create ad:', createError)
      throw new Error('Failed to create duplicate ad')
    }
    
    const newAdId = newAd.id
    console.log(`[POST /api/v1/ads/:id/duplicate] Created duplicate ad ${newAdId} from ${sourceAdId}`)
    
    // Duplicate creatives if they exist
    if (sourceData.creatives && sourceData.creatives.length > 0) {
      const creativeInserts = sourceData.creatives.map((creative, idx) => ({
        ad_id: newAdId,
        creative_format: creative.creative_format,
        image_url_square: creative.image_url_square,
        image_url_vertical: creative.image_url_vertical,
        selected_format: creative.selected_format,
        creative_style: creative.creative_style,
        variation_label: creative.variation_label,
        is_base_image: creative.is_base_image,
        sort_order: idx,
        format_metadata: creative.format_metadata,
        metadata: creative.metadata,
      }))
      
      const { data: newCreatives, error: creativeError } = await supabaseServer
        .from('ad_creatives')
        .insert(creativeInserts)
        .select()
      
      if (creativeError) {
        console.error('[POST /api/v1/ads/:id/duplicate] Failed to duplicate creatives:', creativeError)
      } else if (newCreatives && newCreatives.length > 0) {
        // Set the first creative as selected (or the one that was selected in source)
        const selectedSourceIdx = sourceData.creatives.findIndex(c => c.id === sourceData.ad.selected_creative_id)
        const selectedIdx = selectedSourceIdx >= 0 ? selectedSourceIdx : 0
        
        if (newCreatives[selectedIdx]) {
          await supabaseServer
            .from('ads')
            .update({ selected_creative_id: newCreatives[selectedIdx].id })
            .eq('id', newAdId)
        }
        
        console.log(`[POST /api/v1/ads/:id/duplicate] Duplicated ${newCreatives.length} creatives`)
      }
    }
    
    // Duplicate copy variations if they exist
    if (sourceData.copyVariations && sourceData.copyVariations.length > 0) {
      const copyInserts = sourceData.copyVariations.map((copy, idx) => ({
        ad_id: newAdId,
        headline: copy.headline,
        primary_text: copy.primary_text,
        description: copy.description,
        cta_text: copy.cta_text,
        cta_type: copy.cta_type,
        is_selected: copy.is_selected,
        sort_order: idx,
        generation_prompt: copy.generation_prompt,
      }))
      
      const { data: newCopyVariations, error: copyError } = await supabaseServer
        .from('ad_copy_variations')
        .insert(copyInserts)
        .select()
      
      if (copyError) {
        console.error('[POST /api/v1/ads/:id/duplicate] Failed to duplicate copy:', copyError)
      } else if (newCopyVariations) {
        // Set selected copy
        const selectedCopy = newCopyVariations.find(c => c.is_selected)
        if (selectedCopy) {
          await supabaseServer
            .from('ads')
            .update({ selected_copy_id: selectedCopy.id })
            .eq('id', newAdId)
        }
        
        console.log(`[POST /api/v1/ads/:id/duplicate] Duplicated ${newCopyVariations.length} copy variations`)
      }
    }
    
    // Duplicate destination if it exists
    if (sourceData.destination) {
      const { error: destError } = await supabaseServer
        .from('ad_destinations')
        .insert({
          ad_id: newAdId,
          destination_type: sourceData.destination.destination_type,
          instant_form_id: sourceData.destination.instant_form_id,
          website_url: sourceData.destination.website_url,
          display_link: sourceData.destination.display_link,
          utm_params: sourceData.destination.utm_params,
          phone_number: sourceData.destination.phone_number,
          phone_country_code: sourceData.destination.phone_country_code,
          phone_formatted: sourceData.destination.phone_formatted,
        })
      
      if (destError) {
        console.error('[POST /api/v1/ads/:id/duplicate] Failed to duplicate destination:', destError)
      } else {
        console.log(`[POST /api/v1/ads/:id/duplicate] Duplicated destination`)
      }
    }
    
    // Duplicate target locations if they exist
    if (sourceData.locations && sourceData.locations.length > 0) {
      const locationInserts = sourceData.locations.map((loc) => ({
        ad_id: newAdId,
        location_name: loc.location_name,
        location_type: loc.location_type,
        latitude: loc.latitude,
        longitude: loc.longitude,
        radius_km: loc.radius_km,
        inclusion_mode: loc.inclusion_mode,
        meta_location_key: loc.meta_location_key,
        bbox: loc.bbox,
        geometry: loc.geometry,
      }))
      
      const { error: locError } = await supabaseServer
        .from('ad_target_locations')
        .insert(locationInserts)
      
      if (locError) {
        console.error('[POST /api/v1/ads/:id/duplicate] Failed to duplicate locations:', locError)
      } else {
        console.log(`[POST /api/v1/ads/:id/duplicate] Duplicated ${locationInserts.length} locations`)
      }
    }
    
    // Duplicate budget if it exists
    if (sourceData.budget) {
      const { error: budgetError } = await supabaseServer
        .from('ad_budgets')
        .insert({
          ad_id: newAdId,
          daily_budget_cents: sourceData.budget.daily_budget_cents,
          currency_code: sourceData.budget.currency_code,
          start_date: sourceData.budget.start_date,
          end_date: sourceData.budget.end_date,
          timezone: sourceData.budget.timezone,
        })
      
      if (budgetError) {
        console.error('[POST /api/v1/ads/:id/duplicate] Failed to duplicate budget:', budgetError)
      } else {
        console.log(`[POST /api/v1/ads/:id/duplicate] Duplicated budget`)
      }
    }
    
    console.log(`[POST /api/v1/ads/:id/duplicate] ✅ Successfully duplicated ad ${sourceAdId} → ${newAdId}`)
    
    return successResponse({ 
      ad: newAd,
      message: 'Ad duplicated successfully' 
    }, undefined, 201)
    
  } catch (error) {
    console.error('[POST /api/v1/ads/:id/duplicate] Error:', error)
    return errorResponse(error as Error)
  }
}

