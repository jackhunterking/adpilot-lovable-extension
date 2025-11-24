/**
 * Facebook Pages API Integration
 * Handles publishing posts to Facebook Pages
 */

import { getGraphVersion } from './config/publishing-config';

export interface PublishToFacebookPageParams {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledTime?: string;
}

export interface FacebookPostResult {
  postId: string;
}

/**
 * Publish a post to a Facebook Page
 */
export async function publishToFacebookPage(
  params: PublishToFacebookPageParams
): Promise<FacebookPostResult> {
  const { pageId, accessToken, message, imageUrl, videoUrl, scheduledTime } = params;
  
  const graphVersion = getGraphVersion();
  
  // Determine endpoint based on media type
  let endpoint: string;
  let payload: Record<string, string> = {
    message,
    access_token: accessToken,
  };
  
  if (scheduledTime) {
    // Convert to Unix timestamp
    const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
    payload.scheduled_publish_time = timestamp.toString();
    payload.published = 'false'; // Required for scheduled posts
  }
  
  if (videoUrl) {
    // Video post
    endpoint = `https://graph.facebook.com/${graphVersion}/${pageId}/videos`;
    payload.file_url = videoUrl;
  } else if (imageUrl) {
    // Photo post
    endpoint = `https://graph.facebook.com/${graphVersion}/${pageId}/photos`;
    payload.url = imageUrl;
    payload.caption = message;
    delete payload.message; // Photos use caption instead
  } else {
    // Text-only post
    endpoint = `https://graph.facebook.com/${graphVersion}/${pageId}/feed`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: new URLSearchParams(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = 
      (errorData as { error?: { message?: string } }).error?.message ||
      `Facebook API error: ${response.status}`;
    throw new Error(errorMessage);
  }
  
  const data = await response.json() as { id?: string; post_id?: string };
  const postId = data.id || data.post_id;
  
  if (!postId) {
    throw new Error('Failed to get post ID from Facebook response');
  }
  
  return { postId };
}

/**
 * Delete a Facebook post
 */
export async function deleteFacebookPost(params: {
  postId: string;
  accessToken: string;
}): Promise<void> {
  const { postId, accessToken } = params;
  const graphVersion = getGraphVersion();
  
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${postId}?access_token=${accessToken}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } }).error?.message ||
      `Failed to delete Facebook post: ${response.status}`;
    throw new Error(errorMessage);
  }
}

/**
 * Get Facebook post insights
 */
export async function getPagePostInsights(params: {
  postId: string;
  accessToken: string;
}): Promise<{
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
}> {
  const { postId, accessToken } = params;
  const graphVersion = getGraphVersion();
  
  // Get engagement metrics
  const engagementResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`
  );
  
  if (!engagementResponse.ok) {
    throw new Error(`Failed to fetch engagement data: ${engagementResponse.status}`);
  }
  
  const engagementData = await engagementResponse.json() as {
    likes?: { summary?: { total_count?: number } };
    comments?: { summary?: { total_count?: number } };
    shares?: { count?: number };
  };
  
  // Get insights (reach, impressions)
  const insightsResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${postId}/insights?metric=post_impressions,post_impressions_unique&access_token=${accessToken}`
  );
  
  let reach = 0;
  let impressions = 0;
  
  if (insightsResponse.ok) {
    const insightsData = await insightsResponse.json() as {
      data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
    };
    
    for (const metric of insightsData.data || []) {
      if (metric.name === 'post_impressions_unique') {
        reach = metric.values?.[0]?.value || 0;
      } else if (metric.name === 'post_impressions') {
        impressions = metric.values?.[0]?.value || 0;
      }
    }
  }
  
  return {
    likes: engagementData.likes?.summary?.total_count || 0,
    comments: engagementData.comments?.summary?.total_count || 0,
    shares: engagementData.shares?.count || 0,
    reach,
    impressions,
  };
}

