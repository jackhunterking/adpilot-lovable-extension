# Vercel Production Deployment Guide

This guide walks you through deploying the AdPilot backend to Vercel production with correct headers and configuration.

## Prerequisites

- [x] Vercel account created
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Git working directory is clean
- [ ] All changes committed
- [ ] Environment variables ready

## Step 1: Verify Local Configuration

### 1.1 Check Files Are in Place

Ensure these files exist:
```bash
✅ vercel.json - Iframe-friendly headers
✅ middleware.ts - CORS handling
✅ next.config.ts - CSP configuration
```

### 1.2 Verify vercel.json

Check that `vercel.json` contains correct headers:
```json
{
  "headers": [
    {
      "source": "/lovable/:path*",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:* http://127.0.0.1:*"
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

## Step 2: Prepare Environment Variables

### 2.1 Required Environment Variables

Create a `.env.production` file (DO NOT COMMIT THIS):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://skgndmwetbcboglmhvbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Meta/Facebook
NEXT_PUBLIC_FB_APP_ID=your_app_id
FB_APP_SECRET=your_app_secret
NEXT_PUBLIC_FB_GRAPH_VERSION=v24.0
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM=your_system_config_id
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER=your_user_config_id

# Optional: Debug mode (set to empty for production)
NEXT_PUBLIC_DEBUG=
```

### 2.2 Get Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select "AdPilot" project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (secret!)

### 2.3 Get Meta Keys

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your AdPilot app
3. Go to Settings → Basic
4. Copy:
   - App ID → `NEXT_PUBLIC_FB_APP_ID`
   - App Secret → `FB_APP_SECRET` (secret!)
5. Go to Business Login settings
6. Copy configuration IDs

## Step 3: Deploy to Vercel

### 3.1 Login to Vercel

```bash
vercel login
```

### 3.2 Link Project (First Time Only)

```bash
vercel link
```

Select:
- Scope: Your Vercel account/team
- Link to existing project? Yes
- Project name: adpilot-lovable-extension (or create new)
- Production branch: main

### 3.3 Add Environment Variables

**Option A: Via Vercel CLI**
```bash
# Add each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste the value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_FB_APP_ID production
vercel env add FB_APP_SECRET production
vercel env add NEXT_PUBLIC_FB_GRAPH_VERSION production
vercel env add NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM production
vercel env add NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER production
```

**Option B: Via Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - Key: Variable name
   - Value: Variable value
   - Environment: Production (only)
   - Click "Add"

### 3.4 Deploy to Production

```bash
# Deploy to production
vercel --prod
```

Or push to main branch (if auto-deploy is enabled):
```bash
git push origin main
```

### 3.5 Wait for Deployment

- Deployment typically takes 2-5 minutes
- Watch progress in terminal or Vercel Dashboard
- Check for any build errors

## Step 4: Verify Deployment

### 4.1 Check Deployment URL

Your production URL should be:
```
https://www.adpilot.studio
```

Or Vercel auto-generated:
```
https://adpilot-lovable-extension.vercel.app
```

### 4.2 Verify Custom Domain (if applicable)

If using custom domain `www.adpilot.studio`:

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add domain: `www.adpilot.studio`
3. Add DNS records as instructed by Vercel
4. Wait for DNS propagation (5-60 minutes)
5. Verify SSL certificate issued

### 4.3 Test Headers with curl

**Critical Test:** Verify iframe headers are correct:

```bash
curl -I https://www.adpilot.studio/lovable
```

**Expected Output:**
```
HTTP/2 200
content-security-policy: frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:* http://127.0.0.1:*
x-content-type-options: nosniff
...
```

**MUST NOT contain:**
```
❌ x-frame-options: deny
❌ x-frame-options: sameorigin
```

If you see `x-frame-options: deny`, the headers are not configured correctly!

### 4.4 Test in Browser

1. Open browser console
2. Navigate to: `https://www.adpilot.studio/lovable`
3. Check for:
   - ✅ Page loads successfully
   - ✅ No console errors
   - ✅ Authentication works
   - ✅ No CORS errors

