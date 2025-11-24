/**
 * API Route: /api/v1/posts/[postId]/duplicate
 * Duplicate a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/posts/[postId]/duplicate
 * Create a copy of an existing post
 */
export async function POST(
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

    const result = await postServiceServer.duplicatePost.execute({
      postId: params.postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to duplicate post' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/v1/posts/[postId]/duplicate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

