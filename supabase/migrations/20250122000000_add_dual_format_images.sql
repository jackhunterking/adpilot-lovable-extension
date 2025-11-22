-- Add Dual Format Image Support for Lovable Extension
-- Purpose: Support both square (1080x1080) and vertical (1080x1920) image formats
-- References:
--   - Lovable Extension: Single mockup with format toggle
--   - Ad Creatives Table: Add format-specific columns

-- ============================================================================
-- 1. Add Dual Format Columns to ad_creatives Table
-- ============================================================================

-- Rename existing image_url to image_url_square for clarity
ALTER TABLE ad_creatives
  RENAME COLUMN image_url TO image_url_square;

-- Add vertical format URL column
ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS image_url_vertical text;

-- Add selected format column (tracks user's format preference)
ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS selected_format text DEFAULT 'square' 
    CHECK (selected_format IN ('square', 'vertical'));

-- Add metadata column for format-specific data
ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS format_metadata jsonb DEFAULT '{}'::jsonb;

-- ============================================================================
-- 2. Update Lovable Image Imports Table
-- ============================================================================

-- Add columns to track both format URLs during import
ALTER TABLE lovable_image_imports
  ADD COLUMN IF NOT EXISTS adpilot_image_url_square text;

ALTER TABLE lovable_image_imports
  ADD COLUMN IF NOT EXISTS adpilot_image_url_vertical text;

-- Update constraint: at least one format URL must be provided
ALTER TABLE lovable_image_imports
  ADD CONSTRAINT check_at_least_one_format 
    CHECK (
      adpilot_image_url IS NOT NULL OR 
      adpilot_image_url_square IS NOT NULL OR 
      adpilot_image_url_vertical IS NOT NULL
    );

-- ============================================================================
-- 3. Add Indexes for Performance
-- ============================================================================

-- Index for querying by selected format
CREATE INDEX IF NOT EXISTS idx_ad_creatives_selected_format 
  ON ad_creatives(selected_format);

-- GIN index for format metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_ad_creatives_format_metadata 
  ON ad_creatives USING GIN (format_metadata);

-- ============================================================================
-- 4. Add Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN ad_creatives.image_url_square IS 
  'Square format image URL (1080x1080) - standard feed format';

COMMENT ON COLUMN ad_creatives.image_url_vertical IS 
  'Vertical format image URL (1080x1920) - stories/reels format';

COMMENT ON COLUMN ad_creatives.selected_format IS 
  'User''s selected format preference: square or vertical (Lovable extension)';

COMMENT ON COLUMN ad_creatives.format_metadata IS 
  'Additional format-specific metadata: dimensions, aspect_ratio, generation_params';

COMMENT ON COLUMN lovable_image_imports.adpilot_image_url_square IS 
  'Imported square format image URL (1080x1080)';

COMMENT ON COLUMN lovable_image_imports.adpilot_image_url_vertical IS 
  'Imported vertical format image URL (1080x1920)';

-- ============================================================================
-- 5. Data Migration (Backfill)
-- ============================================================================

-- Backfill existing records: copy adpilot_image_url to square format
UPDATE lovable_image_imports
SET adpilot_image_url_square = adpilot_image_url
WHERE adpilot_image_url_square IS NULL AND adpilot_image_url IS NOT NULL;

-- Note: image_url has already been renamed to image_url_square above
-- No additional backfill needed for ad_creatives as the rename handles it

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'ad_creatives' 
--   AND column_name IN ('image_url_square', 'image_url_vertical', 'selected_format')
-- ORDER BY column_name;

