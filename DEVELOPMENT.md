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

Create `.env.local`:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Server-only, never expose!

# Meta/Facebook (Required for OAuth)
NEXT_PUBLIC_FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FB_PIXEL_ID=your_meta_pixel_id  # Optional

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Tab appears on Lovable
- [ ] Clicking tab opens panel
- [ ] Project context detected
- [ ] Iframe loads correctly
- [ ] postMessage works
- [ ] No console errors
- [ ] Works after navigation (SPA)
- [ ] Browser back/forward works

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

**Steps:**

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in and pay registration fee
3. Click "New Item"
4. Upload .zip file
5. Fill store listing:
   - Name: AdPilot for Lovable
   - Summary: Create Meta ads directly in Lovable (max 132 chars)
   - Description: (see below)
   - Category: Productivity
   - Screenshots: At least 1 (1280×800 or 640×400)
   - Small tile: 440×280
   - Icons: Already included in package
6. Set pricing: Free
7. Select regions: All regions
8. Add privacy practices disclosure
9. Submit for review

**Description Template:**

```
Turn your Lovable project into a business with AdPilot.

Create and manage Facebook & Instagram ads directly in Lovable - no need to leave your editor.

✅ NATIVE LOVABLE INTEGRATION
• Adds an "Ads" tab to your Lovable editor
• Matches Lovable's UI perfectly
• Feels like it's part of Lovable

✅ AI-POWERED AD CREATION
• Use Lovable's AI to generate ad images
• AI-written ad copy optimized for Meta
• Smart targeting recommendations

✅ FULL CAMPAIGN MANAGEMENT
• Create campaigns in minutes
• Track performance in real-time
• Manage multiple ads from one place

PERFECT FOR
• Lovable builders launching products
• Solo founders testing ideas
• Agencies managing client projects

GET STARTED IN 3 MINUTES
1. Install extension
2. Connect your Meta account
3. Create your first ad

No marketing experience required.
```

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

