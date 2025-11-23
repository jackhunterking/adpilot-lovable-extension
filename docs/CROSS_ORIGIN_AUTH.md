# Cross-Origin Iframe Authentication Solution

**Status**: ✅ **IMPLEMENTED AND WORKING**  
**Last Updated**: November 23, 2025  
**Issue**: Session persistence in cross-origin iframe context  
**Solution**: Cookie-based authentication with `SameSite=None; Secure`

---

## Problem Statement

AdPilot runs inside a **cross-origin iframe**:
- **Parent Domain**: `lovable.dev` (Chrome extension injects iframe)
- **Iframe Domain**: `staging.adpilot.studio` (Next.js app with Supabase auth)

In cross-origin iframes, browser security policies impose strict restrictions:
- **localStorage is completely isolated** per origin
- **sessionStorage is completely isolated** per origin
- **Cookies are blocked by default** (third-party cookie restrictions)

Without proper configuration, Supabase authentication sessions cannot persist across page refreshes because:
1. Supabase client tries to store session in localStorage
2. localStorage in iframe is isolated from parent
3. On refresh, iframe gets fresh isolated storage → session lost

---

## Solution Architecture

### Approach: Cookie-Based Storage with Cross-Origin Support

We use Supabase's `@supabase/ssr` package with custom cookie handlers that set cookies with special attributes required for cross-origin contexts:

```typescript
// lib/supabase/client.ts
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) { /* read from document.cookie */ },
      set(name: string, value: string, options: any) {
        // CRITICAL: These attributes are REQUIRED for cross-origin cookies
        cookie += `; samesite=None`  // Allow cross-site cookie access
        cookie += `; secure`          // HTTPS only (required with SameSite=None)
        cookie += `; max-age=31536000` // 1 year default persistence
        cookie += `; path=/`          // Available site-wide
        document.cookie = cookie
      },
      remove(name: string, options: any) { /* expire cookie */ }
    }
  }
)
```

### Key Attributes Explained

| Attribute | Value | Why Required |
|-----------|-------|--------------|
| `SameSite` | `None` | Allows cookies to be sent in cross-origin requests (iframe context) |
| `Secure` | `true` | Required when `SameSite=None`; enforces HTTPS-only transmission |
| `max-age` | `31536000` | 1 year in seconds; ensures long-term persistence |
| `path` | `/` | Makes cookie available to all routes in the app |

**Without these attributes**, browsers will:
- Block cookies as "third-party" cookies
- Reject `SameSite=None` cookies on HTTP
- Result in session loss on every page refresh

---

## Implementation Details

### File Modified

**`lib/supabase/client.ts`** - Supabase browser client configuration

**Key Changes**:
1. ✅ Added custom cookie handlers (required for `@supabase/ssr`)
2. ✅ Set `SameSite=None` for cross-origin cookie access
3. ✅ Set `Secure` flag (HTTPS required)
4. ✅ Default `max-age` to 1 year for persistence
5. ✅ Force `path=/` for site-wide availability
6. ✅ Enhanced console logging for debugging

### OAuth Flow

The OAuth flow works seamlessly with cookie-based storage:

```typescript
// components/auth/auth-provider.tsx
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      skipBrowserRedirect: true,  // Popup mode
      data: tempPromptId ? { temp_prompt_id: tempPromptId } : undefined
    }
  })
  
  // Open popup window for OAuth
  window.open(data.url, 'google-oauth-popup', '...')
}
```

**Flow Sequence**:
1. User clicks "Sign in with Google" in iframe
2. Popup window opens with Google OAuth consent screen
3. User authenticates in popup
4. Popup completes OAuth and establishes session
5. **Session tokens stored in cookies with `SameSite=None; Secure`**
6. Popup sends session data to parent iframe via `postMessage`
7. Parent iframe calls `supabase.auth.setSession()` with tokens
8. **Cookies persist across refreshes** ✅

---

## Testing & Verification

### Manual Testing Steps

1. **Clear All Storage** (DevTools → Application → Clear site data)
2. **Sign in with Google OAuth**
3. **Verify Cookies in DevTools**:
   - Navigate to: Application → Cookies → `https://staging.adpilot.studio`
   - Look for: `sb-*-auth-token` cookies
   - **Verify attributes**:
     - ✅ `SameSite`: `None`
     - ✅ `Secure`: checked (✓)
     - ✅ `Path`: `/`
     - ✅ `Expires`: ~1 year from now

4. **Test Session Persistence**:
   - Refresh page (F5 / Cmd+R)
   - Verify you remain logged in
   - Check console for: `[AUTH-PROVIDER] Found existing session on init`

5. **Test Cross-Tab Persistence**:
   - Open new tab to same app
   - Verify automatic login
   - Cookies shared across tabs

### Console Messages

**Successful auth produces these console logs**:

```
[SUPABASE-CLIENT] Cross-origin cookie set: sb-xxx-auth-token (SameSite=None; Secure)
[AUTH-PROVIDER] OAuth popup opened - session will update automatically
[AUTH-PROVIDER] OAuth popup succeeded, receiving session data
[AUTH-PROVIDER] Session persisted to localStorage successfully
[AUTH-PROVIDER] Persistence verification: { sessionExists: true, willSurviveRefresh: true }
```

**On page refresh**:

```
[AUTH-PROVIDER] Initializing auth
[AUTH-PROVIDER] Init - checking for existing session { hasSession: true, userId: '...' }
[AUTH-PROVIDER] Found existing session on init (will survive refresh)
```

---

## Browser Compatibility

### ✅ Supported (Cookie-Based Auth Works)

