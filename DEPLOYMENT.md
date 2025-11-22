# Deployment Guide

Complete guide for deploying AdPilot for Lovable to staging, production, and Chrome Web Store.

## Quick Links

- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Chrome Web Store Submission](#chrome-web-store-submission)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Staging Deployment

### Prerequisites

- Vercel account connected to GitHub
- Supabase project configured
- Meta (Facebook) app created
- Environment variables ready

### Step 1: Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Deploy to staging"
git push origin main

# Vercel auto-deploys on push
# Monitor: https://vercel.com/dashboard
```

### Step 2: Configure Vercel Environment

**Dashboard → Project → Settings → Environment Variables**

Set for **Preview** environment:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Meta/Facebook
NEXT_PUBLIC_FB_APP_ID=your_app_id
FB_APP_SECRET=your_app_secret
NEXT_PUBLIC_FB_GRAPH_VERSION=v24.0
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM=config_id_system
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER=config_id_user

# Vercel AI
VERCEL_AI_API_KEY=vck_...
```

### Step 3: Configure Supabase

**Authentication → URL Configuration:**

```
Site URL: https://staging.adpilot.studio

Redirect URLs:
- https://staging.adpilot.studio/*
- http://localhost:3000/*
```

**Authentication → Providers → Google:**
- Enable Google provider
- Add Client ID and Secret from Google Cloud Console
- Enable "Skip nonce check" (for popup flow)

### Step 4: Load Extension in Chrome

```bash
# Development mode
npm run dev

# Load unpacked extension
# 1. chrome://extensions/
# 2. Enable Developer mode
# 3. Load unpacked → select project directory
# 4. Extension loads with localhost:3000 iframe
```

### Step 5: Test Staging

1. Open any Lovable project
2. Click "Grow" tab
3. Sign in with Google (popup flow)
4. Create test campaign
5. Verify all features work

---

## Production Deployment

### Pre-Production Checklist

- [ ] All features tested in staging
- [ ] No console errors
- [ ] Authentication working
- [ ] Meta OAuth connection working
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] API endpoints tested
- [ ] Chrome extension manifest updated to production URL

### Step 1: Update Extension Manifest

**File: `manifest.production.json`**

Update iframe URL to production:

```json
{
  "name": "AdPilot for Lovable",
  "version": "1.0.0",
  "content_scripts": [{
    "matches": ["https://lovable.dev/projects/*"],
    "js": ["content/inject.js"]
  }]
}
```

**In `content/inject.js`:**

The smart environment detection automatically uses:
- `https://www.adpilot.studio` for packaged extension (production)
- `https://staging.adpilot.studio` for unpacked extension
- `http://localhost:3000` for local development

### Step 2: Deploy Backend to Vercel

```bash
# Merge to main branch
git checkout main
git merge feature/google-oauth-fix
git push origin main

# Vercel auto-deploys main branch to production
# URL: https://www.adpilot.studio
```

### Step 3: Configure Production Environment

**Vercel → Production Environment Variables:**

Same as staging but for Production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_FB_APP_ID=your_app_id
FB_APP_SECRET=your_app_secret
# ... all other vars
```

### Step 4: Update Supabase Production Config

**Authentication → URL Configuration:**

```
Site URL: https://www.adpilot.studio

Redirect URLs:
- https://www.adpilot.studio/*
- https://staging.adpilot.studio/*
```

### Step 5: Package Extension

```bash
# Create production package
./scripts/package.sh production

