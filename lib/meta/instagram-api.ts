/**
 * Instagram Graph API Integration
 * Handles publishing posts to Instagram Business accounts
 */

import { getGraphVersion } from './config/publishing-config';

export interface PublishToInstagramParams {
  igUserId: string;
  accessToken: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface InstagramPostResult {
  mediaId: string;
}

/**
 * Publish a post to Instagram
 * Two-step process: 1) Create media container, 2) Publish container
 */
export async function publishToInstagram(
  params: PublishToInstagramParams
): Promise<InstagramPostResult> {
  const { igUserId, accessToken, caption, imageUrl, videoUrl } = params;
  
  if (!imageUrl && !videoUrl) {
    throw new Error('Instagram posts require either an image or video');
  }
  
  const graphVersion = getGraphVersion();
  
  // Step 1: Create media container
  const containerPayload: Record<string, string> = {
    caption,
    access_token: accessToken,
  };
  
  if (videoUrl) {
    containerPayload.media_type = 'VIDEO';
    containerPayload.video_url = videoUrl;
  } else if (imageUrl) {
    containerPayload.image_url = imageUrl;
  }
  
  const containerResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${igUserId}/media`,
    {
      method: 'POST',
      body: new URLSearchParams(containerPayload),
    }
  );
  
  if (!containerResponse.ok) {
    const errorData = await containerResponse.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } }).error?.message ||
      `Instagram API error (container): ${containerResponse.status}`;
    throw new Error(errorMessage);
  }
  
  const containerData = await containerResponse.json() as { id?: string };
  const containerId = containerData.id;
  
  if (!containerId) {
    throw new Error('Failed to get container ID from Instagram response');
  }
  
  // Step 2: Publish the container
  // For videos, we need to wait for processing
  if (videoUrl) {
    await waitForVideoProcessing(igUserId, containerId, accessToken);
  }
  
  const publishResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${igUserId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );
  
  if (!publishResponse.ok) {
    const errorData = await publishResponse.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } }).error?.message ||
      `Instagram API error (publish): ${publishResponse.status}`;
    throw new Error(errorMessage);
  }
  
  const publishData = await publishResponse.json() as { id?: string };
  const mediaId = publishData.id;
  
  if (!mediaId) {
    throw new Error('Failed to get media ID from Instagram publish response');
  }
  
  return { mediaId };
}

/**
 * Wait for Instagram video processing to complete
 */
async function waitForVideoProcessing(
  igUserId: string,
  containerId: string,
  accessToken: string,
  maxAttempts = 30
): Promise<void> {
  const graphVersion = getGraphVersion();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusResponse = await fetch(
      `https://graph.facebook.com/${graphVersion}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json() as { status_code?: string };
      
      if (statusData.status_code === 'FINISHED') {
        return;
      } else if (statusData.status_code === 'ERROR') {
        throw new Error('Instagram video processing failed');
      }
    }
    
    // Wait 2 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Instagram video processing timed out');
}

/**
 * Delete an Instagram post
 */
export async function deleteInstagramPost(params: {
  mediaId: string;
  accessToken: string;
}): Promise<void> {
  const { mediaId, accessToken } = params;
  const graphVersion = getGraphVersion();
  
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${mediaId}?access_token=${accessToken}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } }).error?.message ||
      `Failed to delete Instagram post: ${response.status}`;
    throw new Error(errorMessage);
  }
}

/**
 * Get Instagram post insights
 */
export async function getInstagramPostInsights(params: {
  mediaId: string;
  accessToken: string;
}): Promise<{
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  impressions: number;
}> {
  const { mediaId, accessToken } = params;
  const graphVersion = getGraphVersion();
  
  // Get insights
  const insightsResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
  );
  
  if (!insightsResponse.ok) {
    throw new Error(`Failed to fetch Instagram insights: ${insightsResponse.status}`);
  }
  
  const insightsData = await insightsResponse.json() as {
    data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
  };
  
  let likes = 0;
  let reach = 0;
  let impressions = 0;
  let saves = 0;
  
  for (const metric of insightsData.data || []) {
    if (metric.name === 'engagement') {
      likes = metric.values?.[0]?.value || 0;
    } else if (metric.name === 'reach') {
      reach = metric.values?.[0]?.value || 0;
    } else if (metric.name === 'impressions') {
      impressions = metric.values?.[0]?.value || 0;
    } else if (metric.name === 'saved') {
      saves = metric.values?.[0]?.value || 0;
    }
  }
  
  // Get comments count
  const mediaResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${mediaId}?fields=comments_count&access_token=${accessToken}`
  );
  
  let comments = 0;
  if (mediaResponse.ok) {
    const mediaData = await mediaResponse.json() as { comments_count?: number };
    comments = mediaData.comments_count || 0;
  }
  
  return {
    likes,
    comments,
    saves,
    reach,
    impressions,
  };
}

