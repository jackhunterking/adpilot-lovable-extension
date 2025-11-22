-- ============================================================================
-- Add lovable_project_id to ads table for Lovable Extension
-- ============================================================================
-- Purpose: Enable direct project→ads relationship for simplified extension UX
-- Context: Extension needs to show ads per Lovable project without requiring
--          user authentication or campaign navigation
-- ============================================================================

-- Add lovable_project_id column to ads table
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS lovable_project_id TEXT;

-- Create index for fast project-based queries
CREATE INDEX IF NOT EXISTS idx_ads_lovable_project_id 
  ON ads(lovable_project_id) 
  WHERE lovable_project_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN ads.lovable_project_id IS 
  'Lovable project ID from URL (e.g., lovable.dev/projects/abc123). Enables direct project→ads queries in extension.';

-- ============================================================================
-- Update RLS Policies to Allow Project-Based Access
-- ============================================================================
-- NOTE: Existing campaign-based policies remain unchanged
-- Adding additional policy for extension context

-- Allow SELECT by lovable_project_id for authenticated users
-- This enables the extension dashboard to fetch ads by project
CREATE POLICY IF NOT EXISTS "Users can select ads by Lovable project ID"
  ON ads FOR SELECT
  TO authenticated
  USING (
    -- Either user owns the campaign (existing logic)
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = ads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
    -- OR user has linked this Lovable project
    OR EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = ads.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    )
  );

-- Allow INSERT for ads with lovable_project_id
-- Users can create ads for Lovable projects they've linked
CREATE POLICY IF NOT EXISTS "Users can insert ads for linked Lovable projects"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Either user owns the campaign (existing logic)
    (campaign_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = ads.campaign_id 
      AND campaigns.user_id = auth.uid()
    ))
    -- OR user has linked this Lovable project
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = ads.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  );

-- Allow UPDATE for ads with lovable_project_id
CREATE POLICY IF NOT EXISTS "Users can update ads for linked Lovable projects"
  ON ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = ads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = ads.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = ads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = ads.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    )
  );

-- ============================================================================
-- Verification Queries (Run separately to verify migration)
-- ============================================================================

/*
-- Check column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ads' AND column_name = 'lovable_project_id';
-- Expected: lovable_project_id | text | YES | NULL

-- Check index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'ads' AND indexname = 'idx_ads_lovable_project_id';

-- List all policies on ads table (should now have project-based policies)
SELECT policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'ads'
ORDER BY cmd, policyname;

-- Test query: Get ads for a Lovable project
-- SELECT id, name, lovable_project_id, status
-- FROM ads
-- WHERE lovable_project_id = 'your-project-id-here'
-- ORDER BY created_at DESC;
*/

