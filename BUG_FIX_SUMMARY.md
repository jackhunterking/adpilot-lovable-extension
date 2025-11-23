# Bug Fix: Ads Not Showing in Ads Tab

## 🐛 Problem
When clicking the "Ads" tab in the Lovable extension, users saw "Create Your First Ad" empty state even though:
- Ads existed in the `ads` database table ✅
- Campaigns existed in the `campaigns` database table ✅  
- Lovable project was linked in `lovable_project_links` table ✅

## 🔍 Root Cause

**Database Schema vs Query Mismatch**

The migration `20251123000000_link_campaigns_to_projects.sql` added a direct **column** to store the Lovable project ID:

```sql
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS lovable_project_id TEXT;
```

However, several services were incorrectly querying for this value in the **metadata JSON field** instead:

```typescript
// ❌ WRONG - Looking in JSON metadata field
.eq('metadata->>lovable_project_id', lovableProjectId)

// ✅ CORRECT - Looking at direct column
.eq('lovable_project_id', lovableProjectId)
```

## 📊 Data Flow Diagram

```
User Clicks "Ads" Tab
  ↓
WorkspaceOrchestrator gets campaignId
  ↓
useCampaignAds(campaignId) hook fetches ads
  ↓
GET /api/v1/ads?campaignId=xxx
  ↓
Returns ads for that campaign ✅
  ↓
BUT... how does campaignId get set in the first place?
  ↓
Campaign loaded via LovableSyncService.loadCampaignData()
  ↓
Query: campaigns WHERE lovable_project_id = 'xxx' ❌ THIS WAS BROKEN
  ↓
No campaigns found → No campaignId → No ads fetched
  ↓
Empty state shown even though ads exist in database
```

## 🛠️ Files Fixed

### 1. `lib/services/lovable/lovable-sync-service-impl.ts`
**Line 317** - `loadCampaignData()` method

**Before:**
```typescript
const { data: campaigns, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('*')
  .eq('user_id', userId)
  .eq('metadata->>lovable_project_id', lovableProjectId)  // ❌ Wrong!
  .order('updated_at', { ascending: false });
```

**After:**
```typescript
const { data: campaigns, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('*')
  .eq('user_id', userId)
  .eq('lovable_project_id', lovableProjectId)  // ✅ Fixed!
  .order('updated_at', { ascending: false });
```

### 2. `lib/services/lovable/lovable-conversion-service-impl.ts`
**Line 55** - `recordConversion()` method

**Before:**
```typescript
const { data: campaign, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('id, user_id')
  .eq('metadata->>lovable_project_id', input.lovableProjectId)  // ❌
  .eq('status', 'active')
```

**After:**
```typescript
const { data: campaign, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('id, user_id')
  .eq('lovable_project_id', input.lovableProjectId)  // ✅
  .eq('status', 'active')
```

### 3. `lib/services/lovable/lovable-project-service-impl.ts`
**Line 279** - `getProjectStats()` method

**Before:**
```typescript
const { data: campaigns, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('id, status, created_at')
  .eq('user_id', userId)
  .eq('metadata->>lovable_project_id', lovableProjectId);  // ❌
```

**After:**
```typescript
const { data: campaigns, error: campaignError } = await this.supabase
  .from('campaigns')
  .select('id, status, created_at')
  .eq('user_id', userId)
  .eq('lovable_project_id', lovableProjectId);  // ✅
```

### 4. `components/workspace/modes/overview-mode.tsx`
**Line 35** - Reading lovable_project_id from campaign object

**Before:**
```typescript
const lovableProjectId = campaign?.metadata?.lovable_project_id || props.campaignId;  // ❌
```

**After:**
```typescript
const lovableProjectId = campaign?.lovable_project_id || props.campaignId;  // ✅
```

## ✅ Verification

### Database Schema (Correct)
```sql
-- campaigns table has direct column
lovable_project_id TEXT

-- With unique constraint
CREATE UNIQUE INDEX idx_campaigns_lovable_project_unique
  ON campaigns(lovable_project_id)
  WHERE lovable_project_id IS NOT NULL;
```

### TypeScript Types (Correct)
```typescript
// lib/supabase/database.types.ts
campaigns: {
  Row: {
    lovable_project_id: string | null  // ✅ Column defined
    metadata: Json | null              // Separate field
    // ... other columns
  }
}
```

### Campaign Creation (Correct)
```typescript
// lib/services/lovable/campaign-manager.ts
// Uses database function that correctly sets lovable_project_id column
const { data, error } = await this.supabase.rpc(
  'get_or_create_campaign_for_project',
  { p_lovable_project_id: lovableProjectId }
);
```

## 🧪 Testing

### Before Fix
1. User has ads in database ✅
2. User clicks "Ads" tab
3. Campaign query returns empty (looking in wrong field) ❌
4. No campaignId set ❌
5. Ads query never runs or runs with null campaignId ❌
6. Empty state shows "Create Your First Ad" ❌

### After Fix
1. User has ads in database ✅
2. User clicks "Ads" tab
3. Campaign query finds campaigns (correct column) ✅
4. Campaign ID is set ✅
5. Ads query fetches ads for that campaign ✅
6. Ads grid displays all ads ✅

## 📝 How to Test

1. **Verify Database Has Data:**
   ```sql
   -- Check if lovable_project_links exist
   SELECT * FROM lovable_project_links WHERE status = 'active';
   
   -- Check if campaigns have lovable_project_id set
   SELECT id, name, lovable_project_id FROM campaigns 
   WHERE lovable_project_id IS NOT NULL;
   
   -- Check if ads exist
   SELECT id, name, campaign_id, status FROM ads;
   ```

2. **Test in UI:**
   - Open Lovable editor
   - Click AdPilot extension icon
   - Click "Ads" tab
   - **Expected:** Should see grid of existing ads (not empty state)
   - **Verify:** Each ad card shows name, status, and actions

3. **Create New Ad:**
   - Click "Create Ad" button
   - Fill in ad details
   - Save as draft
   - Navigate back to Ads tab
   - **Expected:** New draft ad appears in grid immediately

## 🚀 Impact

### What's Fixed
- ✅ Ads now show in Ads tab when they exist
- ✅ Campaign-to-project linking works correctly
- ✅ Stats and metrics load for correct projects
- ✅ Conversion tracking finds correct campaigns

### What's Not Affected
- ✅ Ad creation still works (uses correct column)
- ✅ Campaign creation still works (database function correct)
- ✅ No data migration needed (column already exists)
- ✅ No breaking changes (only fixes bug)

## 🔄 Related Changes

This bug fix complements the recent refresh ads fix (commit 3362359):
- **Previous fix:** Ads list refreshes after save ✅
- **This fix:** Ads list actually loads campaigns correctly ✅
- **Combined result:** Complete end-to-end functionality! 🎉

## 📚 References

- Migration: `supabase/migrations/20251123000000_link_campaigns_to_projects.sql`
- Database Function: `get_or_create_campaign_for_project()`
- Campaign Manager: `lib/services/lovable/campaign-manager.ts`
- Sync Service: `lib/services/lovable/lovable-sync-service-impl.ts`

## 🎯 Conclusion

The system was architecturally correct (proper database schema, function, indexes) but had a query mismatch bug. Services were looking for the project ID in the wrong place (JSON metadata instead of direct column). Fixing all query locations resolves the issue completely.

**Status:** ✅ Fixed and pushed to `feature/google-oauth-fix` branch
**Commits:** 
- `3be59d3` - Fix query mismatch for lovable_project_id
- `3362359` - Refresh ads list after saving drafts

