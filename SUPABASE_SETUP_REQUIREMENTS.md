# Supabase Setup Requirements for Ad Image Feature

⚠️ **BACKEND OPERATIONS REQUIRED**

This document outlines the Supabase configuration needed for the new Ad Image feature with prompt input and auto-sync.

## Storage Buckets

### 1. `ad-context-images` Bucket (Temporary Storage)

**Purpose**: Store user-uploaded context/reference images temporarily

**Configuration**:
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-context-images', 'ad-context-images', true);
```

**Lifecycle Policy**: Auto-delete files after 7 days
```sql
-- Add lifecycle configuration (if supported)
-- Otherwise, create a cron job to clean up old files
```

**RLS Policies**:
```sql
-- Allow users to upload their own images
CREATE POLICY "Users can upload context images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-context-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own images
CREATE POLICY "Users can read own context images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own context images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. `ad-creatives` Bucket (Permanent Storage)

**Purpose**: Store imported/generated ad images permanently

**Configuration**:
```sql
-- Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;
```

**RLS Policies**:
```sql
-- Allow users to upload creatives via API
CREATE POLICY "Users can upload creatives"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-creatives'
  AND auth.role() = 'authenticated'
);

-- Anyone can read public creatives
CREATE POLICY "Public read for creatives"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-creatives');

-- Users can delete their own creatives (via folder structure)
CREATE POLICY "Users can delete own creatives"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-creatives'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Schema

### `ad_creatives` Table

**Verify the table supports format field**:
```sql
-- Check if format column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ad_creatives';

-- Add format column if missing
ALTER TABLE ad_creatives 
ADD COLUMN IF NOT EXISTS format VARCHAR(20);

-- Add index for format filtering
CREATE INDEX IF NOT EXISTS idx_ad_creatives_format 
ON ad_creatives(format);
```

### `lovable_image_imports` Table (Optional)

**For audit trail of imported images**:
```sql
CREATE TABLE IF NOT EXISTS lovable_image_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
  lovable_image_url TEXT NOT NULL,
  adpilot_image_url TEXT NOT NULL,
  import_status VARCHAR(20) NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE lovable_image_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imports"
ON lovable_image_imports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert imports"
ON lovable_image_imports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_lovable_imports_user ON lovable_image_imports(user_id);
CREATE INDEX idx_lovable_imports_campaign ON lovable_image_imports(campaign_id);
CREATE INDEX idx_lovable_imports_creative ON lovable_image_imports(creative_id);
```

## API Rate Limiting

**Consider adding rate limits to prevent abuse**:

```sql
-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Cleanup old rate limit records (run daily)
DELETE FROM api_rate_limits 
WHERE window_start < NOW() - INTERVAL '1 hour';
```

**Rate Limit Configuration** (in API route):
- Image uploads: 20 per hour per user
- Image imports: 50 per hour per user

## Testing Checklist

### Storage Buckets
- [ ] `ad-context-images` bucket exists
- [ ] `ad-context-images` bucket is public
- [ ] RLS policies allow user uploads
- [ ] RLS policies prevent cross-user access
- [ ] Lifecycle policy configured (7-day TTL)

### Database
- [ ] `ad_creatives` table has `format` column
- [ ] `lovable_image_imports` table exists (optional)
- [ ] RLS policies enabled on all tables
- [ ] Indexes created for performance

### API Endpoints
- [ ] `/api/v1/lovable/import-image` authenticates users
- [ ] Import API validates campaign ownership
- [ ] Import API downloads from Lovable successfully
- [ ] Import API uploads to AdPilot storage successfully
- [ ] Import API creates database records correctly

### Security
- [ ] RLS policies tested with different users
- [ ] File size limits enforced (10MB max)
- [ ] File type validation working (PNG, JPG only)
- [ ] Rate limiting prevents abuse

## Quick Setup Script

Run this in Supabase SQL Editor:

```sql
-- Create ad-context-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-context-images', 'ad-context-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create ad-creatives bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Add format column to ad_creatives
ALTER TABLE ad_creatives 
ADD COLUMN IF NOT EXISTS format VARCHAR(20);

-- Create index
CREATE INDEX IF NOT EXISTS idx_ad_creatives_format 
ON ad_creatives(format);

-- RLS for ad-context-images
CREATE POLICY "Users upload context images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'ad-context-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read context images" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete context images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS for ad-creatives
CREATE POLICY "Auth users upload creatives" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'ad-creatives'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read creatives" ON storage.objects 
FOR SELECT USING (bucket_id = 'ad-creatives');

CREATE POLICY "Users delete creatives" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'ad-creatives'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Commit
COMMIT;
```

## Monitoring

**Set up monitoring for**:
- Storage usage (alert if > 80% quota)
- Failed uploads (track error rates)
- Slow image downloads (> 5s)
- Rate limit hits (potential abuse)

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify RLS policies with `SELECT` queries
3. Test storage operations manually
4. Review API logs in Next.js console

