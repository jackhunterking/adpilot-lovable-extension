-- ============================================================================
-- Link Campaigns to Lovable Projects Migration
-- ============================================================================
-- Purpose: Add lovable_project_id to campaigns table for one-to-one mapping
-- Context: Each Lovable project gets exactly one campaign (for now)
-- References: campaign.plan.md, lovable_integration.sql
-- ============================================================================

-- Add lovable_project_id column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS lovable_project_id TEXT;

-- Create index for fast project-based lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_lovable_project_id 
  ON campaigns(lovable_project_id) 
  WHERE lovable_project_id IS NOT NULL;

-- Add unique constraint: one campaign per Lovable project (for now)
-- This enforces the business rule that each project has exactly one campaign
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_lovable_project_unique
  ON campaigns(lovable_project_id)
  WHERE lovable_project_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN campaigns.lovable_project_id IS 
  'Lovable project ID from URL (e.g., lovable.dev/projects/abc123). One campaign per project.';

-- ============================================================================
-- Update RLS Policies for Campaigns Table
-- ============================================================================

-- Drop existing basic policies if they exist (we'll recreate with project support)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

-- SELECT: Users can view campaigns they own OR campaigns for Lovable projects they've linked
CREATE POLICY "Users can view own campaigns or linked project campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    -- Either user owns the campaign directly
    user_id = auth.uid()
    -- OR user has linked this Lovable project
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = campaigns.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  );

-- INSERT: Users can create campaigns for themselves OR for Lovable projects they've linked
CREATE POLICY "Users can create own campaigns or for linked projects"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Either user owns the campaign directly
    user_id = auth.uid()
    -- OR user has linked this Lovable project
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = campaigns.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  );

-- UPDATE: Users can update campaigns they own OR campaigns for linked projects
CREATE POLICY "Users can update own campaigns or linked project campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = campaigns.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = campaigns.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  );

-- DELETE: Users can delete campaigns they own OR campaigns for linked projects
CREATE POLICY "Users can delete own campaigns or linked project campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (lovable_project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lovable_project_links
      WHERE lovable_project_links.lovable_project_id = campaigns.lovable_project_id
      AND lovable_project_links.user_id = auth.uid()
      AND lovable_project_links.status = 'active'
    ))
  );

-- ============================================================================
-- Helper Function: Get or Create Campaign for Lovable Project
-- ============================================================================

-- Function to get existing campaign or create new one for a Lovable project
CREATE OR REPLACE FUNCTION get_or_create_campaign_for_project(
  p_user_id UUID,
  p_lovable_project_id TEXT,
  p_campaign_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  was_created BOOLEAN
) AS $$
DECLARE
  v_campaign_id UUID;
  v_campaign_name TEXT;
  v_was_created BOOLEAN := false;
BEGIN
  -- Check if user has linked this project
  IF NOT EXISTS (
    SELECT 1 FROM lovable_project_links
    WHERE lovable_project_id = p_lovable_project_id
    AND user_id = p_user_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User has not linked this Lovable project';
  END IF;

  -- Try to find existing campaign
  SELECT id, name INTO v_campaign_id, v_campaign_name
  FROM campaigns
  WHERE lovable_project_id = p_lovable_project_id
  AND user_id = p_user_id
  LIMIT 1;

  -- If no campaign exists, create one
  IF v_campaign_id IS NULL THEN
    -- Generate campaign name
    v_campaign_name := COALESCE(
      p_campaign_name,
      'Campaign for project ' || p_lovable_project_id
    );

    -- Insert new campaign
    INSERT INTO campaigns (
      user_id,
      name,
      status,
      lovable_project_id,
      currency_code
    ) VALUES (
      p_user_id,
      v_campaign_name,
      'draft',
      p_lovable_project_id,
      'USD'
    )
    RETURNING id INTO v_campaign_id;
    
    v_was_created := true;
  END IF;

  -- Return result
  RETURN QUERY SELECT v_campaign_id, v_campaign_name, v_was_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION get_or_create_campaign_for_project(UUID, TEXT, TEXT) IS 
  'Get existing campaign for Lovable project or create new one if none exists. Enforces project linking.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_campaign_for_project(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- Verification Queries (Run separately to verify migration)
-- ============================================================================

/*
-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND column_name = 'lovable_project_id';

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'campaigns' 
AND indexname LIKE '%lovable_project%';

-- Verify RLS policies exist
SELECT policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'campaigns'
ORDER BY cmd, policyname;

-- Test helper function (replace with real user_id and project_id)
SELECT * FROM get_or_create_campaign_for_project(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test-project-id'
);
*/

