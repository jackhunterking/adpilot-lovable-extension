# Campaign-Project Backend Setup - Implementation Complete ✅

## Summary

Successfully implemented the backend infrastructure to automatically create and link campaigns to Lovable projects. Users can now click "Create Ad" in the Lovable extension and a campaign will be automatically created if one doesn't exist.

## What Was Implemented

### 1. Database Schema Changes ✅

**Migration**: `supabase/migrations/20251123000000_link_campaigns_to_projects.sql`

- Added `lovable_project_id` column to `campaigns` table
- Created indexes for fast lookups
- Added unique constraint: one campaign per Lovable project
- Verified deployment to production database

### 2. RLS Policies ✅

**Campaigns Table Policies**:
- ✅ SELECT: Users can view campaigns they own OR campaigns for linked projects
- ✅ INSERT: Users can create campaigns for themselves OR linked projects  
- ✅ UPDATE: Users can update own campaigns OR linked project campaigns
- ✅ DELETE: Users can delete own campaigns OR linked project campaigns

**Ads Table Policies** (already existed):
- ✅ SELECT: Users can view ads by campaign ownership OR Lovable project ID
- ✅ INSERT: Users can create ads for owned campaigns OR linked projects
- ✅ UPDATE: Users can update ads for owned campaigns OR linked projects
- ✅ DELETE: Users can delete ads from owned campaigns

### 3. Database Function ✅

**Function**: `get_or_create_campaign_for_project(user_id, lovable_project_id, campaign_name?)`

Returns:
- `campaign_id`: UUID of campaign (existing or newly created)
- `campaign_name`: Name of campaign
- `was_created`: Boolean indicating if campaign was just created

Business Logic:
- Verifies user has linked the Lovable project
- Finds existing campaign for project
- Creates new campaign if none exists (named: "Campaign for project {projectId}")
- Enforces one-campaign-per-project rule via unique index

### 4. Campaign Manager Service ✅

**File**: `lib/services/lovable/campaign-manager.ts`

**Class**: `LovableCampaignManager`

**Methods**:
- `getOrCreateCampaign(options)` - Main method to get/create campaign
- `getCampaignForProject(projectId, userId)` - Get existing campaign only
- `isProjectLinked(projectId, userId)` - Check if project is linked
- `linkProject(projectId, userId, supabaseUrl?)` - Link project to user

**Features**:
- Race condition safe (uses DB function)
- Automatic project linking verification
- Detailed logging for debugging
- Handles duplicate link attempts gracefully

### 5. Updated API Routes ✅

**File**: `app/api/v1/ads/route.ts`

**POST /api/v1/ads** - Enhanced to support two flows:

**Flow 1 - Traditional (campaignId provided)**:
```typescript
POST /api/v1/ads
{
  campaignId: "uuid",
  name: "My Ad",
  status: "draft"
}
```

**Flow 2 - Lovable Extension (lovableProjectId provided)**:
```typescript
POST /api/v1/ads
{
  lovableProjectId: "abc123",
  name: "My Ad",
  status: "draft"
}
// Campaign auto-created if needed
```

**Response**:
```typescript
{
  success: true,
  data: {
    ad: { id, name, campaign_id, lovable_project_id, ... },
    campaignId: "uuid" // Included in response
  }
}
```

### 6. TypeScript Types ✅

**Updated Files**:
- `lib/supabase/database.types.ts` - Regenerated with `lovable_project_id` fields
- `lib/services/contracts/campaign-service.interface.ts` - Added `lovable_project_id` to Campaign interface
- `lib/services/lovable/index.ts` - Exported campaign manager types

### 7. Security Verification ✅

**Verified via Supabase MCP**:
- ✅ All indexes created successfully
- ✅ RLS policies active and correct
- ✅ Helper function deployed
- ✅ lovable_project_id column exists in both campaigns and ads tables
- ✅ No critical security issues (only pre-existing warnings about function search_path)

## How to Use

### For Frontend/Extension Developers

**Scenario 1: Create ad from Lovable extension**

```typescript
// Extension injects lovableProjectId from URL
const lovableProjectId = "abc123" // From lovable.dev/projects/abc123

// Call API - campaign auto-created if needed
const response = await fetch('/api/v1/ads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lovableProjectId: lovableProjectId,
    name: "My First Ad",
    status: "draft"
  })
})

const { ad, campaignId } = await response.json()
// Campaign was auto-created and ad is linked to it
```

