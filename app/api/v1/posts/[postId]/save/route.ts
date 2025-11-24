/**
 * API Route: /api/v1/posts/[postId]/save
 * Save post content
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * PUT /api/v1/posts/[postId]/save
 * Save post content, media, platforms, and schedule
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const getResult = await postServiceServer.getPost.execute({
      postId: params.postId,
    });

    if (!getResult.success || getResult.data.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      postText,
      mediaUrl,
      mediaType,
      publishToFacebook,
      publishToInstagram,
      scheduleType,
      scheduledAt,
    } = body;

    const result = await postServiceServer.savePost.execute({
      postId: params.postId,
      postText,
      mediaUrl,
      mediaType,
      publishToFacebook,
      publishToInstagram,
      scheduleType,
      scheduledAt,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to save post' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] PUT /api/v1/posts/[postId]/save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

