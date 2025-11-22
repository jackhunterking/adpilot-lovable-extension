# Production Testing Script

This script provides step-by-step instructions for testing the AdPilot extension with the production backend before Chrome Web Store submission.

## Prerequisites

- [ ] Production backend deployed to Vercel
- [ ] Headers verified with curl
- [ ] Extension built for production
- [ ] Chrome browser installed
- [ ] Test Lovable project available

## Test Environment Setup

### 1. Build Production Extension

```bash
# Build for production
npm run package production
```

Expected output:
```
✅ Package created: dist/adpilot-lovable-extension-v1.0.0.zip
```

### 2. Extract Extension

```bash
cd dist
unzip adpilot-lovable-extension-v1.0.0.zip -d test-extension
cd ..
```

### 3. Load Extension in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select `dist/test-extension` directory
6. Extension should appear in list

**Verify:**
- ✅ Extension icon shows in extensions list
- ✅ Version shows as 1.0.0
- ✅ No errors in console

## Core Functionality Tests

### Test 1: Extension Loads in Lovable

**Steps:**
1. Open https://lovable.dev
2. Sign in to Lovable (if not already)
3. Open any project or create new one
4. Wait for project to load

**Expected:**
- ✅ Grow button appears in navigation (last position)
- ✅ Button has megaphone icon
- ✅ Button styled consistently with other nav buttons
- ✅ No console errors

**Browser Console Check:**
```javascript
// Should see these messages
[AdPilot] Content script loaded - v0.2.0
[AdPilot] Lovable editor detected, initializing...
[AdPilot] ✓ Found navigation UL
[AdPilot] ✓ Injected as last navigation button
[AdPilot] Using server URL: https://www.adpilot.studio/lovable
[AdPilot] ✅ Initialization complete
```

**Debug:**
If button doesn't appear:
```javascript
// Check content script loaded
console.log(chrome.runtime.getManifest());

// Manually check for button
document.getElementById('adpilot-grow-button');
```

### Test 2: Iframe Connection

**Steps:**
1. Click the Grow button

**Expected:**
- ✅ URL updates to include `?view=grow`
- ✅ Iframe loads from `https://www.adpilot.studio/lovable`
- ✅ No "refused to connect" errors
- ✅ No X-Frame-Options errors
- ✅ Content displays in iframe

**Browser Console Check:**
```javascript
// Should see
[AdPilot] Navigating to Grow view
[AdPilot] ✓ Created iframe with src: https://www.adpilot.studio/lovable
[AdPilot] ✅ Iframe loaded from https://www.adpilot.studio/lovable
[AdPilot] Sending project context: {type: 'ADPILOT_PROJECT_CONTEXT', ...}
```

**Network Tab Check:**
- ✅ Request to `https://www.adpilot.studio/lovable` status 200
- ✅ No 401 or 403 errors
- ✅ Response headers include CSP with frame-ancestors

**Debug:**
If iframe fails to load:
```bash
# Verify headers
curl -I https://www.adpilot.studio/lovable

# Should NOT see
x-frame-options: deny
```

### Test 3: Project Context

**Steps:**
1. With Grow tab open, check iframe console (right-click iframe → Inspect)

**Expected:**
- ✅ Project context received
- ✅ Lovable project ID extracted correctly
- ✅ Project URL captured

**Iframe Console Check:**
```javascript
// Should receive message
{
  type: 'ADPILOT_PROJECT_CONTEXT',
  payload: {
    lovableProjectId: 'e37a122d-7619-481a-968b-44c62ab86e43',
    lovableProjectUrl: 'https://lovable.dev/projects/e37a122d-7619-481a-968b-44c62ab86e43',
    timestamp: 1732281234567
  }
}
```

### Test 4: Authentication Flow

**Steps:**
1. In Grow tab, click "Sign In" (if not signed in)
2. Select "Continue with Google"
3. Complete OAuth flow
4. Should redirect back to extension

**Expected:**
- ✅ OAuth popup opens
- ✅ Google login screen appears
- ✅ Can select account
- ✅ Redirects back to extension
- ✅ User is signed in
- ✅ UI shows user info

**API Check:**
```javascript
// Check auth token stored
chrome.storage.local.get(['supabase.auth.token'], console.log);
```

**Debug:**
- Check Network tab for auth errors
- Check Supabase Dashboard → Auth → Logs
- Verify OAuth redirect URLs in Supabase

### Test 5: API Connectivity

**Steps:**
1. After signing in, check Network tab
2. Look for API calls to `www.adpilot.studio/api/v1/*`

**Expected:**
- ✅ API calls return 200 status
- ✅ No 401 Unauthorized errors
- ✅ No 403 Forbidden errors
- ✅ No CORS errors
- ✅ Data loads correctly

**Common Endpoints to Check:**
- `/api/v1/campaigns` - List campaigns
- `/api/v1/campaigns/[id]` - Get campaign
- `/api/v1/ads` - List ads
- `/api/v1/meta/accounts` - Meta accounts

**Debug:**
If seeing 401 errors:
1. Check authentication completed
2. Verify token in storage
3. Check Supabase RLS policies
4. Check API middleware

### Test 6: Campaign Creation

**Steps:**
1. Click "Create Campaign"
2. Enter campaign name: "Production Test Campaign"
3. Select goal type (e.g., "Leads")
4. Click "Create"