**Scenario 2: Use campaign manager service directly**

```typescript
import { createCampaignManager } from '@/lib/services/lovable'
import { createServerClient } from '@/lib/supabase/server'

const supabase = await createServerClient()
const campaignManager = createCampaignManager(supabase)

// Get or create campaign
const result = await campaignManager.getOrCreateCampaign({
  userId: user.id,
  lovableProjectId: "abc123",
  campaignName: "Optional custom name"
})

console.log(result)
// {
//   campaign_id: "uuid",
//   campaign_name: "Campaign for project abc123",
//   was_created: true
// }
```

### For Testing

**Test 1: Link a project**

```typescript
const campaignManager = createCampaignManager(supabase)

await campaignManager.linkProject(
  "test-project-123",
  userId,
  "https://xyz.supabase.co" // optional
)
```

**Test 2: Create ad via API**

```bash
curl -X POST https://your-domain.com/api/v1/ads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lovableProjectId": "test-project-123",
    "name": "Test Ad",
    "status": "draft"
  }'
```

**Test 3: Verify campaign was created**

```sql
-- Via Supabase SQL Editor
SELECT id, name, lovable_project_id, user_id
FROM campaigns
WHERE lovable_project_id = 'test-project-123';
```

## Database Structure

```
profiles (users)
    ↓
lovable_project_links (user → project mapping)
    ↓
campaigns (one per project, has lovable_project_id)
    ↓
ads (many per campaign, also has lovable_project_id for direct queries)
```

## Key Features

✅ **Auto-Campaign Creation**: Campaigns automatically created when user creates first ad  
✅ **One Campaign Per Project**: Enforced via unique index on campaigns.lovable_project_id  
✅ **Project Linking Required**: Users must link project before creating ads  
✅ **RLS Security**: All operations respect Row Level Security policies  
✅ **Race Condition Safe**: Database function handles concurrent requests  
✅ **Backward Compatible**: Traditional campaign flow still works  
✅ **Detailed Logging**: All operations logged for debugging  

## Files Modified/Created

### Created:
- `supabase/migrations/20251123000000_link_campaigns_to_projects.sql`
- `lib/services/lovable/campaign-manager.ts`
- `CAMPAIGN_PROJECT_SETUP_COMPLETE.md` (this file)

### Modified:
- `lib/supabase/database.types.ts` (regenerated)
- `lib/services/lovable/index.ts` (added exports)
- `lib/services/contracts/campaign-service.interface.ts` (added lovable_project_id)
- `app/api/v1/ads/route.ts` (added lovableProjectId flow)

## Next Steps

### For You (No-Code Developer):

1. **Test the flow in your Chrome extension**:
   - Open a Lovable project
   - Click "Create Ad"
   - Verify campaign is auto-created
   - Verify ad is linked to campaign

2. **Monitor logs** during testing:
   - Check browser console for `[LovableCampaignManager]` logs
   - Check API logs for `[POST /api/v1/ads]` logs

3. **If you need to manually link a project** (for testing):
   ```typescript
   // Use this in your extension or API route
   const campaignManager = createCampaignManager(supabase)
   await campaignManager.linkProject(lovableProjectId, userId)
   ```

### Optional Enhancements (Future):

- **Multiple campaigns per project**: Remove unique constraint and add campaign selection UI
- **Campaign naming**: Allow users to customize campaign names
- **Campaign templates**: Pre-configure campaigns based on project type
- **Analytics**: Track campaign creation patterns

## Support

If you encounter issues:

1. Check Supabase logs: `mcp_supabase_get_logs` with service: 'postgres'
2. Check RLS policies: See migration file for policy definitions
3. Verify project linking: Query `lovable_project_links` table
4. Check console logs: Look for `[LovableCampaignManager]` prefix

## Verification Checklist

- [x] Migration applied to production database
- [x] Database types regenerated
- [x] RLS policies verified
- [x] Campaign manager service created
- [x] API route updated
- [x] Security audit passed
- [x] All to-dos completed

**Status**: ✅ READY FOR TESTING

---

*Generated on: November 23, 2025*
*Migration Version: 20251123000000*

