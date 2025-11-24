-- Create social_posts table for managing social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  lovable_project_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, scheduled, published, failed
  
  -- Content
  post_text TEXT,
  media_type TEXT,  -- image, video, none
  media_url TEXT,
  
  -- Platform targeting
  publish_to_facebook BOOLEAN DEFAULT true,
  publish_to_instagram BOOLEAN DEFAULT true,
  
  -- Scheduling
  schedule_type TEXT DEFAULT 'immediate',  -- immediate, scheduled
  scheduled_at TIMESTAMPTZ,
  
  -- Publishing results
  published_at TIMESTAMPTZ,
  facebook_post_id TEXT,
  instagram_post_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_campaign_id ON social_posts(campaign_id) WHERE campaign_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own posts"
  ON social_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON social_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON social_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON social_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE social_posts IS 'Social media posts for Facebook and Instagram';

