/**
 * API Route: /api/v1/posts/[postId]
 * Handles individual post operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/posts/[postId]
 * Get a single post by ID
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

    const result = await postServiceServer.getPost.execute({
      postId: params.postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to get post' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (result.data.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] GET /api/v1/posts/[postId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/posts/[postId]
 * Update a post
 */
export async function PATCH(
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
    const { name, status } = body;

    const result = await postServiceServer.updatePost.execute({
      postId: params.postId,
      name,
      status,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update post' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] PATCH /api/v1/posts/[postId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/posts/[postId]
 * Delete a post
 */
export async function DELETE(
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

    const result = await postServiceServer.deletePost.execute({
      postId: params.postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete post' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/v1/posts/[postId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