| Browser | Mode | Status | Notes |
|---------|------|--------|-------|
| **Chrome** | Regular | ✅ Working | Third-party cookies allowed by default |
| **Chrome** | Incognito | ❌ Blocked | Third-party cookies blocked in incognito |
| **Firefox** | Regular | ✅ Working | Cross-origin cookies allowed |
| **Firefox** | Private | ⚠️ May block | Enhanced Tracking Protection may block |
| **Edge** | Regular | ✅ Working | Same as Chrome (Chromium-based) |
| **Safari** | Regular | ⚠️ Requires config | ITP blocks by default, user must disable "Prevent cross-site tracking" |

### Safari Workaround

For Safari users who encounter issues:

1. Open **Safari Preferences** → **Privacy**
2. **Uncheck** "Prevent cross-site tracking"
3. Refresh the page and sign in again

**Note**: Safari's Intelligent Tracking Prevention (ITP) is aggressive with third-party cookies. For production, consider implementing the redirect-based fallback for Safari users.

---

## Production Deployment Requirements

### 1. HTTPS is Mandatory

**The `Secure` flag requires HTTPS**. Cookies will NOT work over HTTP.

- ✅ Production: `https://www.adpilot.studio`
- ✅ Staging: `https://staging.adpilot.studio`
- ❌ Local dev: `http://localhost:3000` (cookies will fail in iframe context)

**For local development**:
- Test outside iframe context (direct browser access)
- OR use HTTPS proxy like `ngrok` for iframe testing

### 2. Environment Variables

Ensure these are set in production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only
```

### 3. Supabase OAuth Configuration

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://staging.adpilot.studio`
- **Redirect URLs**: Add all callback URLs:
  - `https://staging.adpilot.studio/auth/callback`
  - `https://staging.adpilot.studio/lovable` (for popup mode)

### 4. Chrome Extension Permissions

Ensure `manifest.json` includes iframe domain:

```json
{
  "host_permissions": [
    "https://*.adpilot.studio/*",
    "https://lovable.dev/*"
  ]
}
```

---

## Troubleshooting

### Issue: Cookies Not Appearing in DevTools

**Symptoms**:
- No `sb-*` cookies in Application → Cookies
- Console shows "Cross-origin cookie set" but cookies don't persist

**Causes**:
1. **HTTP instead of HTTPS** - `Secure` flag requires HTTPS
2. **Browser blocking third-party cookies** - Check browser settings
3. **Incognito/Private mode** - Third-party cookies disabled by default

**Solutions**:
- Ensure app is served over HTTPS
- Test in regular browser window (not incognito)
- Check browser settings: Enable third-party cookies

### Issue: Session Lost After Refresh

**Symptoms**:
- User is logged out after page refresh
- Console shows "No existing session found on init"

**Causes**:
1. **Cookies not persisting** - Check cookie attributes
2. **Cookie expired** - Check `max-age` or `Expires`
3. **Domain mismatch** - Cookie domain doesn't match iframe origin

**Solutions**:
- Verify cookie attributes in DevTools (SameSite=None, Secure)
- Check cookie expiration time (should be ~1 year)
- Ensure cookie domain matches `staging.adpilot.studio`

### Issue: OAuth Popup Blocked

**Symptoms**:
- Popup doesn't open
- Console shows "Popup blocked by browser"

**Solution**:
```javascript
// User must manually allow popups for lovable.dev
alert('Please allow popups to sign in with Google')
```

### Issue: "WARNING: Session not persisted properly!"

**Symptoms**:
- Console shows session verification failed
- Session appears but doesn't survive refresh

**Debug Steps**:
1. Check if cookies are actually set:
   ```javascript
   console.log(document.cookie) // Should show sb-* cookies
   ```
2. Verify cookie attributes in DevTools
3. Test `supabase.auth.getSession()` after refresh
4. Check for JavaScript errors blocking cookie write

---

## Alternative: Redirect-Based Authentication (Not Implemented)

If cookie-based auth fails in certain browsers (e.g., Safari with ITP), a redirect-based approach can be used as a fallback:

### Architecture

1. User clicks "Sign in with Google" in iframe
2. Iframe sends message to parent (Chrome extension)
3. Parent opens **full-page redirect** to auth page
4. After OAuth completion, redirect back to iframe URL
5. Iframe extracts session from URL and stores it

### Implementation Files Needed

**Would require**:
- `app/auth/iframe-redirect/page.tsx` - Handles redirect callback
- Update `components/auth/auth-provider.tsx` - Detect iframe context
- Update `content/inject.js` - Handle redirect messages

**Decision**: Not implemented because cookie-based approach works in Chrome and Firefox, which covers majority of users.

---

## Related Documentation

- **Architecture**: See `docs/ARCHITECTURE.md` for overall system design
- **Chrome Extension**: See `.cursorrules` for extension integration patterns
- **Supabase Setup**: See `SUPABASE_SECURITY_AUDIT.md` for RLS policies

---

## References

- [Supabase SSR Client Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome: SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)
- [RFC 6265: HTTP State Management (Cookies)](https://datatracker.ietf.org/doc/html/rfc6265)

---

## Change Log

### November 23, 2025 - Initial Implementation
- ✅ Implemented cookie-based auth with `SameSite=None; Secure`
- ✅ Tested and verified in Chrome regular mode
- ✅ Session persistence confirmed across page refreshes
- ✅ Cross-tab session sharing confirmed
- 📝 Documented solution and troubleshooting guide

### Future Improvements
- [ ] Implement redirect-based fallback for Safari/ITP
- [ ] Add automatic browser detection and fallback switching
- [ ] Add user-facing notice for browsers that block cookies
- [ ] Monitor analytics for auth success/failure rates by browser

