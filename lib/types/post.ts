/**
 * Types for social media posts
 */

export interface Post {
  id: string;
  user_id: string;
  campaign_id?: string;
  lovable_project_id?: string;
  name: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  
  post_text?: string;
  media_type?: 'image' | 'video' | 'none';
  media_url?: string;
  
  publish_to_facebook: boolean;
  publish_to_instagram: boolean;
  
  schedule_type: 'immediate' | 'scheduled';
  scheduled_at?: string;
  
  published_at?: string;
  facebook_post_id?: string;
  instagram_post_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PostDraft {
  postText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  publishToFacebook: boolean;
  publishToInstagram: boolean;
  scheduleType: 'immediate' | 'scheduled';
  scheduledAt?: string;
}

export interface PostBuilderStep {
  id: number;
  name: string;
  component: React.ComponentType<PostBuilderStepProps>;
}

export interface PostBuilderStepProps {
  draft: PostDraft;
  onUpdate: (updates: Partial<PostDraft>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  user_id: string;
  platform: 'facebook' | 'instagram';
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

