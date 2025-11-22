# Staging Server Deployment Guide

This guide walks through deploying the simplified extension to staging and testing the integration.

## 📋 Pre-Deployment Checklist

### ✅ Code Changes Applied

- [x] Headers consolidated in `vercel.json` (removed from `next.config.ts`)
- [x] Content script simplified (1290 → 1125 lines)
- [x] URL configuration refactored to single async method
- [x] Logging reduced to essential messages only
- [x] Service worker adds default server configuration
- [x] `.env.example` template created

### ⚠️ Required Actions Before Testing

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel Staging

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Simplify extension configuration and fix staging headers"
   git push origin feature/google-oauth-fix
   ```

2. **Trigger Vercel deployment:**
   - Vercel will automatically detect the push
   - Monitor deployment at: https://vercel.com/dashboard
   - Wait for "Ready" status

3. **Verify deployment URL:**
   - Ensure staging is accessible: https://staging.adpilot.studio

### Step 2: Configure Environment Variables

**⚠️ BACKEND OPERATION - Set these in Vercel dashboard:**

Navigate to: **Vercel Dashboard → Project → Settings → Environment Variables**

Set for **Preview** and **Production** environments:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Meta/Facebook
NEXT_PUBLIC_FB_APP_ID=your_app_id
FB_APP_SECRET=your_app_secret
NEXT_PUBLIC_FB_GRAPH_VERSION=v24.0
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM=your_system_config
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER=your_user_config
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID=your_legacy_config

# Optional
NEXT_PUBLIC_DEBUG=false
```

**After setting variables, redeploy:**
```bash
# Trigger new deployment to pick up env vars
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### Step 3: Create Local Environment File

Create `.env.local` for local development:

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with your actual values
# Use the same values as Vercel staging environment
```

### Step 4: Reload Chrome Extension

1. Open `chrome://extensions/`
2. Find "AdPilot for Lovable"
3. Click the reload icon (↻)
4. Extension will default to staging server

### Step 5: Test Staging Integration

#### Test 1: Basic Loading

1. Navigate to any Lovable project: `https://lovable.dev/projects/xxx`
2. Open Chrome DevTools (F12) → Console tab
3. Look for initialization logs:
   ```
   [AdPilot] Content script loaded - v0.3.0
   [AdPilot] Lovable editor detected, initializing...
   [AdPilot] Using server: staging → https://staging.adpilot.studio/lovable
   [AdPilot] ✅ Grow button injected
   [AdPilot] ✅ Initialization complete
   ```

#### Test 2: Iframe Loading

1. Click the **Grow** button in Lovable navigation
2. Check console for:
   ```
   [AdPilot] ✅ Iframe loaded successfully
   ```
3. **Verify NO errors:**
   - ❌ No "401 Unauthorized" errors
   - ❌ No "X-Frame-Options" errors
   - ❌ No "Refused to display" errors

#### Test 3: Server Configuration

1. Open Console on Lovable page
2. Test server switching:
   ```javascript
   // Switch to localhost
   chrome.storage.local.set({adpilot_server: 'dev'})
   ```
3. Reload page
4. Verify console shows:
   ```
   [AdPilot] Using server: dev → http://localhost:3000/lovable
   ```
5. Click Grow button, verify iframe loads from localhost

6. Switch back to staging:
   ```javascript
   chrome.storage.local.set({adpilot_server: 'staging'})
   ```

## ✅ Success Criteria

All of these should pass:

- [ ] Extension loads without console errors
- [ ] Grow button appears in Lovable navigation
- [ ] Iframe loads from staging server successfully
- [ ] No 401 or X-Frame-Options errors
- [ ] Console shows clean initialization (5-10 logs max)
- [ ] Server switching works (dev/staging/prod)
- [ ] Project context is sent to iframe
- [ ] Less than 15 console logs during initialization

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Environment variables not set on Vercel or missing

**Fix:**
1. Check Vercel dashboard → Environment Variables
2. Ensure all required vars are set for Preview/Production
3. Redeploy after adding vars

### Issue: X-Frame-Options Blocking

**Cause:** Old deployment cached or headers not applied

**Fix:**
1. Hard refresh the iframe: Shift + Reload
2. Check `vercel.json` is deployed correctly
3. Verify CSP headers in Network tab:
   - Open DevTools → Network tab
   - Load the iframe URL directly
   - Check Response Headers for `Content-Security-Policy`
   - Should contain: `frame-ancestors 'self' https://lovable.dev https://*.lovable.dev`

### Issue: Iframe Not Loading

**Cause:** SERVER_URL not initialized or wrong server

**Fix:**
1. Check console for initialization message
2. Verify `chrome.storage.local.get(['adpilot_server'])` returns correct value
3. Clear extension storage and reload:
   ```javascript
   chrome.storage.local.clear()
   location.reload()
   ```

### Issue: Too Many Console Logs

**Cause:** Old version of content script cached

**Fix:**
1. Hard reload extension: `chrome://extensions/` → Reload
2. Clear browser cache
3. Verify content script version in first log:
   ```
   [AdPilot] Content script loaded - v0.3.0
   ```

## 📊 Verification Checklist

After deployment, verify:

```bash
# Check staging is accessible
curl -I https://staging.adpilot.studio/lovable

# Should return 200 OK with CSP headers
```

Expected response headers:
```
HTTP/2 200 OK
content-security-policy: frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:* http://127.0.0.1:*
x-content-type-options: nosniff
```

## 🎯 Next Steps

After successful staging testing:

1. **Create production build:**
   ```bash
   npm run build
   npm run package
   ```

2. **Test packaged extension:**
   - Load the packaged `.zip` file
   - Verify it defaults to production server

3. **Submit to Chrome Web Store:**
   - Follow `CHROME_WEB_STORE_SUBMISSION.md`

## 📝 Changes Summary

### What Changed

- **Headers:** Consolidated in `vercel.json`, removed from `next.config.ts`
- **URL Config:** Single async initialization, waits for storage
- **Logging:** Reduced from verbose to essential only
- **Service Worker:** Sets default server on install
- **Simplification:** Removed 165 lines of complex logic

### What Stayed

- Core functionality (button injection, panel management)
- AI prompt injection
- Image monitoring
- Project context messaging
- Security (origin validation, minimal permissions)

### Breaking Changes

None - all changes are backward compatible.

---

**Need help?** Check `DEVELOPMENT.md` or open an issue.

