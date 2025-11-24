-- Migration: Add connection types for independent Facebook Business, Page, and Instagram connections
-- Purpose: Support three separate OAuth flows instead of single combined flow
-- Impact: Allows users to connect Page/Instagram independently for posts without requiring Business connection
-- Date: 2025-01-24

-- ============================================================================
-- 1. Add connection_type column
-- ============================================================================

-- Create ENUM type for connection types
DO $$ BEGIN
  CREATE TYPE connection_type_enum AS ENUM ('business', 'facebook_page', 'instagram');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add connection_type column with default 'business' for existing rows
ALTER TABLE campaign_meta_connections 
  ADD COLUMN IF NOT EXISTS connection_type connection_type_enum DEFAULT 'business' NOT NULL;

-- Update existing rows to have connection_type = 'business'
UPDATE campaign_meta_connections 
SET connection_type = 'business' 
WHERE connection_type IS NULL;

-- ============================================================================
-- 2. Update unique constraints
-- ============================================================================

-- Drop old unique constraint (campaign_id only)
ALTER TABLE campaign_meta_connections 
  DROP CONSTRAINT IF EXISTS campaign_meta_connections_campaign_id_key;

-- Add new composite unique constraint (campaign_id + connection_type)
-- This allows three separate connections per campaign (one per type)
ALTER TABLE campaign_meta_connections 
  ADD CONSTRAINT campaign_meta_connections_campaign_connection_type_key 
  UNIQUE (campaign_id, connection_type);

-- ============================================================================
-- 3. Make business-specific columns nullable
-- ============================================================================

-- These columns are only needed for 'business' connection type
-- Page and Instagram connections won't have business/ad account data

ALTER TABLE campaign_meta_connections 
  ALTER COLUMN selected_business_id DROP NOT NULL,
  ALTER COLUMN selected_business_name DROP NOT NULL,
  ALTER COLUMN selected_ad_account_id DROP NOT NULL,
  ALTER COLUMN selected_ad_account_name DROP NOT NULL;

-- Admin role columns (already nullable, but explicitly documenting)
-- ALTER COLUMN admin_business_role - already nullable
-- ALTER COLUMN admin_ad_account_role - already nullable
-- ALTER COLUMN ad_account_currency_code - already nullable

-- ============================================================================
-- 4. Add indexes for efficient querying
-- ============================================================================

-- Index for querying by connection type
CREATE INDEX IF NOT EXISTS idx_campaign_meta_connections_type 
  ON campaign_meta_connections(campaign_id, connection_type);

-- Index for checking specific connection types exist
CREATE INDEX IF NOT EXISTS idx_campaign_meta_connections_type_status 
  ON campaign_meta_connections(campaign_id, connection_type, connection_status);

-- ============================================================================
-- 5. Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN campaign_meta_connections.connection_type IS 
  'Type of Meta connection: business (ads), facebook_page (posts), or instagram (posts)';

COMMENT ON CONSTRAINT campaign_meta_connections_campaign_connection_type_key ON campaign_meta_connections IS 
  'Allows three separate connections per campaign - one for each connection type';

-- ============================================================================
-- 6. Migration verification queries (for testing)
-- ============================================================================

/*
-- Verify migration applied correctly:

-- Check column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campaign_meta_connections' 
  AND column_name = 'connection_type';

-- Check constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'campaign_meta_connections' 
  AND constraint_name = 'campaign_meta_connections_campaign_connection_type_key';

-- Check indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'campaign_meta_connections' 
  AND indexname LIKE '%connection%type%';

-- Check existing data
SELECT campaign_id, connection_type, selected_business_id, selected_page_id, selected_ig_user_id 
FROM campaign_meta_connections 
LIMIT 5;

-- Test: Try inserting three connections for same campaign (should succeed)
-- Test: Try inserting duplicate connection type for same campaign (should fail)
*/

-- ============================================================================
-- 7. Rollback instructions (if needed)
-- ============================================================================

/*
-- To rollback this migration (DANGEROUS - will lose connection_type data):

DROP INDEX IF EXISTS idx_campaign_meta_connections_type;
DROP INDEX IF EXISTS idx_campaign_meta_connections_type_status;

ALTER TABLE campaign_meta_connections 
  DROP CONSTRAINT IF EXISTS campaign_meta_connections_campaign_connection_type_key;

ALTER TABLE campaign_meta_connections 
  DROP COLUMN IF EXISTS connection_type;

DROP TYPE IF EXISTS connection_type_enum;

-- Restore original unique constraint
ALTER TABLE campaign_meta_connections 
  ADD CONSTRAINT campaign_meta_connections_campaign_id_key 
  UNIQUE (campaign_id);
*/