# Generates: dist/adpilot-lovable-extension-v1.0.0.zip
```

### Step 6: Test Production Build

```bash
# Load packaged extension
# 1. chrome://extensions/
# 2. Load unpacked → select dist/ folder
# 3. Test in Lovable
# 4. Verify connects to www.adpilot.studio
```

---

## Chrome Web Store Submission

### Step 1: Prepare Assets

Create in `assets/chrome-store/`:

**Screenshots (5 required):**
- 1280x800 or 640x400 PNG/JPEG
- Capture: Dashboard, Create Ad, Targeting, Analytics, Campaign view

**Promotional Images:**
- Small tile: 440x280
- Large tile: 920x680 (optional)
- Marquee: 1400x560 (optional)

### Step 2: Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee
3. Complete publisher information

### Step 3: Create Store Listing

**Basic Info:**
```
Name: AdPilot for Lovable
Summary: Create Meta ads with AI, directly from your Lovable editor
Description: (See detailed description below)
Category: Productivity
Language: English
```

**Description Template:**

```
Create stunning Meta (Facebook/Instagram) ad campaigns with AI-powered tools, without leaving your Lovable editor.

KEY FEATURES:
✨ AI-Powered Ad Creation - Generate images and copy with advanced AI models
🎯 Smart Targeting - Find your ideal audience with AI suggestions
📊 Live Analytics - Track performance in real-time
💰 Budget Management - Control spend and optimize ROI
🚀 Seamless Integration - Works directly in Lovable projects

HOW IT WORKS:
1. Install the extension
2. Open any Lovable project
3. Click the "Grow" tab
4. Sign in and start creating ads

Perfect for:
- SaaS founders launching products
- Agencies managing client campaigns
- Developers building side projects
- Anyone creating with Lovable

FREE TO INSTALL - Pay only for Meta ad spend (handled by Meta).
```

**Privacy:**
- Privacy policy URL: `https://www.adpilot.studio/privacy`
- Permissions justification:
  - `storage`: Save user preferences
  - `tabs`: Detect Lovable projects

### Step 4: Upload Package

1. Click "New Item" in Developer Dashboard
2. Upload `adpilot-lovable-extension-v1.0.0.zip`
3. Upload screenshots and promotional images
4. Fill in store listing details
5. Set pricing: **Free**

### Step 5: Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait 1-3 business days
4. Address any feedback from Chrome reviewers

### Step 6: Post-Approval

Once approved:
1. Extension goes live automatically
2. Update landing page with Chrome Web Store link
3. Announce launch
4. Monitor user feedback and ratings

---

## Environment Variables

### Required Variables

