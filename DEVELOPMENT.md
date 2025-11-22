# Development Guide - AdPilot for Lovable Extension

Complete guide for setting up, developing, testing, and deploying the Chrome extension.

## Table of Contents

1. [Setup](#setup)
2. [Development Workflow](#development-workflow)
3. [Testing](#testing)
4. [Backend Operations](#backend-operations)
5. [Deployment](#deployment)
6. [Contributing](#contributing)
7. [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Chrome browser (latest version)
- Node.js 18+
- Git
- Text editor (VS Code recommended)
- Supabase account
- Facebook/Meta developer account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/adpilot-lovable-extension.git
cd adpilot-lovable-extension

# Install dependencies
npm install

# Start Next.js dev server
npm run dev

# In separate terminal, load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Server-only, never expose!

# Meta/Facebook (Required for OAuth and Ads API)
NEXT_PUBLIC_FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
NEXT_PUBLIC_FB_GRAPH_VERSION=v24.0

# Meta Business Login Config IDs
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM=your_system_config_id
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER=your_user_config_id
NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID=your_legacy_config_id  # Backward compatibility

# Debug Mode (Optional)
NEXT_PUBLIC_DEBUG=false  # Set to 'true' for verbose logging
```

### Chrome Extension Server Configuration

The extension can connect to different server environments. By default:
- **Packaged extensions** → Production (`www.adpilot.studio`)
- **Unpacked extensions** → Staging (`staging.adpilot.studio`)

**Override server environment:**

Open Chrome DevTools console on any Lovable project page and run:

```javascript
// Use localhost (development)
chrome.storage.local.set({adpilot_server: 'dev'})

// Use staging
chrome.storage.local.set({adpilot_server: 'staging'})

// Use production
chrome.storage.local.set({adpilot_server: 'prod'})
```

Then reload the page for changes to take effect.

### Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create new app (Type: Business)
3. Add "Facebook Login" product
4. Configure OAuth redirect: `http://localhost:3000/meta/oauth`
5. Request permissions: `ads_management`, `ads_read`, `business_management`
6. Copy App ID and App Secret to `.env.local`

### Supabase Setup

**⚠️ BACKEND OPERATION - Use MCP tools in Cursor:**

```bash
# List your projects
mcp_supabase_list_projects

# Get project details
mcp_supabase_get_project --id YOUR_PROJECT_ID

# List tables
mcp_supabase_list_tables --project_id YOUR_PROJECT_ID

# Check security
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

**Enable RLS on all tables:**

All production tables must have Row Level Security enabled. Check with:

```bash
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

If you see warnings about missing RLS, apply policies:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
ON your_table FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Storage Buckets Setup:**

The extension requires two storage buckets for image management:

1. **`ad-context-images`** - Temporary storage for user-uploaded reference images
2. **`ad-creatives`** - Permanent storage for generated/imported ad images

**Quick Setup Script:**

Run this in Supabase SQL Editor:

```sql
-- Create ad-context-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-context-images', 'ad-context-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create ad-creatives bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for ad-context-images
CREATE POLICY "Users upload context images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'ad-context-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read context images" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete context images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'ad-context-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS for ad-creatives
CREATE POLICY "Auth users upload creatives" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'ad-creatives'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read creatives" ON storage.objects 
FOR SELECT USING (bucket_id = 'ad-creatives');

CREATE POLICY "Users delete creatives" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'ad-creatives'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Verify Setup:**

```bash
# Check storage buckets exist
mcp_supabase_execute_sql \
  --project_id YOUR_PROJECT_ID \
  --query "SELECT * FROM storage.buckets WHERE id IN ('ad-context-images', 'ad-creatives')"

# Check RLS policies
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

## Development Workflow

### Making Changes

**1. Chrome Extension (manifest, content, background):**

```bash
# Edit files
# Reload extension in chrome://extensions/
# Refresh test page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

**2. Next.js App (iframe content):**

```bash
# Server auto-reloads on file changes
# Refresh iframe in browser
```

**3. Database Changes:**

⚠️ **Always use MCP tools for schema changes!**

```bash
# Create migration
mcp_supabase_apply_migration \
  --project_id YOUR_PROJECT_ID \
  --name "add_new_column" \
  --query "ALTER TABLE campaigns ADD COLUMN status text;"

# Verify migration
mcp_supabase_list_migrations --project_id YOUR_PROJECT_ID

# Generate TypeScript types
mcp_supabase_generate_typescript_types --project_id YOUR_PROJECT_ID
```

### Project Structure

```
adpilot-lovable-extension/
├── manifest.json           # Extension config
├── background/             # Service worker
├── content/               # Content scripts
│   ├── inject.js          # Main injection
│   └── styles.css         # Extension styles
├── app/                   # Next.js application
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/v1/           # API routes
│   ├── auth/             # Auth pages
│   └── meta/             # Meta OAuth
├── components/           # React components
├── lib/                  # Business logic
│   ├── ai/              # AI services
│   ├── meta/            # Meta API
│   ├── services/        # Core services
│   └── supabase/        # Supabase client
└── types/               # TypeScript types
```

### Code Style

- **JavaScript/TypeScript**: ES6+, functional components
- **Comments**: Explain WHY, not WHAT
- **Logging**: Use `[AdPilot]` prefix for extension logs
- **Validation**: Validate all inputs
- **Error handling**: Use try-catch, show user-friendly messages

**Example:**

```javascript
/**
 * Inject Ads tab into Lovable navigation
 * Evidence-based approach: finds Cloud button, traverses to parent UL
 */
function injectAdsTab() {
  console.log('[AdPilot] Injecting tab...');
  // Implementation
}
```

## Testing

### Chrome Extension Testing

**Load Extension:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension directory
5. Verify no errors

**Test on Lovable:**
1. Navigate to `lovable.dev/projects/{any-project-id}`
2. Wait for "Ads" tab to appear (5-10 seconds)
3. Click "Ads" tab
4. Verify iframe loads
5. Check console for `[AdPilot]` logs

**Expected console logs:**
```
[AdPilot] Content script loaded
[AdPilot] Lovable editor detected
[AdPilot] Tab container found, injecting Ads tab
[AdPilot] Ads tab injected successfully
```

### Comprehensive Testing Checklist

#### Root URL Landing Page (`/`)
- [ ] Page loads without errors
- [ ] Extension download CTA is visible and prominent
- [ ] Installation instructions are clear (3 numbered steps)
- [ ] Features grid displays correctly
- [ ] No sign in/sign up buttons visible
- [ ] Footer links work (Privacy, Terms)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Logo and branding display correctly

#### Extension Integration (Chrome Extension)
- [ ] Extension installs without errors
- [ ] "Grow" button appears in Lovable navigation
- [ ] Button styling matches Lovable's native buttons
- [ ] Click "Grow" button → iframe opens
- [ ] URL updates to `?view=grow`
- [ ] Iframe loads `/lovable` route
- [ ] Project context is sent to iframe via postMessage
- [ ] Works after navigation (SPA)
- [ ] Browser back/forward works

#### Authentication Flow (`/lovable` route - unauthenticated)
- [ ] Auth blocker appears immediately (no flash of content)
- [ ] Google sign-in button is prominent
- [ ] Click "Sign in with Google" → OAuth popup opens
- [ ] After successful auth → redirects back to workspace
- [ ] Auth state persists on page refresh
- [ ] No homepage elements leak into iframe view

#### Workspace Overview (`/lovable` route - authenticated)
- [ ] Loading state shows briefly
- [ ] Navigation tabs appear (Ads, Analytics, Campaigns)
- [ ] Default tab is "Ads" (workspace overview)
- [ ] Empty state shows if no ads exist
- [ ] "Create New Ad" button works
- [ ] Tab navigation works without page reload
- [ ] Campaign auto-creation works on first visit

#### Feature Pages
- [ ] Create Ad: Image generation works
- [ ] Ad Copy: Copy generation works
- [ ] Targeting: Location search works
- [ ] Budget: Budget calculation works
- [ ] Campaigns: CRUD operations work
- [ ] Analytics: Metrics display correctly

#### Meta Connection Flow (if applicable)
- [ ] If Meta not connected, shows Meta auth blocker
- [ ] Meta connection modal appears
- [ ] Can connect Facebook account
- [ ] Can select business assets
- [ ] After connection, proceeds to workspace

### Backend Testing

**⚠️ BACKEND OPERATION - Always notify user!**

**Test Database Queries:**

```bash
# Test read query
mcp_supabase_execute_sql \
  --project_id YOUR_PROJECT_ID \
  --query "SELECT * FROM campaigns LIMIT 5"

# Test with authentication context
# (Queries run as authenticated user via RLS)
```

**Test RLS Policies:**

```sql
-- Switch to specific user context
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub = 'user-uuid-here';

-- Test query (should only return that user's data)
SELECT * FROM campaigns;
```

**Verify Security:**

```bash
# Check for security issues
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security

# Check for performance issues
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type performance
```

### Authentication Testing

**Test Password Reset:**
1. Go to Settings > Profile tab
2. Click "Reset Password"
3. Check email inbox
4. Click link in email
5. Set new password
6. Log in with new password

**Test Logout:**
1. Click "Sign Out"
2. Verify redirect to home
3. Try accessing protected routes
4. Should redirect to login

**Test Account Deletion (use test account!):**
1. Create test campaign/ad
2. Go to Settings > Profile > Danger Zone
3. Click "Delete Account"
4. Confirm deletion
5. Verify:
   - Account deleted in Supabase dashboard
   - All campaigns/ads deleted
   - Cannot log in anymore

### Performance Testing

**Memory Usage:**
1. Open Chrome Task Manager: `Shift+Esc`
2. Find "Extension: AdPilot for Lovable"
3. Monitor memory usage
4. Navigate between projects
5. Verify no memory leaks
6. **Expected:** < 50MB memory usage

**Load Time:**
- Dashboard load: ~500ms
- Project auto-link: ~200ms
- Fetch ads: ~100ms
- Ad creation: ~300ms

## Backend Operations

**⚠️ CRITICAL: Always notify user before backend operations!**

### Database Operations via MCP

```bash
# List all tables
mcp_supabase_list_tables --project_id YOUR_PROJECT_ID

# Execute read query
mcp_supabase_execute_sql \
  --project_id YOUR_PROJECT_ID \
  --query "SELECT id, name, budget FROM campaigns LIMIT 10"

# Apply migration (DDL operations)
mcp_supabase_apply_migration \
  --project_id YOUR_PROJECT_ID \
  --name "create_new_table" \
  --query "CREATE TABLE my_table (...);"

# List all migrations
mcp_supabase_list_migrations --project_id YOUR_PROJECT_ID

# Generate TypeScript types
mcp_supabase_generate_typescript_types --project_id YOUR_PROJECT_ID
```

### Storage Operations

**⚠️ STORAGE OPERATION - Notify user!**

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('generated-images')
  .upload(`ads/${userId}/${Date.now()}.png`, file);

// Get public URL
const { data } = supabase.storage
  .from('generated-images')
  .getPublicUrl('path/to/file.png');
```

### RLS Policy Management

**Check current policies:**

```bash
mcp_supabase_execute_sql \
  --project_id YOUR_PROJECT_ID \
  --query "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'campaigns'"
```

**Create policy:**

```sql
CREATE POLICY "Users can view own campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Always verify after changes:**

```bash
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] RLS policies verified
- [ ] Environment variables set for production
- [ ] Manifest version updated
- [ ] Icons present and correct
- [ ] Privacy policy linked (if collecting data)

### Deploy Next.js App

**Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Option 2: Other platforms**

Build and deploy to your preferred platform:

```bash
npm run build
# Deploy 'out' directory
```

### Package Chrome Extension

```bash
# Create production build
npm run package

# Creates: dist/adpilot-lovable-extension-vX.Y.Z.zip
```

### Chrome Web Store Submission

**Prerequisites:**
- Google account
- $5 developer registration fee (one-time)
- Valid payment method
- Privacy policy URL
- Extension thoroughly tested locally
- Production environment variables configured

**Step 1: Prepare Assets**

**Screenshots (Required):**
- Small tile: 440×280 pixels
- Marquee tile: 1400×560 pixels (optional but recommended)
- Screenshots: 1280×800 or 640×400 pixels (minimum 1, maximum 5)

**Recommended screenshots:**
1. Extension button in Lovable navigation
2. Auth/Sign-in screen
3. Workspace dashboard with ads
4. Ad builder interface
5. Analytics dashboard

**Promotional Images:**
- Icon: 128×128 pixels (already exists in `assets/icon-128.png`)
- Small promotional tile: 440×280 pixels
- Large promotional tile: 920×680 pixels (optional)
- Marquee promotional tile: 1400×560 pixels (optional)

**Privacy Policy & Terms:**
- Ensure `https://yourdomain.com/privacy` is accessible
- Ensure `https://yourdomain.com/terms` is accessible
- Both are referenced in the manifest and required by Chrome Web Store

**Step 2: Update Configuration**

**Update Production URLs:**

Edit `content/inject.js`:
```javascript
// Change from:
const PROD_SERVER_URL = 'https://www.adpilot.studio/lovable';

// To your actual production URL:
const PROD_SERVER_URL = 'https://yourdomain.com/lovable';
```

**Update Chrome Store URL:**

After your extension is published, update `lib/constants.ts`:
```typescript
// Change from:
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore'

// To your extension's store page:
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
```

Your extension ID will be provided after first upload.

**Verify Manifest:**
- [ ] Version number is correct
- [ ] Name and description are finalized
- [ ] Host permissions include production URLs
- [ ] Web accessible resources are correct
- [ ] Icons are present and correct sizes

**Step 3: Package Extension**

```bash
npm run package
```

This creates `extension.zip` ready for upload. The script:
1. Validates manifest.json
2. Includes only necessary files
3. Excludes development files (.env, node_modules, etc.)
4. Creates optimized production build

**Step 4: Create Developer Account**

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Accept the developer agreement

**Step 5: Upload Extension**

1. Click "New Item" in the developer dashboard
2. Upload the `extension.zip` file
3. Wait for upload and automated checks to complete

**Step 6: Fill Out Store Listing**

**Product details:**
- **Name**: AdPilot for Lovable
- **Summary**: AI-powered Meta advertising directly in Lovable editor
- **Description**: Use the template below
- **Category**: Productivity
- **Language**: English (add others if supported)

**Detailed Description Template:**

```
Create and manage Facebook & Instagram ad campaigns directly from your Lovable editor with AI-powered features.

🎯 KEY FEATURES:
• AI-powered ad image generation (dual format: square + vertical)
• AI-powered ad copy writing with multiple tones
• Advanced audience targeting with visual map
• Budget management and scheduling
• Real-time analytics and performance tracking
• Seamless Meta (Facebook/Instagram) integration

✨ HOW IT WORKS:
1. Install the extension
2. Open any Lovable project
3. Click the "Grow" tab in navigation
4. Sign in and connect your Meta account
5. Start creating high-performing ads with AI

💡 PERFECT FOR:
• Lovable developers launching products
• SaaS founders driving user acquisition
• Local businesses expanding reach
• E-commerce stores boosting sales

🔒 SECURE & PRIVATE:
• Minimal permissions (only storage and tabs)
• No data collection or tracking
• Secure OAuth authentication
• Row-level security for multi-tenant isolation

🆓 PRICING:
• Free to install and use
• Pay only for actual Meta ad spend (standard Meta rates)
• No hidden fees or subscriptions

📚 DOCUMENTATION:
Visit https://docs.adpilot.com for guides and tutorials

Need help? Contact support@adpilot.com
```

**Privacy:**
- **Single purpose**: Creating and managing Meta advertisements
- **Permission justification**: 
  - `storage`: Save user preferences and session data
  - `tabs`: Detect when user is on Lovable projects
  - Host permissions: Load extension UI and communicate with backend
- **Privacy policy**: https://yourdomain.com/privacy
- **Terms of service**: https://yourdomain.com/terms

**Screenshots & Media:**
1. Upload all prepared screenshots
2. Add promotional tiles
3. Provide a short promotional video (optional but recommended)

**Distribution:**
- **Visibility**: Public
- **Regions**: All regions (or select specific countries)
- **Pricing**: Free

**Step 7: Submit for Review**

1. Review all information for accuracy
2. Click "Submit for Review"
3. Wait for Chrome Web Store review (typically 1-3 business days)
4. Monitor your email for review status updates

**Common Review Issues:**

**Permissions Issues:**
- Justify each permission clearly
- Remove unnecessary permissions if flagged
- Provide detailed use case for each permission

**Privacy Issues:**
- Ensure privacy policy is comprehensive
- Disclose all data collection (even if minimal)
- Explain how user data is used

**Functionality Issues:**
- Ensure extension works without errors
- Test on fresh Chrome installation
- Verify all features are functional

**Step 8: Post-Approval Steps**

Once approved, you'll receive your extension ID. Update these files:

**1. `lib/constants.ts`:**
```typescript
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
export const EXTENSION_ID = 'YOUR_EXTENSION_ID'
```

**2. Redeploy production app** with updated constants

**3. Update README.md** with actual Chrome Web Store link

**Review Timeline:** 1-3 business days

**Common Rejection Reasons:**
- Excessive permissions
- Missing privacy policy
- Unclear purpose
- Trademark issues

### Update Process

```bash
# 1. Update version in package.json and manifest.json
# 2. Create package
npm run package

# 3. Go to Developer Dashboard
# 4. Upload new .zip
# 5. Submit for review (faster than initial)
```

Users automatically get updates when approved.

## Contributing

### Pull Request Process

1. **Fork and clone:**
   ```bash
   git clone https://github.com/yourusername/adpilot-lovable-extension.git
   cd adpilot-lovable-extension
   git checkout -b feature/your-feature-name
   ```

2. **Make changes:**
   - Follow code style guidelines
   - Add JSDoc comments
   - Test thoroughly

3. **Commit:**
   ```bash
   # Use conventional commits
   git commit -m "feat: add image monitoring service"
   git commit -m "fix: resolve tab injection timing issue"
   git commit -m "docs: update README with new features"
   ```

4. **Test:**
   ```bash
   npm run validate  # Validate manifest
   # Manual testing checklist
   ```

5. **Submit PR:**
   - Describe changes
   - Include screenshots if UI changes
   - Reference related issues

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Functions have JSDoc comments
- [ ] No console errors
- [ ] Backend operations tested (if applicable)
- [ ] RLS policies verified (if database changes)
- [ ] No sensitive data exposed
- [ ] Extension works on Lovable
- [ ] Tests passing

## Troubleshooting

### Extension Issues

**Problem:** Extension doesn't load
- **Check:** Manifest validation errors
- **Solution:** Run `npm run validate`

**Problem:** Tab doesn't appear on Lovable
- **Check:** Console for errors
- **Solution:** Verify URL matches pattern in manifest
- **Debug:** Check `[AdPilot]` logs in console

**Problem:** iframe doesn't load
- **Check:** CORS, URL correctness
- **Solution:** Verify iframe src in `content/inject.js`
- **Check:** `web_accessible_resources` in manifest

**Problem:** postMessage not working
- **Check:** Origin validation
- **Solution:** Verify origin checks in both content script and iframe

### Next.js Issues

**Problem:** Environment variables not loading
- **Check:** `.env.local` exists and has correct format
- **Solution:** Restart dev server
- **Note:** Use `NEXT_PUBLIC_` prefix for client-side vars

**Problem:** Supabase connection error
- **Check:** URL and anon key correct
- **Solution:** Verify in `lib/env.ts`
- **Test:** Try query in Supabase dashboard

### Database Issues

**Problem:** RLS blocking queries
- **Check:** User is authenticated
- **Solution:** Verify RLS policies allow the operation
- **Debug:** Check advisors: `mcp_supabase_get_advisors --type security`

**Problem:** Migration fails
- **Check:** SQL syntax, constraints
- **Solution:** Test query first with `execute_sql`
- **Rollback:** Revert migration if needed

**Problem:** Storage upload fails
- **Check:** Bucket permissions, file size, content-type
- **Solution:** Verify storage policies in Supabase dashboard

### Performance Issues

**Problem:** High memory usage
- **Check:** Memory leaks, observers not disconnected
- **Solution:** Use Chrome Task Manager to identify source
- **Fix:** Disconnect observers, clean up listeners

**Problem:** Slow queries
- **Check:** Missing indexes, inefficient queries
- **Solution:** Run performance advisor
- **Optimize:** Add indexes, use proper joins

## Architecture Overview

### Architecture Principles

1. **Feature-Based**: Each marketing capability has its own dedicated page
2. **No Chat Interface**: Direct UI interactions instead of conversational AI
3. **Lovable-Only**: Focused exclusively on Lovable editor integration
4. **Service-Driven**: Direct API calls using custom hooks
5. **Context-Based State**: React Context for state management

### Core Features

1. **Dashboard** (`/lovable/page.tsx`) - Feature grid with 6 marketing tools
2. **Create Ad** (`/lovable/create-ad/page.tsx`) - AI-powered dual-format image generation
3. **Ad Copy** (`/lovable/copy/page.tsx`) - AI copy generation with multiple variations
4. **Targeting** (`/lovable/targeting/page.tsx`) - Location search and selection
5. **Budget & Schedule** (`/lovable/budget/page.tsx`) - Daily vs lifetime budget
6. **Campaigns** (`/lovable/campaigns/page.tsx`) - Campaign list view
7. **Analytics** (`/lovable/analytics/page.tsx`) - Performance metrics dashboard

### Technical Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+ (Server and Client Components)
- TypeScript (Full type safety)
- Tailwind CSS (Styling)
- shadcn/ui (Component library)

**Backend:**
- Supabase (PostgreSQL database, Auth, Storage)
- Meta API (Facebook/Instagram ads integration)
- AI Services (Image and copy generation)

**Extension:**
- Manifest V3 (Chrome extension)
- Content Script (DOM injection)
- Service Worker (Minimal background processing)

### Component Structure

```
components/
├── lovable/
│   ├── lovable-navigation.tsx    # Tab navigation
│   ├── lovable-layout.tsx        # Shared layout with auth
│   ├── feature-card.tsx          # Dashboard feature cards
│   └── progress-stepper.tsx      # Multi-step indicators
├── ui/                           # shadcn/ui components
└── [feature-specific]/           # Components for each feature
```

### Service Hooks

```
lib/hooks/
├── use-location-search.ts        # Location targeting
├── use-image-generation.ts       # AI image generation
├── use-copy-generation.ts       # AI copy generation
├── use-campaign-operations.ts   # Campaign CRUD
└── use-meta-metrics.ts          # Analytics data
```

### Navigation Flow

1. User opens Lovable project
2. Extension injects "Grow" tab
3. Click opens iframe at `/lovable` (dashboard)
4. Dashboard shows 6 feature cards
5. Click card navigates to feature page
6. Navigation tabs persist across pages

### Authentication Flow

1. Check Google Auth (via Supabase)
2. Create/load campaign for Lovable project
3. Check Meta connection (if required by page)
4. Show feature page when ready

## Quick Reference

### Chrome Store URL Configuration

**Single Location to Update After Publishing:**

When your Chrome extension is approved, update **ONLY THIS FILE**:

**`lib/constants.ts`**

```typescript
// Update this constant with your extension's store URL
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
```

**That's it!** This constant is automatically used in:
- Landing page (`app/page.tsx`) - Download button
- Documentation files
- Any other references across the app

**Publishing Workflow:**

1. **Before Publishing:**
   - Test locally: `npm run dev`
   - Package extension: `npm run package`
   - Submit to Chrome Web Store

2. **After Approval:**
   - Update `CHROME_STORE_URL` in `lib/constants.ts`
   - Redeploy production app
   - Done!

3. **Optional Updates:**
   - Update production iframe URL in `content/inject.js`
   - Update `EXTENSION_ID` in `lib/constants.ts`

### Pre-Flight Checklist

Before deploying to production:

- [ ] Test extension locally works perfectly
- [ ] All features tested in Lovable
- [ ] Auth flow works smoothly
- [ ] Meta connection works
- [ ] Can create and publish ads
- [ ] Analytics display correctly
- [ ] No console errors
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Privacy policy accessible at `/privacy`
- [ ] Terms of service accessible at `/terms`

## Resources

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Meta API Docs](https://developers.facebook.com/docs/graph-api)

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/yourusername/adpilot-lovable-extension/issues)
- **Email:** support@adpilot.com
- **Docs:** See CURSOR_RULES.md for detailed patterns

---

**Happy coding!** 🚀

