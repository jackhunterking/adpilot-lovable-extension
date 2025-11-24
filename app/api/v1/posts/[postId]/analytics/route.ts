/**
 * API Route: /api/v1/posts/[postId]/analytics
 * Get post analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/posts/[postId]/analytics
 * Get analytics for a post from Facebook and Instagram
 */
export async function GET(
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

    const result = await postServiceServer.getPostAnalytics.execute({
      postId: params.postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to get analytics' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] GET /api/v1/posts/[postId]/analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

