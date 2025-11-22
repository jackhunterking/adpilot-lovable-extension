# Lovable Extension User Journey - Testing Guide

## Overview
This document outlines the complete user journey for the AdPilot for Lovable extension and provides a testing checklist to verify the implementation.

## User Journey Flow

### Journey 1: Extension Installation (New Users)
**User visits the root URL directly**

1. **Navigate to**: `http://localhost:3000` (or production URL)
2. **Expected**: See extension download landing page
   - Hero section with "AdPilot for Lovable" branding
   - Clear "Download Chrome Extension" CTA button
   - Installation instructions (3 steps)
   - Features grid showcasing AI-powered creation, analytics, and quick setup
   - Footer with privacy/terms links
   - **No sign in/sign up buttons** (important: auth happens in iframe only)

3. **Click**: "Download Chrome Extension" button
   - **Expected**: Opens Chrome Web Store (placeholder URL for now)
   - **Note**: Replace `CHROME_STORE_URL` constant in `app/page.tsx` with actual store URL

### Journey 2: Using Extension in Lovable (After Installation)
**User has installed extension and opens a Lovable project**

1. **Navigate to**: `https://lovable.dev/projects/[project-id]`
2. **Expected**: See "Grow" button in Lovable navigation (injected by extension)

3. **Click**: "Grow" button in Lovable navigation
   - **Expected**: Panel opens showing iframe loading `/lovable` route
   - URL parameter changes to `?view=grow`

### Journey 3: Authentication Flow (First-time User in Iframe)
**User clicks Grow button but is not authenticated**

1. **Iframe loads**: `/lovable` route
2. **Expected**: Authentication blocker appears
   - Centered card with Google icon
   - "Sign in to Continue" heading
   - Description: "Connect your Google account to create ads with AdPilot"
   - "Sign in with Google" button
   - Terms/Privacy notice at bottom

3. **Click**: "Sign in with Google" button
   - **Expected**: Google OAuth flow begins
   - **Expected**: After successful auth, user sees workspace

### Journey 4: Workspace Overview (Authenticated User)
**User is authenticated and clicks Grow button**

1. **Iframe loads**: `/lovable` route (authenticated)
2. **Expected**: Loading spinner briefly appears while checking auth
3. **Expected**: Workspace overview loads showing:
   - `LovableNavigation` component (tabs: Ads, Analytics, Campaigns)
   - `CampaignWorkspaceOrchestrator` component
   - Ads list or empty state with "Create your first ad" CTA

4. **Navigation works**: User can switch between tabs
   - Ads tab: Shows workspace with ads list
   - Analytics tab: Shows analytics panel
   - Campaigns tab: Shows campaigns list

## Testing Checklist

### ✅ Root URL Landing Page (`/`)
- [ ] Page loads without errors
- [ ] Extension download CTA is visible and prominent
- [ ] Installation instructions are clear (3 numbered steps)
- [ ] Features grid displays correctly
- [ ] No sign in/sign up buttons visible
- [ ] Footer links work (Privacy, Terms)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Logo and branding display correctly

### ✅ Extension Integration (Chrome Extension)
- [ ] Extension installs without errors
- [ ] "Grow" button appears in Lovable navigation
- [ ] Button styling matches Lovable's native buttons
- [ ] Click "Grow" button → iframe opens
- [ ] URL updates to `?view=grow`
- [ ] Iframe loads `/lovable` route
- [ ] Project context is sent to iframe via postMessage

### ✅ Authentication Flow (`/lovable` route - unauthenticated)
- [ ] Auth blocker appears immediately (no flash of content)
- [ ] Google sign-in button is prominent
- [ ] Click "Sign in with Google" → OAuth popup opens
- [ ] After successful auth → redirects back to workspace
- [ ] Auth state persists on page refresh
- [ ] No homepage elements leak into iframe view

### ✅ Workspace Overview (`/lovable` route - authenticated)
- [ ] Loading state shows briefly
- [ ] Navigation tabs appear (Ads, Analytics, Campaigns)
- [ ] Default tab is "Ads" (workspace overview)
- [ ] Empty state shows if no ads exist
- [ ] "Create New Ad" button works
- [ ] Tab navigation works without page reload
- [ ] Campaign auto-creation works on first visit
- [ ] No homepage/landing page elements visible

### ✅ Meta Connection Flow (if applicable)
- [ ] If Meta not connected, shows Meta auth blocker
- [ ] Meta connection modal appears
- [ ] Can connect Facebook account
- [ ] Can select business assets
- [ ] After connection, proceeds to workspace

## Key Principles Verified

1. **Separation of Concerns**
   - ✅ Root URL (`/`) = Extension installation guide
   - ✅ `/lovable` route = Iframe content (auth → workspace)
   - ✅ No confusion between public site and workspace

2. **Auth Flow**
   - ✅ No auth on public landing page
   - ✅ Auth happens immediately in iframe before workspace access
   - ✅ No way to bypass auth in iframe

3. **Extension-First Mindset**
   - ✅ Users install extension first
   - ✅ Then use it within Lovable projects
   - ✅ No standalone website functionality

4. **User Experience**
   - ✅ Clear installation instructions
   - ✅ Seamless integration with Lovable UI
   - ✅ Immediate auth requirement in iframe
   - ✅ Workspace overview after auth (default view)

## Known Issues / TODOs

1. **Chrome Web Store URL**: Replace placeholder in `app/page.tsx` with actual store URL
2. **Extension Publishing**: Submit extension to Chrome Web Store
3. **Visual Testing**: Take screenshots of extension in action for landing page
4. **Analytics**: Add tracking to monitor installation funnel

## Files Modified in This Implementation

### New Files
- `app/page.tsx` - Extension download landing page

### Modified Files
- `app/lovable/page.tsx` - Verified auth flow (no changes needed)
- `components/lovable/lovable-layout.tsx` - Verified auth flow (no changes needed)
- `components/lovable/auth-blocker.tsx` - Verified messaging (no changes needed)

### Deleted Files
- `components/homepage/hero-section.tsx`
- `components/homepage/homepage-header.tsx`
- `components/homepage/logged-in-header.tsx`
- `components/homepage/campaign-grid.tsx`
- `components/homepage/ad-carousel.tsx`

## Manual Testing Steps

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Root URL**
   - Open `http://localhost:3000`
   - Verify landing page shows correctly

3. **Test Extension in Lovable**
   - Load extension in Chrome (unpacked)
   - Open any Lovable project
   - Click "Grow" button
   - Verify iframe loads and auth flow works

4. **Test Authenticated Experience**
   - Sign in with Google
   - Verify workspace loads
   - Test navigation between tabs
   - Create an ad to verify full flow

## Success Criteria

✅ **All checklists pass**
✅ **User can install extension following landing page instructions**
✅ **Extension integrates seamlessly with Lovable**
✅ **Auth flow is clear and immediate**
✅ **Workspace is functional after auth**
✅ **No homepage elements appear in iframe**

