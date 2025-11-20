# Deployment Guide - Chrome Web Store

## Prerequisites

1. **Google Account** for Chrome Web Store
2. **$5 Developer Registration Fee** (one-time)
3. **Valid Payment Method**
4. **Privacy Policy URL** (if extension collects data)

## Step 1: Chrome Web Store Registration

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account
3. Pay $5 registration fee
4. Verify identity

## Step 2: Prepare Extension

### 2.1 Update Version

```bash
# Update version in both files
# package.json
"version": "1.0.0"

# manifest.json  
"version": "1.0.0"
```

### 2.2 Create Package

```bash
npm run package
# Creates: dist/adpilot-lovable-extension-v1.0.0.zip
```

### 2.3 Prepare Assets

**Required:**
- [ ] Extension .zip file
- [ ] 128×128 icon (already have)
- [ ] 1280×800 screenshot (or 640×400)
- [ ] 440×280 small promo tile
- [ ] 920×680 marquee promo tile (optional)
- [ ] 1400×560 large promo tile (optional)

**Screenshot Guidelines:**
- Show extension in action on Lovable
- Highlight key features
- Must be PNG or JPEG
- Maximum 5 screenshots

## Step 3: Store Listing

### 3.1 Item Details

- **Name:** AdPilot for Lovable
- **Summary:** Create Meta ads directly in Lovable (max 132 chars)
- **Description:** (see below)
- **Category:** Productivity
- **Language:** English (US)

### 3.2 Description Template

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

✅ EASY SIGNUP TRACKING
• One-click Edge Function setup
• Track signups automatically
• See which ads drive conversions

PRICING
$9/month subscription (billed separately)
• Unlimited campaigns
• Unlimited ads
• Full analytics
• Priority support

PERFECT FOR
• Lovable builders launching products
• Solo founders testing ideas
• Agencies managing client projects
• Anyone who wants simple, effective ads

GET STARTED IN 3 MINUTES
1. Install extension
2. Connect your Meta account
3. Create your first ad

No marketing experience required.

SUPPORT
Email: support@adpilot.com
Docs: https://docs.adpilot.com/lovable
```

### 3.3 Privacy Policy

**If extension collects data:**
- Host privacy policy at: `https://adpilot.com/privacy`
- Link in store listing
- Link in manifest.json

## Step 4: Submit Extension

1. **Go to** [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **Click** "New Item"
3. **Upload** .zip file
4. **Fill** store listing:
   - Item details
   - Description
   - Screenshots
   - Category
5. **Set** pricing: Free (subscription handled separately)
6. **Set** regions: All regions
7. **Add** Privacy practices disclosure
8. **Submit** for review

## Step 5: Review Process

**Timeline:** 1-3 business days (typically)

**Status:**
- ⏳ Pending review
- ✅ Approved → Published automatically
- ❌ Rejected → Fix issues and resubmit

**Common Rejection Reasons:**
- Excessive permissions
- Missing privacy policy
- Unclear purpose
- Trademark issues
- Policy violations

## Step 6: Post-Publication

### 6.1 Monitor

- Check reviews
- Monitor crash reports
- Track installations

### 6.2 Update Process

**For Updates:**
1. Update version in package.json & manifest.json
2. Run `npm run package`
3. Go to Developer Dashboard
4. Upload new .zip
5. Submit for review (faster than initial)

**Auto-Updates:**
Users automatically get updates when approved.

## Store Listing Checklist

- [ ] Extension .zip created and validated
- [ ] manifest.json version updated
- [ ] Screenshots created (at least 1)
- [ ] Small tile created (440×280)
- [ ] Description written
- [ ] Category selected
- [ ] Privacy policy linked (if needed)
- [ ] Permissions justified
- [ ] All icons present
- [ ] No external code execution
- [ ] Follows Chrome Web Store policies

## References

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best-practices/)
- [Publishing Tutorial](https://developer.chrome.com/docs/webstore/publish/)

