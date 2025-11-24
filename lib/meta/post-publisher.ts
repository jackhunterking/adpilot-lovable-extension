/**
 * Social Post Publisher
 * Orchestrates cross-posting to Facebook and Instagram
 */

import { createServerClient } from '../supabase/server';
import { publishToFacebookPage } from './pages-api';
import { publishToInstagram } from './instagram-api';

export interface PublishPostParams {
  postId: string;
  userId: string;
}

export interface PublishResult {
  success: boolean;
  facebookPostId?: string;
  instagramMediaId?: string;
  errors?: {
    facebook?: string;
    instagram?: string;
  };
}

/**
 * Publish a post to Facebook and/or Instagram
 */
export async function publishPost(
  params: PublishPostParams
): Promise<PublishResult> {
  const { postId, userId } = params;
  
  const supabase = await createServerClient();
  
  // Get the post
  const { data: post, error: postError } = await supabase
    .from('social_posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', userId)
    .single();
  
  if (postError || !post) {
    throw new Error('Post not found or access denied');
  }
  
  // Get Meta connection
  const { data: connection, error: connectionError } = await supabase
    .from('campaign_meta_connections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (connectionError || !connection) {
    throw new Error('Meta connection not found. Please connect your Meta Business account.');
  }
  
  if (!connection.selected_page_access_token) {
    throw new Error('Page access token not found. Please reconnect your Meta account.');
  }
  
  const result: PublishResult = {
    success: false,
  };
  
  const errors: { facebook?: string; instagram?: string } = {};
  
  // Publish to Facebook if enabled
  if (post.publish_to_facebook && connection.selected_page_id) {
    try {
      const fbResult = await publishToFacebookPage({
        pageId: connection.selected_page_id,
        accessToken: connection.selected_page_access_token,
        message: post.post_text || '',
        imageUrl: post.media_type === 'image' ? post.media_url : undefined,
        videoUrl: post.media_type === 'video' ? post.media_url : undefined,
        scheduledTime: post.schedule_type === 'scheduled' ? post.scheduled_at : undefined,
      });
      
      result.facebookPostId = fbResult.postId;
      console.log(`[Post Publisher] Facebook post created: ${fbResult.postId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.facebook = errorMessage;
      console.error('[Post Publisher] Facebook publish failed:', errorMessage);
    }
  }
  
  // Publish to Instagram if enabled
  if (post.publish_to_instagram && connection.selected_ig_user_id) {
    // Instagram requires media
    if (!post.media_url) {
      errors.instagram = 'Instagram posts require an image or video';
    } else {
      try {
        const igResult = await publishToInstagram({
          igUserId: connection.selected_ig_user_id,
          accessToken: connection.selected_page_access_token,
          caption: post.post_text || '',
          imageUrl: post.media_type === 'image' ? post.media_url : undefined,
          videoUrl: post.media_type === 'video' ? post.media_url : undefined,
        });
        
        result.instagramMediaId = igResult.mediaId;
        console.log(`[Post Publisher] Instagram post created: ${igResult.mediaId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.instagram = errorMessage;
        console.error('[Post Publisher] Instagram publish failed:', errorMessage);
      }
    }
  }
  
  // Update post in database
  const hasErrors = Object.keys(errors).length > 0;
  const wasPublished = !!(result.facebookPostId || result.instagramMediaId);
  
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  
  if (wasPublished) {
    updateData.status = hasErrors ? 'published' : 'published'; // Partial success still counts
    updateData.published_at = new Date().toISOString();
    if (result.facebookPostId) {
      updateData.facebook_post_id = result.facebookPostId;
    }
    if (result.instagramMediaId) {
      updateData.instagram_post_id = result.instagramMediaId;
    }
    result.success = true;
  } else {
    updateData.status = 'failed';
    result.success = false;
  }
  
  await supabase
    .from('social_posts')
    .update(updateData)
    .eq('id', postId);
  
  if (Object.keys(errors).length > 0) {
    result.errors = errors;
  }
  
  return result;
}

/**
 * Validate post before publishing
 */
export function validatePost(post: {
  post_text?: string;
  media_url?: string;
  media_type?: string;
  publish_to_facebook: boolean;
  publish_to_instagram: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // At least one platform must be selected
  if (!post.publish_to_facebook && !post.publish_to_instagram) {
    errors.push('Please select at least one platform (Facebook or Instagram)');
  }
  
  // Instagram requires media
  if (post.publish_to_instagram && !post.media_url) {
    errors.push('Instagram posts require an image or video');
  }
  
  // At least text or media required
  if (!post.post_text && !post.media_url) {
    errors.push('Post must have text, an image, or a video');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

