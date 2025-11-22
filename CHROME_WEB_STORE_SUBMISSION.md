# Chrome Web Store Submission Guide

Final steps to package and submit AdPilot for Lovable to the Chrome Web Store.

## Prerequisites Checklist

- [ ] Production backend deployed and tested
- [ ] Extension tested with production backend
- [ ] All features working correctly
- [ ] Screenshots captured (5 images)
- [ ] Promotional images created
- [ ] Privacy policy accessible at `/privacy`
- [ ] Terms of service accessible at `/terms`
- [ ] Chrome Developer account created ($5 one-time fee)
- [ ] Support email configured

## Step 1: Final Pre-Flight Check

### 1.1 Verify Production Configuration

```bash
# Check current version
cat manifest.json | grep version

# Should show: "version": "1.0.0"
```

### 1.2 Run Validation

```bash
# Validate manifest for production
node scripts/validate-manifest.js manifest.production.json --production
```

Expected output:
```
✅ Manifest is valid!
```

Fix any errors before proceeding.

### 1.3 Test Extension One More Time

Load unpacked extension and verify:
- [ ] Loads in Lovable without errors
- [ ] Iframe connects to production
- [ ] Authentication works
- [ ] Can create campaign
- [ ] All buttons functional
- [ ] No console errors

## Step 2: Package for Submission

### 2.1 Create Production Build

```bash
# Create production package
./scripts/package.sh production
```

Expected output:
```
📦 Packaging AdPilot for Lovable extension...
🌍 Environment: production
✅ Validating manifest...
📦 Creating adpilot-lovable-extension-v1.0.0.zip...
✅ Package created: dist/adpilot-lovable-extension-v1.0.0.zip

📊 Package info:
-rw-r--r--  1 user  staff   245K Nov 22 10:30 dist/adpilot-lovable-extension-v1.0.0.zip

🚀 Production package ready for Chrome Web Store!
```

### 2.2 Verify Package Contents

```bash
# List contents
unzip -l dist/adpilot-lovable-extension-v1.0.0.zip
```

