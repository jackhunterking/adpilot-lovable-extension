# Testing Guide - Campaign-Project Integration

## ✅ What Was Completed

All backend and frontend code has been implemented and pushed to git:

### Backend (Database & API)
- ✅ Migration applied to production Supabase
- ✅ `lovable_project_id` column added to campaigns and ads tables
- ✅ RLS policies configured for project-based access
- ✅ `get_or_create_campaign_for_project()` database function deployed
- ✅ `LovableCampaignManager` service created
- ✅ Ads API updated to support `lovableProjectId` parameter

### Frontend (Chrome Extension & Web App)
- ✅ Auto-linking logic added to AdBuilder component
- ✅ `use-campaign-operations` hook updated to support both flows
- ✅ Build tested and passing
- ✅ All changes committed and pushed to `feature/google-oauth-fix` branch

## 🧪 Testing Steps

### Test 1: Auto-Linking Verification

1. **Open Chrome DevTools Console**
   - Open a Lovable project in Chrome
   - Open DevTools (F12 or Cmd+Opt+I)
   - Go to Console tab

2. **Open AdPilot Extension**
   - Click the AdPilot extension button
   - Click "Create Ad"
   - Watch console logs

3. **Expected Console Output:**
   ```
   [CREATE-AD] Page component mounting
   [CREATE-AD] Getting Lovable context
   [CREATE-AD] Rendering with projectId: abc123...
   [AD-BUILDER] Component mounting with projectId: abc123...
   [AdBuilder] Lovable project detected, initializing...
   [AdBuilder] Auto-linking Lovable project: abc123...
   [AdBuilder] ✅ Project linked successfully
   [AdBuilder] Ensuring campaign...
   [AdBuilder] Creating new campaign: Lovable - abc123...
   [AdBuilder] ✅ Campaign created: uuid-here
   ```

4. **Verify in Database:**
   ```sql
   -- Check project was linked
   SELECT * FROM lovable_project_links 
   WHERE lovable_project_id LIKE '%abc123%';
   
   -- Check campaign was created
   SELECT id, name, lovable_project_id, user_id 
   FROM campaigns 
   WHERE lovable_project_id LIKE '%abc123%';
   ```

### Test 2: Ad Creation Flow

1. **Complete the Ad Builder Steps**
   - Fill in "Get Started" (product context)
   - Add creative & copy
   - Select target location
   - Choose target audience
   - Set budget & schedule

2. **Save as Draft**
   - Click "Save as Draft" button
   - Watch console for ad creation logs

3. **Expected Console Output:**
   ```
   [AdBuilder] Saving draft: { draft, campaignId: uuid, lovableProjectId: abc123 }
   [AdBuilder] Created draft ad: ad-uuid-here
   ```

4. **Verify in Database:**
   ```sql
   -- Check ad was created with correct linkage
   SELECT id, name, campaign_id, lovable_project_id, status
   FROM ads 
   WHERE lovable_project_id LIKE '%abc123%';
   
   -- Verify campaign relationship
   SELECT 
     a.id as ad_id,
     a.name as ad_name,
     c.id as campaign_id,
     c.name as campaign_name,
     c.lovable_project_id
   FROM ads a
   JOIN campaigns c ON c.id = a.campaign_id
   WHERE a.lovable_project_id LIKE '%abc123%';
   ```

### Test 3: Multiple Ads Same Project

1. **Create Another Ad**
   - In the same Lovable project, click "Create Ad" again
   - Complete the flow

2. **Expected Behavior:**
   - Should use the SAME campaign (not create a new one)
   - Console should show: "Found existing campaign ID"

3. **Verify in Database:**
   ```sql
   -- Should see multiple ads with same campaign_id
   SELECT 
     a.id,
     a.name,
     a.campaign_id,
     c.name as campaign_name
   FROM ads a
   JOIN campaigns c ON c.id = a.campaign_id
   WHERE a.lovable_project_id LIKE '%abc123%'
   ORDER BY a.created_at;
   ```

### Test 4: Different Project

1. **Open Different Lovable Project**
   - Navigate to a different project in Lovable
   - Open AdPilot extension
   - Click "Create Ad"

