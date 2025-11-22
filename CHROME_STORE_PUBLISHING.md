# Chrome Web Store Publishing Guide

This guide covers the complete process of publishing the AdPilot for Lovable extension to the Chrome Web Store.

## Prerequisites

- [ ] Extension has been thoroughly tested locally
- [ ] All features are working correctly
- [ ] Production environment variables are configured
- [ ] Meta/Facebook app is approved for production
- [ ] Supabase project is in production mode
- [ ] Payment/billing is set up if required

## Step 1: Prepare Assets

### 1.1 Screenshots (Required)
Create screenshots of your extension in action:

- **Small tile**: 440x280 pixels
- **Marquee tile**: 1400x560 pixels (optional but recommended)
- **Screenshots**: 1280x800 or 640x400 pixels (minimum 1, maximum 5)

**Recommended screenshots:**
1. Extension button in Lovable navigation
2. Auth/Sign-in screen
3. Workspace dashboard with ads
4. Ad builder interface
5. Analytics dashboard

Save screenshots in `assets/chrome-store/` directory.

### 1.2 Promotional Images
- **Icon**: 128x128 pixels (already exists in `assets/icon-128.png`)
- **Small promotional tile**: 440x280 pixels
- **Large promotional tile**: 920x680 pixels (optional)
- **Marquee promotional tile**: 1400x560 pixels (optional)

### 1.3 Privacy Policy & Terms
- Ensure `https://yourdomain.com/privacy` is accessible
- Ensure `https://yourdomain.com/terms` is accessible
- Both are referenced in the manifest and required by Chrome Web Store

## Step 2: Update Configuration

### 2.1 Update Production URLs

Edit `content/inject.js`:
```javascript
// Change from:
const PROD_SERVER_URL = 'https://www.adpilot.studio/lovable';

// To your actual production URL:
const PROD_SERVER_URL = 'https://yourdomain.com/lovable';
```

### 2.2 Update Chrome Store URL

After your extension is published, update `lib/constants.ts`:
```typescript
// Change from:
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore'

// To your extension's store page:
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
```

Your extension ID will be provided after first upload.

### 2.3 Verify Manifest
Check `manifest.json` for production readiness:
- [ ] Version number is correct
- [ ] Name and description are finalized
- [ ] Host permissions include production URLs
- [ ] Web accessible resources are correct
- [ ] Icons are present and correct sizes

## Step 3: Package Extension

Run the packaging script:
```bash
npm run package
```

This creates `extension.zip` ready for upload. The script:
1. Validates manifest.json
2. Includes only necessary files
3. Excludes development files (.env, node_modules, etc.)
4. Creates optimized production build

## Step 4: Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Accept the developer agreement

## Step 5: Upload Extension

### 5.1 Initial Upload
1. Click "New Item" in the developer dashboard
2. Upload the `extension.zip` file
3. Wait for upload and automated checks to complete

### 5.2 Fill Out Store Listing

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

## Step 6: Submit for Review

1. Review all information for accuracy
2. Click "Submit for Review"
3. Wait for Chrome Web Store review (typically 1-3 days)
4. Monitor your email for review status updates

### Common Review Issues

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

## Step 7: Post-Approval Steps

### 7.1 Update Configuration
Once approved, you'll receive your extension ID. Update these files:

**1. `lib/constants.ts`:**
```typescript
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
export const EXTENSION_ID = 'YOUR_EXTENSION_ID'
```

**2. Redeploy production app** with updated constants

**3. Update README.md** with actual Chrome Web Store link

### 7.2 Promote Your Extension
- Update landing page (`app/page.tsx`) with real Chrome Web Store link
- Announce on social media
- Add to Lovable community/forums
- Create tutorial videos
- Write blog posts about features

### 7.3 Monitor Performance
- Check Chrome Web Store analytics daily
- Monitor user reviews and ratings
- Track installation metrics
- Gather user feedback

## Step 8: Maintaining Your Extension

### Updates
When publishing updates:
1. Increment version in `manifest.json`
2. Run `npm run package`
3. Upload new zip to Chrome Web Store dashboard
4. Update changelog with new features/fixes
5. Submit for review

**Note:** Updates are typically reviewed faster than initial submissions.

### User Support
- Respond to user reviews (both positive and negative)
- Address reported issues promptly
- Keep extension description up-to-date
- Maintain active support channels

### Metrics to Track
- Install count
- Active users (daily/weekly)
- User ratings and reviews
- Uninstall rate
- Support ticket volume

## Troubleshooting

### Extension Rejected

**"Minimal Permissions" violation:**
- Review requested permissions
- Remove any unused permissions
- Provide clear justification for each permission

**"Deceptive Behavior" violation:**
- Ensure all functionality is clearly described
- Don't promise features not yet implemented
- Be transparent about data collection

**"User Data Privacy" violation:**
- Update privacy policy to be more specific
- Disclose all data collection and usage
- Implement privacy best practices

### Extension Not Working After Publish

1. Clear browser cache and reinstall extension
2. Check production URLs are correct
3. Verify environment variables are set
4. Check browser console for errors
5. Test with fresh user account

## Checklist Before Submission

- [ ] Extension tested thoroughly in production environment
- [ ] All screenshots and promotional images prepared
- [ ] Privacy policy and terms accessible
- [ ] Production URLs configured correctly
- [ ] Manifest version incremented
- [ ] Extension packaged with `npm run package`
- [ ] All features working correctly
- [ ] No console errors or warnings
- [ ] Permissions justified in listing
- [ ] Store listing description complete
- [ ] Support email configured
- [ ] Documentation available online

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Best Practices](https://developer.chrome.com/docs/webstore/best-practices/)

## Support

If you encounter issues during the publishing process:
- Review Chrome Web Store policies thoroughly
- Contact Chrome Web Store developer support
- Check community forums for similar issues
- Consult the extension's GitHub issues

---

**Good luck with your Chrome Web Store submission!**