Should include:
- ✅ manifest.json (production version, no dev URLs)
- ✅ background/service-worker.js
- ✅ content/inject.js
- ✅ content/styles.css
- ✅ assets/*.png (icons)
- ✅ ui/panel.html
- ✅ types/*.ts (if included)

Should NOT include:
- ❌ node_modules/
- ❌ .git/
- ❌ .env files
- ❌ Development configuration files
- ❌ localhost URLs in manifest

### 2.3 Final Size Check

```bash
ls -lh dist/adpilot-lovable-extension-v1.0.0.zip
```

Package size should be:
- **Target:** < 500 KB
- **Maximum:** 2 MB

If larger than 2MB, you'll need to optimize.

## Step 3: Prepare Store Listing

### 3.1 Collect Required Information

#### Basic Information
- **Name:** AdPilot for Lovable
- **Short Name:** AdPilot
- **Summary:** (Maximum 132 characters)
  ```
  AI-powered Meta advertising directly in Lovable editor. Create, manage, and optimize Facebook & Instagram ads seamlessly.
  ```

#### Detailed Description
(See template below)

#### Category
- **Primary:** Productivity
- **Secondary:** (optional) Developer Tools

#### Language
- English (US)

#### Privacy Information
- **Privacy Policy URL:** `https://www.adpilot.studio/privacy`
- **Terms of Service URL:** `https://www.adpilot.studio/terms`

#### Support
- **Support URL:** `https://www.adpilot.studio/lovable`
- **Support Email:** `support@adpilot.studio` (or your email)

#### Permissions Justification
```
This extension requires the following permissions:

1. storage: Store user preferences and session data locally
   - Why: Maintain extension state and user settings across sessions
   
2. tabs: Detect when user is on Lovable projects
   - Why: Only inject extension UI when on Lovable project pages

3. Host permissions (lovable.dev, *.lovable.dev):
   - Why: Inject extension UI into Lovable editor

4. Host permissions (*.supabase.co, www.adpilot.studio):
   - Why: Communicate with backend API and database for ad management

This extension follows minimal permissions best practices.
No data is collected or shared with third parties.
```

### 3.2 Detailed Description Template

```markdown
Transform your Lovable projects into thriving businesses with AI-powered Meta advertising.

AdPilot integrates seamlessly into the Lovable editor, giving you professional ad creation tools right where you build your products.

🎯 KEY FEATURES:

✨ AI-Powered Creation
• Generate stunning ad images with dual formats (square + vertical)
• Write compelling copy with multiple tone options
• Leverage Lovable's AI to create professional ad visuals
• Get variations and optimizations instantly

📊 Smart Campaign Management
• Intuitive ad builder with step-by-step workflow
• Visual audience targeting with interactive maps
• Budget management and scheduling tools
• Real-time analytics and performance tracking

🎨 Professional Design
• Beautiful, modern interface
• Seamless integration with Lovable UI
• One-click navigation between code and ads
• Preview ads before publishing

🔐 Secure & Reliable
• Minimal permissions (only what's needed)
• Row-level security for multi-tenant isolation
• No data collection or tracking
• Secure OAuth authentication
• Enterprise-grade infrastructure

💼 PERFECT FOR:

• Lovable developers launching products
• SaaS founders driving user acquisition
• Local businesses expanding reach
• E-commerce stores boosting sales
• Digital marketers managing campaigns
• Agencies serving multiple clients

🚀 HOW IT WORKS:

1. Install the extension
2. Open any Lovable project
3. Click the "Grow" tab in navigation
4. Sign in and connect your Meta account
5. Create your first AI-powered ad campaign
6. Monitor performance with real-time analytics

💡 WHAT YOU CAN DO:

• Create Facebook & Instagram ad campaigns
• Generate ad images using Lovable's AI
• Write compelling ad copy with AI assistance
• Target audiences with precision
• Set budgets and schedules
• Track performance metrics
• Manage multiple campaigns
• Optimize based on real-time data

🆓 PRICING:

• Free to install and use
• No hidden fees or subscriptions
• Pay only for actual Meta ad spend (standard Meta rates)
• No markup on advertising costs

📚 SUPPORT & DOCUMENTATION:

• Comprehensive documentation available
• Responsive support team
• Regular updates and improvements
• Feature requests welcomed

📈 TRUSTED BY LOVABLE DEVELOPERS:

Join thousands of Lovable developers who have successfully launched and grown their projects with AdPilot.

Start growing your Lovable project today!

Need help? Contact support@adpilot.studio
Visit https://www.adpilot.studio/lovable for more information.

---

IMPORTANT: This extension requires a Meta Business account and appropriate advertising permissions. Standard Meta ad policies and billing apply.
```

### 3.3 Screenshots

Ensure you have 5 screenshots ready in `assets/chrome-store/`:
1. `01-lovable-navigation.png` - Extension button in navigation
2. `02-auth-signin.png` - Authentication screen
3. `03-dashboard.png` - Campaign dashboard
4. `04-ad-builder.png` - Ad creation interface
5. `05-analytics.png` - Analytics dashboard

All screenshots should be:
- **Dimensions:** 1280x800 pixels
- **Format:** PNG
- **Size:** < 5MB each
- **Professional** quality with no errors visible

### 3.4 Promotional Images

Optional but recommended:
- Small tile: `promo-small.png` (440x280)
- Large tile: `promo-large.png` (920x680)
- Marquee tile: `promo-marquee.png` (1400x560)

## Step 4: Submit to Chrome Web Store

### 4.1 Access Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account
3. If first time:
   - Pay $5 developer registration fee
   - Accept developer agreement

### 4.2 Create New Item

1. Click "New Item" button
2. Click "Choose file" and select:
   ```
   dist/adpilot-lovable-extension-v1.0.0.zip
   ```
3. Click "Upload"
4. Wait for upload and automated checks (1-2 minutes)

**Automated Checks:**
- Manifest validation
- File structure validation
- Permission analysis
- Security scan

If checks fail, fix issues and re-upload.

### 4.3 Fill Out Store Listing

#### Product Details Tab

1. **Detailed Description:**
   - Paste the detailed description from above
   - Preview to ensure formatting looks good

2. **Category:**
   - Primary: Productivity

3. **Language:**
   - English (United States)

#### Store Listing Tab

1. **Product Icon:**
   - Already included in package (128x128)
   - Preview should show your icon

2. **Screenshots:**
   - Click "Add images"
   - Upload all 5 screenshots in order
   - Drag to reorder if needed
   - Add captions (optional):
     - "Seamless integration with Lovable editor"
     - "Quick sign-in with Google OAuth"
     - "Manage campaigns in beautiful dashboard"
     - "AI-powered ad creation workflow"
     - "Real-time analytics and insights"

3. **Promotional Tiles:**
   - Small tile: Upload `promo-small.png`
   - Large tile: Upload `promo-large.png` (if available)
   - Marquee: Upload `promo-marquee.png` (if available)

4. **YouTube Video:** (optional)
   - Add demo video URL if available

#### Privacy Tab

1. **Single Purpose:**
   ```
   Create and manage Meta (Facebook/Instagram) advertising campaigns directly from the Lovable editor with AI-powered tools.
   ```

2. **Permission Justifications:**
   - Paste justifications from section 3.1 above

3. **Are you using remote code?**
   - No

4. **Data Usage:**
   - User authentication data (email, name)
   - Campaign and ad data
   - Analytics data
   - All data is encrypted and stored securely
   - No data shared with third parties

5. **Privacy Policy URL:**
   ```
   https://www.adpilot.studio/privacy
   ```

6. **Terms of Service URL:** (optional)
   ```
   https://www.adpilot.studio/terms
   ```

#### Distribution Tab

1. **Visibility:**
   - Public

2. **Regions:**
   - All regions (or select specific countries)

3. **Pricing:**
   - Free

### 4.4 Preview Listing

1. Click "Preview" button (top-right)
2. Review how it will appear in store
3. Check:
   - [ ] Name displays correctly
   - [ ] Icon looks good
   - [ ] Screenshots display properly
   - [ ] Description is formatted correctly
   - [ ] All information is accurate

### 4.5 Submit for Review

1. Click "Submit for Review" button
2. Confirm submission
3. Note submission time and date

**Review Timeline:**
- Typical: 1-3 business days
- Complex cases: Up to 7 days
- May be faster for first submission

**What Happens Next:**
- Automated security scan
- Manual review by Chrome team
- Check for policy violations
- Test basic functionality
- Email notification of status

## Step 5: Monitor Submission

### 5.1 Check Status

Check email and dashboard regularly:
- **Published:** Extension is live! 🎉
- **Pending:** Still under review
- **Rejected:** Issues found (see feedback)
- **Needs Clarification:** Reviewer has questions

### 5.2 Common Rejection Reasons

1. **Permissions Too Broad:**
   - Reduce unnecessary permissions
   - Add clearer justifications

2. **Privacy Policy Issues:**
   - Ensure policy is comprehensive
   - Cover all data collection
   - Must be accessible without login

3. **Deceptive Behavior:**
   - Ensure description is accurate
   - Don't promise unavailable features
   - Be transparent

4. **Functionality Issues:**
   - Test thoroughly before submission
   - Fix all bugs
   - Ensure core features work

### 5.3 If Rejected

1. Read rejection email carefully
2. Address all issues mentioned
3. Update code/listing as needed
4. Increment version number (1.0.0 → 1.0.1)
5. Create new package
6. Resubmit with changes documented

## Step 6: Post-Approval

### 6.1 Extension is Published! 🎉

When approved, you'll receive email with:
- Extension ID (e.g., `abcdefghijklmnopqrstuv`)
- Chrome Web Store URL
- Publication time

### 6.2 Note Extension ID

Save your extension ID and URL:
```bash
# Extension ID
EXTENSION_ID="your-extension-id-here"

# Chrome Web Store URL
https://chrome.google.com/webstore/detail/adpilot-for-lovable/${EXTENSION_ID}
```

### 6.3 Update Documentation

Update these files with actual Chrome Web Store URL:

**README.md:**
```markdown
## Installation

Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_ID)
```

**lib/constants.ts:**
```typescript
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_ID'
export const EXTENSION_ID = 'YOUR_ID'
```

### 6.4 Announce Launch

1. Update website with store link
2. Post on social media
3. Email existing users/waitlist
4. Submit to extension directories
5. Post in Lovable community

### 6.5 Monitor Performance

**First 24 Hours:**
- Check install count
- Monitor reviews/ratings
- Watch for bug reports
- Check error logs

**First Week:**
- Respond to reviews
- Fix any reported issues
- Gather user feedback
- Plan first update

## Step 7: Future Updates

### Updating the Extension

When releasing updates:

1. **Increment Version:**
   ```json
   "version": "1.0.1"  // or "1.1.0", "2.0.0"
   ```

2. **Update Changelog:**
   Document changes in CHANGELOG.md

3. **Package New Version:**
   ```bash
   ./scripts/package.sh production
   ```

4. **Upload to Chrome Web Store:**
   - Go to Developer Dashboard
   - Select your extension
   - Click "Upload Updated Package"
   - Upload new zip file
   - Submit for review

5. **Review Process:**
   - Updates typically reviewed faster (few hours to 1 day)
   - Users auto-update within 24-48 hours

## Troubleshooting

### Submission Issues

**"Package invalid":**
- Check manifest format
- Verify all referenced files exist
- Run validation script

**"Permissions too broad":**
- Review and minimize permissions
- Add detailed justifications

**"Privacy policy required":**
- Ensure URL is accessible
- Policy must be comprehensive
- No login required to view

**"Cannot verify functionality":**
- Ensure extension works without configuration
- Provide test account if needed
- Add clear instructions in listing

### Post-Publication Issues

**Low install rate:**
- Improve store listing (better screenshots, description)
- Promote extension (social media, forums)
- Get user reviews
- Update regularly

**High uninstall rate:**
- Check for bugs
- Gather user feedback
- Improve onboarding
- Fix usability issues

**Negative reviews:**
- Respond professionally
- Fix reported issues quickly
- Release updates regularly
- Show you care about users

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best-practices/)
- [Review Guidelines](https://developer.chrome.com/docs/webstore/review-process/)
- [Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## Final Checklist

Before clicking "Submit":

- [ ] Production backend deployed and tested
- [ ] Extension packaged for production
- [ ] Manifest validated
- [ ] All screenshots uploaded
- [ ] Description complete and accurate
- [ ] Privacy policy accessible
- [ ] Permissions justified
- [ ] Support email configured
- [ ] Preview looks good
- [ ] Testing completed successfully
- [ ] Team notified of submission
- [ ] Monitoring set up

**Good luck with your submission!** 🚀

---

**Submitted by:** ___________________________  
**Date:** ___________________________  
**Version:** 1.0.0  
**Submission ID:** ___________________________

