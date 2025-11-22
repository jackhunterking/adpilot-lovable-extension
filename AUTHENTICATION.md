# Authentication System

Complete guide to how authentication works in AdPilot for Lovable, including the OAuth popup solution and troubleshooting.

## Overview

AdPilot uses **Google OAuth** via Supabase Auth for user authentication. The system is designed to work seamlessly within the Lovable iframe injection context.

**Key Technologies:**
- Supabase Auth (Google OAuth provider)
- Pure popup mode (no server-side callback for OAuth)
- postMessage API for popup-to-parent communication
- localStorage for session persistence

## Authentication Flow

### User Journey

1. User clicks "Sign in with Google" in AdPilot iframe (inside Lovable)
2. OAuth popup opens (500x700 window)
3. User authenticates with Google
4. Google redirects to Supabase
5. Supabase creates session in popup window
6. **Popup transfers session to parent via postMessage**
7. Popup closes automatically (300ms delay)
8. Parent window stores session in its localStorage
9. UI updates to authenticated state
10. User continues working in Lovable

## Technical Implementation

### Core Configuration

**File: `components/auth/auth-provider.tsx`**

The `signInWithGoogle` function uses pure popup mode:

```typescript
const signInWithGoogle = async () => {
  const tempPromptId = localStorage.getItem('temp_prompt_id')

  // ALWAYS use popup mode (works everywhere, handles PKCE perfectly)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      skipBrowserRedirect: true,  // Force popup mode
      data: tempPromptId ? { temp_prompt_id: tempPromptId } : undefined
    }
  })

  // Open OAuth popup
  if (data?.url) {
    window.open(data.url, 'google-oauth-popup', 'width=500,height=700,...)
  }
}
```

### The localStorage Isolation Problem

**Critical Discovery:** localStorage is **NOT shared** between popup and parent windows, even on the same origin.

When Supabase completes OAuth in the popup:
1. ✅ Session created successfully
2. ✅ Session stored in **popup's localStorage**
3. ❌ Parent window has **separate localStorage**
4. ❌ When popup closes, popup's localStorage is destroyed
5. ❌ Parent can't access session

**Evidence:**
- Supabase logs showed login successful (status 302)
- Cookies were created on correct domain
- Parent's `getSession()` returned empty (all 5 retries failed)
- Confirmed via DevTools: separate localStorage instances

### The Solution: Session Transfer via postMessage

Instead of relying on cross-window storage sync, we **explicitly transfer** the session from popup to parent.

#### Step 1: Popup Sends Session Data

**In popup window** (after OAuth completes):

```typescript
// Detect we're in a popup that was opened by parent
if (window.opener && !window.opener.closed && session) {
  // Send complete session object to parent
  window.opener.postMessage(
    { 
      type: 'OAUTH_SUCCESS',
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      }
    },
    window.location.origin  // Only send to same origin
  )
  
  // Wait 300ms for postMessage to complete, then close
  setTimeout(() => {
    window.close()
  }, 300)
  
  return // Don't continue initialization in popup
}
```

#### Step 2: Parent Receives and Stores Session

**In parent window** (message listener):

```typescript
useEffect(() => {
  const handleOAuthMessage = (event: MessageEvent) => {
    // Security: validate origin
    if (event.origin !== window.location.origin) {
      return
    }
    
    if (event.data.type === 'OAUTH_SUCCESS' && event.data.session) {
      // Use Supabase setSession to store in parent's localStorage
      supabase.auth.setSession({
        access_token: event.data.session.access_token,
        refresh_token: event.data.session.refresh_token
      }).then(({ data, error }) => {
        if (data.session) {
          // Update React state
          setSession(data.session)
          setUser(data.session.user)
          fetchProfile(data.session.user.id)
        }
      })
    }
  }
  
  window.addEventListener('message', handleOAuthMessage)
  return () => window.removeEventListener('message', handleOAuthMessage)
}, [])
```

## Why This Approach is Best Practice

### ✅ Simple & Lean
- Uses Supabase's built-in popup mode
- No custom server callback needed for OAuth
- ~40 lines of code vs 200+ with redirect flow
- Supabase handles PKCE, token refresh, security

### ✅ Secure
- PKCE flow works perfectly (all client-side)
- Origin validation on all messages
- No tokens exposed in URLs
- Session data only sent to same origin

### ✅ Reliable
- No dependency on cross-window storage sync
- Works in iframe and normal windows
- Handles popup blockers gracefully
- Works with third-party cookie restrictions

### ✅ User Experience
- User never leaves Lovable page
- Popup closes automatically
- No manual redirects or page reloads
- Instant UI updates after authentication

## Configuration

### Supabase Dashboard Setup

**Authentication → URL Configuration:**

```
Site URL: https://staging.adpilot.studio
```

**Redirect URLs (whitelist all environments):**
```
https://staging.adpilot.studio/*
https://www.adpilot.studio/*
http://localhost:3000/*
```