2. **Expected Behavior:**
   - Should link the NEW project
   - Should create a NEW campaign (different from first project)
   - Each project gets its own campaign

3. **Verify in Database:**
   ```sql
   -- Should see 2 different projects, 2 different campaigns
   SELECT 
     lpl.lovable_project_id,
     c.id as campaign_id,
     c.name as campaign_name,
     COUNT(a.id) as ad_count
   FROM lovable_project_links lpl
   LEFT JOIN campaigns c ON c.lovable_project_id = lpl.lovable_project_id
   LEFT JOIN ads a ON a.campaign_id = c.id
   WHERE lpl.user_id = 'your-user-id'
   GROUP BY lpl.lovable_project_id, c.id, c.name;
   ```

## 🔍 Troubleshooting

### Issue: "Failed to link Lovable project"

**Possible Causes:**
- User not authenticated
- Network error

**Solution:**
1. Check browser console for error details
2. Verify user is logged in to AdPilot
3. Check Network tab in DevTools for failed requests
4. Try refreshing the page

### Issue: "Failed to create campaign"

**Possible Causes:**
- Project not linked
- Database error
- RLS policy blocking request

**Solution:**
1. Check if project was linked successfully (query `lovable_project_links`)
2. Check Supabase logs for errors
3. Verify RLS policies allow campaign creation

### Issue: Campaign created but not showing

**Possible Cause:**
- Campaign context not updating

**Solution:**
1. Check sessionStorage for `lovable_campaign_id`
2. Refresh the page
3. Check console for campaign load errors

### Issue: Multiple campaigns for same project

**Should Not Happen** (unique constraint prevents this)

**If it does:**
1. Check migration was applied: `idx_campaigns_lovable_project_unique`
2. Verify constraint in database:
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'campaigns' 
   AND indexname LIKE '%lovable_project%';
   ```

## 📊 Database Queries for Verification

### Check All Your Projects
```sql
SELECT 
  lpl.lovable_project_id,
  lpl.status as link_status,
  lpl.created_at as linked_at,
  c.id as campaign_id,
  c.name as campaign_name,
  c.status as campaign_status,
  COUNT(a.id) as total_ads
FROM lovable_project_links lpl
LEFT JOIN campaigns c ON c.lovable_project_id = lpl.lovable_project_id AND c.user_id = lpl.user_id
LEFT JOIN ads a ON a.campaign_id = c.id
WHERE lpl.user_id = auth.uid()
GROUP BY lpl.lovable_project_id, lpl.status, lpl.created_at, c.id, c.name, c.status
ORDER BY lpl.created_at DESC;
```

### Check Campaign Auto-Creation Function
```sql
-- Test the function (replace with your actual IDs)
SELECT * FROM get_or_create_campaign_for_project(
  'your-user-id'::uuid,
  'test-project-123',
  NULL  -- Let it auto-generate name
);
```

### Verify RLS Policies
```sql
-- Check campaigns policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'campaigns' 
AND schemaname = 'public'
ORDER BY cmd;

-- Check ads policies  
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ads' 
AND schemaname = 'public'
ORDER BY cmd;
```

## ✅ Success Criteria

You know everything is working when:

1. ✅ Opening extension in Lovable shows console logs for auto-linking
2. ✅ Campaign is created automatically on first ad
3. ✅ Second ad in same project uses same campaign
4. ✅ Different projects get different campaigns
5. ✅ Database shows correct relationships (project → campaign → ads)
6. ✅ No console errors or warnings
7. ✅ Ads can be saved and retrieved

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Merge `feature/google-oauth-fix` branch to main
   - Deploy to production
   - Monitor logs for any issues

2. **If tests fail:**
   - Share console logs and error messages
   - Provide database query results
   - I'll help debug and fix

## 📝 Notes

- All database changes are LIVE in production (migration already applied)
- Frontend changes are in `feature/google-oauth-fix` branch
- One campaign per project is enforced by unique index
- Auto-linking happens silently in the background
- Campaign creation is also automatic (seamless UX)

---

**Status:** ✅ READY FOR TESTING
**Branch:** feature/google-oauth-fix
**Last Updated:** November 23, 2025