**Expected:**
- ✅ Campaign created successfully
- ✅ Success message displays
- ✅ Redirects to campaign dashboard
- ✅ Campaign appears in list
- ✅ No errors in console

**Database Check:**
Go to Supabase Dashboard → Table Editor → campaigns
- ✅ New campaign row exists
- ✅ `user_id` matches signed-in user
- ✅ `status` is 'draft'
- ✅ Timestamps populated

### Test 7: Navigation Between Tabs

**Steps:**
1. With Grow tab open, click "Code" tab
2. Then click "Grow" tab again
3. Repeat with "Cloud", "Analytics", etc.

**Expected:**
- ✅ Clicking other tabs hides Grow panel
- ✅ Clicking Grow tab shows panel again
- ✅ State preserved between switches
- ✅ No duplicate panels created
- ✅ No memory leaks

**Console Check:**
```javascript
[AdPilot] Lovable navigation button clicked, hiding Grow
[AdPilot] Hiding Grow panel
[AdPilot] ✓ Removed iframe from DOM
```

### Test 8: Page Refresh & SPA Navigation

**Steps:**
1. Refresh page with `?view=grow` in URL
2. Navigate within Lovable project
3. Switch between different Lovable projects

**Expected:**
- ✅ Grow button reappears after refresh
- ✅ View parameter preserved if present
- ✅ Button survives SPA navigation
- ✅ No duplicate buttons
- ✅ Extension reloads correctly

**Console Check:**
```javascript
[AdPilot] 🔄 URL changed: https://lovable.dev/projects/...
[AdPilot] Button missing after navigation, re-initializing...
[AdPilot] ✅ Initialization complete
```

## Security Tests

### Test 9: Origin Validation

**Steps:**
1. Open browser console
2. Try to send message from different origin

```javascript
// This should be rejected
window.postMessage({
  type: 'ADPILOT_TRIGGER_AI',
  payload: { prompt: 'test' }
}, '*');
```

**Expected:**
- ✅ Message rejected
- ✅ Warning in console: "Rejected message from unauthorized origin"
- ✅ No action taken

### Test 10: RLS Enforcement

**Steps:**
1. Sign in as User A
2. Create campaign
3. Note campaign ID
4. Sign out
5. Sign in as User B (different Google account)
6. Try to access User A's campaign directly

**Expected:**
- ✅ User B cannot see User A's campaigns
- ✅ Direct access returns 403 or 404
- ✅ RLS policies enforcing isolation

**API Test:**
```bash
# Try to access another user's campaign (should fail)
curl -H "Authorization: Bearer <user-b-token>" \
  https://www.adpilot.studio/api/v1/campaigns/<user-a-campaign-id>

# Should return 403 Forbidden
```

## Performance Tests

### Test 11: Load Time

**Steps:**
1. Open DevTools → Performance
2. Start recording
3. Click Grow button
4. Stop recording when iframe loaded

**Expected:**
- ✅ Total load time < 3 seconds
- ✅ TTI (Time to Interactive) < 5 seconds
- ✅ No long tasks blocking main thread
- ✅ Smooth animation

### Test 12: Memory Usage

**Steps:**
1. Open DevTools → Memory
2. Take heap snapshot
3. Navigate between tabs 10 times
4. Take another heap snapshot
5. Compare

**Expected:**
- ✅ Memory usage stable (no significant growth)
- ✅ No detached DOM trees
- ✅ Event listeners cleaned up
- ✅ No memory leaks

## Browser Compatibility Tests

### Test 13: Chrome (Latest)

- [ ] Extension installs
- [ ] All features work
- [ ] No console errors
- [ ] Version: _______

### Test 14: Edge (Latest)

- [ ] Extension installs
- [ ] All features work
- [ ] No console errors
- [ ] Version: _______

### Test 15: Brave (Latest)

- [ ] Extension installs
- [ ] All features work
- [ ] No console errors
- [ ] Version: _______

## Error Handling Tests

### Test 16: Network Failure

**Steps:**
1. Open DevTools → Network
2. Enable "Offline" mode
3. Try to create campaign

**Expected:**
- ✅ Error message displays
- ✅ Message is user-friendly
- ✅ Suggests checking connection
- ✅ No crash or broken state

### Test 17: API Error

**Steps:**
1. Trigger API error (e.g., invalid data)

**Expected:**
- ✅ Error caught gracefully
- ✅ User-friendly error message
- ✅ Can retry operation
- ✅ No console errors
- ✅ State remains consistent

## Sign-Off

### Production Testing Complete

**Tested by:** ___________________________

**Date:** ___________________________

**Version:** 1.0.0

**Test Results:**
- [ ] All core functionality tests passed
- [ ] All security tests passed
- [ ] All performance tests passed
- [ ] All browser compatibility tests passed
- [ ] All error handling tests passed
- [ ] No critical issues found
- [ ] Minor issues documented below

**Issues Found:**

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |

**Recommendations:**
- 

**Approval:**
- [ ] Ready for Chrome Web Store submission

---

## Quick Test Script

For rapid testing, run this abbreviated version:

```bash
# 1. Load extension
# 2. Open Lovable project
# 3. Quick checks:

# ✅ Grow button appears
# ✅ Click button → iframe loads
# ✅ No X-Frame-Options error
# ✅ Sign in works
# ✅ Create campaign works
# ✅ Navigate between tabs works
# ✅ No console errors

# If all pass → Ready for submission
```