**Google OAuth Provider:**
- Enable Google provider
- Add Google Client ID and Secret
- Enable "Skip nonce check" if using popup flow

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Common Issues & Solutions

### Issue 1: "Auth session missing" Error

**Symptoms:**
- OAuth completes but parent shows error
- Console: `AuthSessionMissingError: Auth session missing!`

**Cause:** Using `refreshSession()` instead of receiving session via postMessage

**Solution:** Ensure message handler uses `setSession()` with received session data

### Issue 2: Popup Stays Open

**Symptoms:**
- User authenticates successfully
- Popup shows authenticated state but doesn't close
- Parent doesn't update

**Cause:** `window.opener` is null or message listener not set up

**Solution:** 
- Verify popup is opened with `window.open()` (not target="_blank")
- Ensure message listener is registered in parent before popup opens

### Issue 3: "Code verifier missing" Error

**Symptoms:**
- Console: `invalid request: both auth code and code verifier should be non-empty`

**Cause:** Mixing popup mode with server-side callback (PKCE conflict)

**Solution:** Use pure popup mode with `skipBrowserRedirect: true` and NO `redirectTo` parameter

### Issue 4: Session Not Found After Retry

**Symptoms:**
- All 5 retries fail
- Console: `No session found after all retries`

**Cause:** Session not being transferred via postMessage (localStorage isolation)

**Solution:** Ensure popup sends session object in OAUTH_SUCCESS message

### Issue 5: Profile Fetching 406 Error

**Symptoms:**
- Error: `Cannot coerce result to single JSON object`
- Status 406 Not Acceptable

**Cause:** Using `.single()` when profile might not exist yet

**Solution:** Use `.maybeSingle()` instead - allows 0 or 1 rows

## Debugging Guide

### Enable Debug Logging

All auth operations log with `[AUTH-PROVIDER]` or `[POPUP]` prefix. Watch console for:

**Normal Flow:**
```
[AUTH-PROVIDER] Starting Google OAuth (popup mode)
[AUTH-PROVIDER] OAuth popup opened
[POPUP] Session established, sending session data to parent
[AUTH-PROVIDER] Session data received from popup, setting in parent
[AUTH-PROVIDER] Session set successfully in parent window
[POPUP] Closing popup after session transfer
```

**Error Flow:**
```
[POPUP] No session found, notifying parent of error
[AUTH-PROVIDER] OAuth popup failed: No session established
```

### Check Storage State

**In parent window console:**
```javascript
// Check if session exists
supabase.auth.getSession().then(({ data }) => {
  console.log('Session:', data.session)
})

// Check localStorage
Object.keys(localStorage).filter(k => k.includes('supabase'))
```

### Verify Cookies

**DevTools → Application → Cookies → staging.adpilot.studio:**

Should see 3 Supabase cookies:
- `sb-<project>-auth-token`
- `sb-<project>-auth-token.0` 
- `sb-<project>-auth-token.1`

All with:
- Path: `/`
- SameSite: `Lax`
- Secure: `true` (production)

## Advanced Topics

### Why Not Use Server-Side Callback?

Server-side callbacks (`/auth/callback` route) work great for:
- Email verification links
- Magic link sign-in
- Password reset flows

But for OAuth popups:
- ❌ PKCE code verifier not accessible server-side
- ❌ Requires complex cookie management
- ❌ More code, more potential failures
- ✅ Pure client-side is simpler and more reliable

### Email/Magic Link Authentication

The `/auth/callback` route is still used for email-based auth:

```typescript
// For email verification, magic links, password resets
// Supabase redirects to: /auth/callback?code=xxx&next=/destination
```

This works because email flows don't use popups - they use full page redirects where the server can access the PKCE verifier.

### Multi-Window Architecture

```
┌──────────────────────┐
│   Lovable (Parent)   │
│  ┌───────────────┐   │
│  │ AdPilot       │   │
│  │ Iframe        │   │
│  │ localStorage A│   │ ← Has its own localStorage
│  └───────────────┘   │
└──────────────────────┘
         │
         │ window.open()
         ▼
┌──────────────────────┐
│   OAuth Popup        │
│   localStorage B     │ ← Separate localStorage!
│   (destroyed on      │
│    close)            │
└──────────────────────┘
```

**Solution:** Transfer session via postMessage before popup closes.

## References

- [Supabase Auth Popup Flow](https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr)
- [Chrome Extension Messaging API](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Window.postMessage() MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [PKCE Flow Explained](https://oauth.net/2/pkce/)

## Troubleshooting Checklist

- [ ] Supabase Site URL matches your domain
- [ ] Redirect URLs include all environments
- [ ] Google OAuth provider enabled in Supabase
- [ ] `skipBrowserRedirect: true` set in OAuth options
- [ ] NO `redirectTo` parameter in OAuth options
- [ ] Message listener registered before popup opens
- [ ] Popup sends session object, not just success flag
- [ ] Origin validation in message handler
- [ ] Using `setSession()` not `getSession()` in parent
- [ ] Popup delay allows postMessage to complete (300ms+)

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

