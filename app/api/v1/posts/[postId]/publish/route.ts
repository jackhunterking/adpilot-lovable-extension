/**
 * API Route: /api/v1/posts/[postId]/publish
 * Publish post to Meta platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { postServiceServer } from '@/lib/services/server/post-service-server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/posts/[postId]/publish
 * Publish post to Facebook and/or Instagram
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

    const post = getResult.data;

    // Backend validation: Check Meta connections if publishing to Meta platforms
    if (post.publish_to_facebook || post.publish_to_instagram) {
      if (!post.campaign_id) {
        return NextResponse.json(
          { error: 'Post must be associated with a campaign' },
          { status: 400 }
        );
      }

      // Check campaign_meta_connections for required accounts
      const { data: metaConnection } = await supabase
        .from('campaign_meta_connections')
        .select('selected_page_id, selected_ig_user_id')
        .eq('campaign_id', post.campaign_id)
        .single();

      // Validate Facebook connection
      if (post.publish_to_facebook && !metaConnection?.selected_page_id) {
        return NextResponse.json(
          { error: 'Facebook Page not connected. Please connect your Facebook Page in Integrations.' },
          { status: 400 }
        );
      }

      // Validate Instagram connection
      if (post.publish_to_instagram && !metaConnection?.selected_ig_user_id) {
        return NextResponse.json(
          { error: 'Instagram account not connected. Please connect your Instagram account in Integrations.' },
          { status: 400 }
        );
      }

      // Validate Instagram requires media
      if (post.publish_to_instagram && !post.media_url) {
        return NextResponse.json(
          { error: 'Instagram posts require an image or video. Please upload media.' },
          { status: 400 }
        );
      }
    }

    const result = await postServiceServer.publishPost.execute({
      postId: params.postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to publish post' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[API] POST /api/v1/posts/[postId]/publish error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

