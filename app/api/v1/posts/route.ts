/**
 * API Route: /api/v1/posts
 * Handles listing and creating posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/posts
 * List posts with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId') || undefined;
    const status = searchParams.get('status') as 'draft' | 'scheduled' | 'published' | 'failed' | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const result = await postServiceServer.listPosts.execute({
      userId: user.id,
      campaignId,
      status,
      limit,
      offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to list posts' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] GET /api/v1/posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/posts
 * Create a new post
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { campaignId, lovableProjectId, name, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Post name is required' },
        { status: 400 }
      );
    }

    const result = await postServiceServer.createPost.execute({
      userId: user.id,
      campaignId,
      lovableProjectId,
      name,
      status,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create post' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/v1/posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

