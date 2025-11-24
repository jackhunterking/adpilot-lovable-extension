# Supabase Storage Bucket Setup

## ✅ USING EXISTING BUCKET

We are using the existing `ad-creatives` bucket which is already configured correctly with:
- Public access (for Meta API)
- 10MB file size limit
- Allowed image types (PNG, JPEG, WebP)
- Existing RLS policies

## Bucket Configuration

The existing `ad-creatives` bucket has the following configuration:

- **Bucket name**: `ad-creatives` ✅
- **Public bucket**: YES ✅ (required for Meta API to access images)
- **File size limit**: 10MB ✅
- **Allowed MIME types**: ✅
  - `image/png`
  - `image/jpeg`
  - `image/jpg`
  - `image/webp`
- **Existing policies**: 3 policies already configured ✅

## Existing RLS Policies

The `ad-creatives` bucket should already have these RLS (Row Level Security) policies configured:

#### Policy 1: Upload to Own Folder
- **Policy name**: `Users can upload images to own folder`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(
  bucket_id = 'ad-creatives' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

#### Policy 2: Update Own Images
- **Policy name**: `Users can update own images`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(
  bucket_id = 'ad-creatives' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```
- **WITH CHECK expression**:
```sql
(
  bucket_id = 'ad-creatives' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

#### Policy 3: Delete Own Images
- **Policy name**: `Users can delete own images`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(
  bucket_id = 'ad-creatives' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

#### Policy 4: Public Read Access
- **Policy name**: `Public read access for ad images`
- **Operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```sql
bucket_id = 'ad-creatives'
```

## Folder Structure

Images will be stored in this structure:
```
ad-creatives/
  {user_id}/
    {campaign_id}/
      {ad_id}/
        {timestamp}-{random}.{ext}
```

This ensures:
- User isolation (users can only access their own images)
- Campaign organization
- Ad-specific folders
- Unique filenames (no conflicts)

## Verification

To verify the bucket is working:

1. Go to Storage → ad-creatives ✅ (already exists)
2. Check that it has 3 policies configured ✅
3. Test uploading via the application
4. Test the API endpoint: `POST /api/v1/ads/images/upload`

## Alternative: Programmatic Setup

If you prefer to set this up via code, you can use the Supabase Management API:

```typescript
// This requires SUPABASE_SERVICE_ROLE_KEY
// NOT NEEDED - Using existing ad-creatives bucket
const { data, error } = await supabaseAdmin
  .storage
  .createBucket('ad-creatives', {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  })
```

However, RLS policies still need to be set up via the dashboard or SQL.