#### Supabase (Backend Database)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Secret - server only!
```

#### Meta/Facebook (Ad Platform)

```bash
NEXT_PUBLIC_FB_APP_ID=123456789
FB_APP_SECRET=secret_here              # Secret - server only!
NEXT_PUBLIC_FB_GRAPH_VERSION=v24.0
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM=config_id
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER=config_id
```

#### Vercel AI (Optional)

```bash
VERCEL_AI_API_KEY=vck_...              # For AI Gateway
```

#### Debug Mode (Optional)

```bash
NEXT_PUBLIC_DEBUG=1   # Enable verbose logging (dev only)
```

### Setting Environment Variables

**Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development
4. Save

**Local Development:**
1. Copy `.env.example` to `.env.local`
2. Fill in all values
3. Never commit `.env.local` to git

---

## Vercel Configuration

### vercel.json

Critical for iframe embedding in Lovable:

```json
{
  "headers": [
    {
      "source": "/lovable/:path*",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:*"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

This allows Lovable to embed our app in an iframe.

### Deployment Protection

**Vercel → Project → Settings → Deployment Protection:**

For production domains:
1. Enable "Vercel Authentication"
2. Add to allowlist:
   - `lovable.dev`
   - `*.lovable.dev`
3. This prevents unauthorized iframe embedding

---

## Testing

### Staging Testing Checklist

- [ ] Extension loads in Lovable
- [ ] "Grow" button appears in navigation
- [ ] Clicking "Grow" opens iframe panel
- [ ] Google sign-in works (popup flow)
- [ ] Popup closes automatically after auth
- [ ] User stays in Lovable (doesn't redirect away)
- [ ] Dashboard loads after authentication
- [ ] Can create campaign
- [ ] Can generate ad images with AI
- [ ] Can generate ad copy with AI
- [ ] Can save and edit ads
- [ ] Analytics display correctly
- [ ] Meta OAuth connection works
- [ ] Can publish ads to Meta

### Production Testing Checklist

Same as staging, but verify:
- [ ] Uses production URL (`www.adpilot.studio`)
- [ ] Correct Meta app credentials
- [ ] Production database
- [ ] Real Meta ad accounts (not sandbox)
- [ ] Payment processing works
- [ ] Email notifications send

---

## Troubleshooting

### Issue: Iframe Blocked (X-Frame-Options)

**Symptoms:** 
- Extension loads but iframe shows blank
- Console: "Refused to display in a frame"

**Solution:**
- Verify `vercel.json` is deployed
- Check headers in Network tab
- Ensure `frame-ancestors` includes Lovable domains

### Issue: Authentication Fails

**Symptoms:**
- OAuth popup stays open
- Parent doesn't update after auth
- Console: "No session found after all retries"

**Solution:**
- See [AUTHENTICATION.md](AUTHENTICATION.md) for detailed OAuth troubleshooting
- Verify Supabase Site URL matches deployment domain
- Check popup sends session data via postMessage

### Issue: Environment Variables Not Working

**Symptoms:**
- API calls fail with 500 errors
- Console: "Missing environment variables"

**Solution:**
- Verify all vars set in Vercel dashboard
- Redeploy after adding new vars
- Check vars are set for correct environment (Preview/Production)

### Issue: Extension Doesn't Load in Lovable

**Symptoms:**
- No "Grow" button appears
- Extension shows as active in chrome://extensions

**Solution:**
- Check content script matches in manifest.json
- Verify on correct URL pattern: `lovable.dev/projects/*`
- Check console for injection errors
- Reload Lovable page

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] No linter errors
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations applied
- [ ] RLS policies verified

### Deployment

- [ ] Code pushed to main branch
- [ ] Vercel auto-deploy triggered
- [ ] Deployment succeeds
- [ ] Health check passes
- [ ] Staging URL accessible

### Post-Deployment

- [ ] Test authentication flow
- [ ] Test all feature pages
- [ ] Check console for errors
- [ ] Verify API endpoints
- [ ] Monitor error logs (Vercel)
- [ ] Check Supabase logs

### Chrome Web Store

- [ ] Package created (`./scripts/package.sh production`)
- [ ] Screenshots captured (5 images)
- [ ] Store listing complete
- [ ] Privacy policy live
- [ ] Terms of service live
- [ ] Submitted for review
- [ ] Approved and published

---

## Rollback Procedure

If production deployment fails:

### Option 1: Revert via Vercel Dashboard

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." menu → Promote to Production

### Option 2: Git Revert

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel will auto-deploy the revert
```

### Option 3: Roll Forward

Fix the issue and deploy again:

```bash
git commit -m "fix: resolve production issue"
git push origin main
```

---

## Monitoring

### Vercel Logs

Monitor at: `https://vercel.com/dashboard/deployments`

Watch for:
- Build failures
- Runtime errors
- API errors (status 500)

### Supabase Logs

Monitor at: `https://supabase.com/dashboard → Logs`

Watch for:
- Auth errors
- RLS policy violations
- Slow queries
- Connection errors

### Chrome Extension Errors

Monitor at: `chrome://extensions/ → Extension → Errors`

Watch for:
- Content script injection errors
- Permission errors
- Manifest errors

---

## URLs Reference

### Development
- Backend: `http://localhost:3000`
- Extension: Unpacked (local files)

### Staging
- Backend: `https://staging.adpilot.studio`
- Extension: Unpacked (loads staging URL)

### Production
- Backend: `https://www.adpilot.studio`
- Extension: Packaged (Chrome Web Store)
- Landing page: `https://adpilot.studio`

---

## Support

For deployment issues:
- Check [AUTHENTICATION.md](AUTHENTICATION.md) for auth-specific issues
- Check [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) for emergency procedures
- Check [SUPABASE_SECURITY_AUDIT.md](SUPABASE_SECURITY_AUDIT.md) for database issues

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

