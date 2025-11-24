/**
 * Feature: Ad Image Upload API
 * Purpose: Upload ad images to Supabase Storage
 * References:
 *   - Storage bucket: ad-creatives (public for Meta API access)
 *   - Service layer: lib/services/
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema
const uploadSchema = z.object({
  adId: z.string().uuid('Invalid ad ID'),
  campaignId: z.string().uuid('Invalid campaign ID'),
});

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * POST /api/v1/ads/images/upload
 * Upload an image for an ad
 * 
 * ⚠️ BACKEND OPERATION: Uploads to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to upload images' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adId = formData.get('adId') as string;
    const campaignId = formData.get('campaignId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Please select an image to upload' },
        { status: 400 }
      );
    }

    // 3. Validate parameters
    const validationResult = uploadSchema.safeParse({ adId, campaignId });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          message: validationResult.error.errors[0].message,
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // 4. Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large',
          message: `Image must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          message: 'Only PNG, JPEG, and WebP images are allowed',
          allowedTypes: ALLOWED_TYPES
        },
        { status: 400 }
      );
    }

    // 5. Verify user owns the ad (via campaign ownership)
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('id, campaign_id, campaigns!inner(user_id)')
      .eq('id', adId)
      .eq('campaign_id', campaignId)
      .single();

    if (adError || !ad) {
      return NextResponse.json(
        { error: 'Ad not found', message: 'The specified ad does not exist' },
        { status: 404 }
      );
    }

    // @ts-expect-error - Supabase join syntax
    if (ad.campaigns.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to upload images for this ad' },
        { status: 403 }
      );
    }

    // 6. Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomSuffix}.${extension}`;
    
    // Storage path: {user_id}/{campaign_id}/{ad_id}/{filename}
    const storagePath = `${user.id}/${campaignId}/${adId}/${filename}`;

    // 7. Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-creatives')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Image Upload] Storage error:', uploadError);
      
      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: 'Storage not configured',
            message: 'Image storage bucket is not set up. Please contact support.',
            details: 'The ad-creatives bucket needs to be created in Supabase Storage'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Upload failed',
          message: uploadError.message || 'Failed to upload image to storage',
          details: uploadError
        },
        { status: 500 }
      );
    }

    // 8. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ad-creatives')
      .getPublicUrl(storagePath);

    // 9. Return success response
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      path: storagePath,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('[Image Upload] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/ads/images/upload?path={storagePath}
 * Delete an uploaded image
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get storage path from query params
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Missing storage path' },
        { status: 400 }
      );
    }

    // 3. Verify user owns the file (path starts with user_id)
    if (!storagePath.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own images' },
        { status: 403 }
      );
    }

    // 4. Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('ad-creatives')
      .remove([storagePath]);

    if (deleteError) {
      console.error('[Image Delete] Storage error:', deleteError);
      return NextResponse.json(
        { error: 'Delete failed', message: deleteError.message },
        { status: 500 }
      );
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('[Image Delete] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

