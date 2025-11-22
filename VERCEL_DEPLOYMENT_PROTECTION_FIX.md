# Vercel Deployment Protection Fix

## Issue

**Staging server returns 401 with `X-Frame-Options: DENY`** preventing iframe embedding in Lovable.

## Root Cause

**Vercel Deployment Protection (SSO/Authentication)** is enabled on the staging environment.

### Evidence
```bash
$ curl -I https://staging.adpilot.studio/lovable

HTTP/2 401
x-frame-options: DENY  ← Added by Vercel SSO
set-cookie: _vercel_sso_nonce=...
```

This is NOT from our code. Vercel's Deployment Protection automatically:
- Requires authentication to access previews
- Adds `X-Frame-Options: DENY` header
- Blocks iframe embedding
- Returns 401 for unauthenticated requests

## Solution

### Option 1: Disable Protection (Recommended)

**For staging/development deployments:**

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings → Deployment Protection**

3. **Disable for Preview Branches:**
   - Turn OFF "Standard Protection" for Preview deployments
   - This allows public access to staging/preview environments
   - Keep ON for Production if you want

4. **Apply Changes**
   - Changes take effect immediately
   - No redeploy needed

5. **Verify Fix:**
   ```bash
   curl -I https://staging.adpilot.studio/lovable
   # Should return: HTTP/2 200 OK
   # No SSO headers
   ```

### Option 2: Use Bypass Token (Advanced)

**If you want to keep protection enabled:**

1. **Get Bypass Token:**
   - Vercel Dashboard → Project → Settings → Deployment Protection
   - Find "Protection Bypass for Automation"
   - Copy the bypass token

2. **Modify iframe URL in extension:**
   ```javascript
   const bypassToken = 'your_bypass_token_here';
   iframe.src = `${SERVER_URL}?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=${bypassToken}`;
   ```

3. **Limitations:**
   - Token must be embedded in extension (security concern)
   - Token can expire
   - More complex to manage

**Recommendation:** Use Option 1 for staging. Only use protection on production.

## Why localhost:3000 worked

- Local dev server doesn't have Vercel protection
- No authentication required
- Direct access to Next.js app

## Why staging failed

- Vercel SSO protection enabled
- Authentication wall blocks all requests
- `X-Frame-Options: DENY` prevents iframe embedding
- Even our correct CSP headers in `vercel.json` are overridden by Vercel SSO

## Configuration Files (These are correct!)

Our `vercel.json` and `next.config.ts` are configured correctly:

```json
// vercel.json
{
  "headers": [{
    "source": "/:path*",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:* http://127.0.0.1:*"
    }]
  }]
}
```

**These headers work correctly AFTER disabling Vercel Deployment Protection.**

## Test After Fix

1. **Disable protection** in Vercel dashboard
2. **Wait 30 seconds** for changes
3. **Test with curl:**
   ```bash
   curl -I https://staging.adpilot.studio/lovable
   ```
   Expected:
   ```
   HTTP/2 200 OK
   content-security-policy: frame-ancestors 'self' https://lovable.dev ...
   ```
   (No `x-frame-options`, no `401`, no SSO cookies)

4. **Reload Chrome extension**
5. **Click Grow button** → Should work! ✅

## Summary

- ✅ Code changes are correct
- ✅ Headers configuration is correct
- ❌ Vercel Deployment Protection was blocking everything
- 🔧 Solution: Disable protection for staging/preview deployments

---

**After disabling protection, the extension will work as expected.**

