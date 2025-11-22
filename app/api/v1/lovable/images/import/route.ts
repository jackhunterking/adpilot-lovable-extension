/**
 * Feature: Lovable Integration - Import Image Endpoint
 * Purpose: Import image from Lovable Storage to AdPilot Storage
 * References:
 *  - POST /api/v1/lovable/images/import
 *  - Service: LovableSyncService
 *  - Copies image to AdPilot Storage (source of truth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { LovableSyncService } from '@/lib/services/lovable';

/**
 * Import image(s) from Lovable to AdPilot (supports dual format)
 * 
 * POST /api/v1/lovable/images/import
 * 
 * Body:
 * {
 *   // Single format (legacy)
 *   sourceUrl?: string;
 *   // OR Dual format (Lovable extension)
 *   sourceUrlSquare?: string;
 *   sourceUrlVertical?: string;
 *   selectedFormat?: 'square' | 'vertical';
 *   
 *   campaignId: string;
 *   adId: string;
 *   metadata?: {
 *     lovableProjectId: string;
 *     prompt?: string;
 *     generatedBy?: 'lovable_ai' | 'user_upload';
 *   };
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data?: {
 *     creative: Creative;
 *     importRecords: ImageImportRecord[];
 *     originalUrls: { square?: string; vertical?: string };
 *   };
 *   error?: { code: string; message: string };
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'unauthorized',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { sourceUrl, sourceUrlSquare, sourceUrlVertical, selectedFormat, campaignId, adId, metadata } = body;

    // Validate: either sourceUrl (legacy) or at least one dual format URL
    const hasSingleFormat = Boolean(sourceUrl);
    const hasDualFormat = Boolean(sourceUrlSquare || sourceUrlVertical);
    
    if (!hasSingleFormat && !hasDualFormat) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'missing_required_fields',
            message: 'Either sourceUrl or sourceUrlSquare/sourceUrlVertical is required'
          }
        },
        { status: 400 }
      );
    }

    if (!campaignId || !adId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'missing_required_fields',
            message: 'campaignId and adId are required'
          }
        },
        { status: 400 }
      );
    }

    // 3. Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'campaign_not_found',
            message: 'Campaign not found or access denied'
          }
        },
        { status: 404 }
      );
    }

    // 4. Verify ad ownership
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('id')
      .eq('id', adId)
      .eq('campaign_id', campaignId)
      .single();

    if (adError || !ad) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ad_not_found',
            message: 'Ad not found or access denied'
          }
        },
        { status: 404 }
      );
    }

    // 5. Delegate to sync service (copies image to AdPilot Storage)
    const syncService = new LovableSyncService(supabase);
    
    // Handle dual format import
    if (hasDualFormat) {
      console.log('[Lovable API] Importing dual format images:', {
        square: sourceUrlSquare,
        vertical: sourceUrlVertical,
        selectedFormat
      });
      
      const result = await syncService.importDualFormatImages({
        sourceUrlSquare,
        sourceUrlVertical,
        selectedFormat: selectedFormat || 'square',
        campaignId,
        adId,
        userId: user.id,
        metadata
      });
      
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        data: result.data
      });
    }
    
    // Handle legacy single format import
    console.log('[Lovable API] Importing single format image from:', sourceUrl);
    const result = await syncService.importImageFromLovable({
      sourceUrl,
      campaignId,
      adId,
      userId: user.id,
      metadata
    });

    // 6. Return response
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('[Lovable API] Import image failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'internal_error',
          message: 'Failed to import image'
        }
      },
      { status: 500 }
    );
  }
}