### 4.5 Test Iframe Embedding

Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Iframe Test</title>
</head>
<body>
  <h1>Iframe Embedding Test</h1>
  <iframe 
    src="https://www.adpilot.studio/lovable" 
    width="800" 
    height="600"
    style="border: 1px solid #ccc;">
  </iframe>
  
  <script>
    // Check for errors
    window.addEventListener('error', (e) => {
      console.error('Error:', e);
    });
  </script>
</body>
</html>
```

Open in browser and check:
- ✅ Iframe loads content
- ✅ No "refused to connect" errors
- ✅ No X-Frame-Options errors
- ✅ Content displays correctly

## Step 5: Update Extension Configuration

### 5.1 Verify Extension URLs

The extension should already be configured to use production URLs via smart environment detection. No changes needed if:

- Extension is packaged (has `update_url` in manifest)
- Auto-detects production environment
- Uses `https://www.adpilot.studio/lovable`

### 5.2 Test Extension with Production Backend

1. Load unpacked extension in Chrome
2. Open Lovable project: `https://lovable.dev/projects/YOUR_PROJECT`
3. Click "Grow" button
4. Verify:
   - ✅ Iframe loads from production URL
   - ✅ No X-Frame-Options errors
   - ✅ Authentication works
   - ✅ API calls succeed (200 status)
   - ✅ No CORS errors

## Step 6: Monitor Deployment

### 6.1 Check Vercel Analytics

1. Go to Vercel Dashboard → Analytics
2. Monitor:
   - Request count
   - Error rate
   - Response time
   - Bandwidth usage

### 6.2 Check Logs

```bash
# View production logs
vercel logs --prod
```

Or in Vercel Dashboard → Deployments → Select deployment → Logs

### 6.3 Monitor Errors

Set up error tracking (optional but recommended):
- Sentry
- LogRocket
- Vercel Analytics
- Custom monitoring

## Troubleshooting

### Issue: X-Frame-Options: deny Still Present

**Cause:** Vercel not using `vercel.json` configuration

**Solutions:**
1. Verify `vercel.json` is in project root
2. Check Vercel Dashboard → Project Settings → Headers
3. Remove any conflicting headers in dashboard
4. Redeploy: `vercel --prod --force`
5. Clear CDN cache if using custom domain

### Issue: CORS Errors

**Cause:** Origin not allowed or middleware not working

**Solutions:**
1. Check `middleware.ts` is deployed
2. Verify origin in browser console: `document.location.origin`
3. Add origin to allowed list in middleware
4. Check Vercel logs for middleware errors

### Issue: 401 Authentication Errors

**Cause:** Environment variables not set correctly

**Solutions:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all Supabase variables are set
3. Check variable values (no trailing spaces)
4. Redeploy after adding variables
5. Test with: `curl https://www.adpilot.studio/api/v1/health`

### Issue: Build Fails

**Cause:** Missing dependencies or configuration issues

**Solutions:**
1. Check build logs in Vercel Dashboard
2. Verify `package.json` has all dependencies
3. Check Node.js version in Vercel settings
4. Test build locally: `npm run build`
5. Fix any TypeScript errors

### Issue: Page Not Found (404)

**Cause:** Routes not configured correctly

**Solutions:**
1. Verify `/lovable` route exists in `app/lovable/page.tsx`
2. Check Next.js routing configuration
3. Verify build completed successfully
4. Check Vercel logs for routing errors

## Rollback Procedure

If deployment has critical issues:

### Option 1: Rollback via Dashboard
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Option 2: Rollback via CLI
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Option 3: Git Rollback
```bash
# Revert to previous commit
git revert HEAD

# Push to trigger redeployment
git push origin main
```

## Post-Deployment Checklist

- [ ] Production URL accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Headers verified with curl
- [ ] Iframe embedding tested
- [ ] Extension tested with production backend
- [ ] Environment variables set
- [ ] No console errors
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Monitoring set up
- [ ] Team notified of deployment

## Next Steps

After successful deployment:

1. ✅ Mark "deploy-backend" todo as completed
2. ⏭️ Proceed to "test-production" todo
3. ⏭️ Package extension for Chrome Web Store
4. ⏭️ Submit to Chrome Web Store

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Important:** Keep your environment variables secure! Never commit secrets to git or share them publicly.

