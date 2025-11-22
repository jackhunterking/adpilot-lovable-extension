# Production Testing Checklist

This comprehensive checklist ensures the AdPilot for Lovable extension is production-ready before Chrome Web Store submission.

## Pre-Deployment Testing

### Backend Verification

- [ ] Production backend deployed to Vercel
- [ ] SSL certificate valid for `www.adpilot.studio`
- [ ] Verify headers with `curl -I https://www.adpilot.studio/lovable`
  - [ ] Contains: `Content-Security-Policy: frame-ancestors...`
  - [ ] Does NOT contain: `X-Frame-Options: deny`
- [ ] Environment variables configured in Vercel
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_FB_APP_ID`
  - [ ] `FB_APP_SECRET`
  - [ ] `NEXT_PUBLIC_FB_GRAPH_VERSION`
  - [ ] `NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_SYSTEM`
  - [ ] `NEXT_PUBLIC_FB_BIZ_LOGIN_CONFIG_ID_USER`

### Database (Supabase) Verification

- [ ] RLS policies enabled on all tables
- [ ] Security advisor shows no critical issues
- [ ] Performance advisor shows no major issues
- [ ] Storage buckets configured correctly
- [ ] Authentication providers enabled (Google OAuth)
- [ ] Test user account created for testing

### Meta/Facebook Integration

- [ ] Facebook App approved for production
- [ ] App is in "Live" mode (not Development)
- [ ] Business Login configuration approved
- [ ] Required permissions granted:
  - [ ] `ads_management`
  - [ ] `ads_read`
  - [ ] `business_management`
- [ ] Payment method verified in Meta Business

## Extension Testing

### 1. Installation & Loading

- [ ] Extension package created with `npm run package production`
- [ ] Manifest validates without errors
- [ ] No development URLs in production manifest
- [ ] Extension loads in Chrome without errors
- [ ] Extension loads in Edge without errors
- [ ] Extension loads in Brave without errors
- [ ] All icons display correctly (16px, 48px, 128px)

### 2. Lovable Editor Integration

- [ ] Extension button appears in Lovable navigation
- [ ] Button positioned correctly (last in navigation list)
- [ ] Button icon displays correctly
- [ ] Button hover state works
- [ ] Button click navigates to `?view=grow`
- [ ] URL updates correctly with `?view=grow` parameter
- [ ] Browser back button returns to previous view
- [ ] Browser forward button returns to Grow view

### 3. Iframe Connection

- [ ] Iframe loads from production URL
- [ ] No X-Frame-Options errors in console
- [ ] No 401 authentication errors
- [ ] No CORS errors
- [ ] Iframe displays content correctly
- [ ] Iframe responsive to window resize
- [ ] No console errors or warnings
- [ ] Page load time < 3 seconds

### 4. Project Context

- [ ] Extension detects Lovable project ID correctly
- [ ] Project context sent to iframe on load
- [ ] Context includes correct project ID
- [ ] Context includes correct project URL
- [ ] Context includes correct timestamp
- [ ] Message received by iframe (check iframe console)

### 5. Authentication Flow

- [ ] Sign-in button displays
- [ ] Google OAuth popup opens
- [ ] OAuth flow completes successfully
- [ ] User redirected back to extension
- [ ] Session persists after page refresh
- [ ] Sign-out button works
- [ ] Session cleared after sign-out
- [ ] Protected routes redirect to auth

### 6. Meta Account Connection

- [ ] Connect Meta Account button displays
- [ ] Meta OAuth popup opens
- [ ] Meta permissions requested correctly
- [ ] User can grant permissions
- [ ] Connection success message displays
- [ ] Meta account info saved to database
- [ ] Can disconnect and reconnect

### 7. Campaign Creation

- [ ] Can create new campaign
- [ ] Campaign name validates correctly
- [ ] Goal selection works (leads/calls/visits)
- [ ] Campaign saves to database
- [ ] Can view campaign in dashboard
- [ ] Can edit campaign details
- [ ] Can delete campaign (with confirmation)

### 8. Ad Creation Workflow

#### Copy Generation
- [ ] AI prompt input accepts text
- [ ] AI generation button works
- [ ] Multiple tone options available
- [ ] Generated copy displays correctly
- [ ] Can regenerate with different tone
- [ ] Can edit generated copy
- [ ] Copy saves to database

#### Image Generation via Lovable AI
- [ ] "Generate Images" button works
- [ ] Prompt injected into Lovable AI chat
- [ ] Lovable AI generates images
- [ ] Extension detects generated images
- [ ] Images appear in extension UI
- [ ] Both formats generated (square + vertical)
- [ ] Can select images for ad

#### Target Audience
- [ ] Location map displays correctly
- [ ] Can search for locations
- [ ] Can add multiple locations
- [ ] Location radius adjustable
- [ ] Age range inputs work
- [ ] Gender selection works
- [ ] Interest targeting works
- [ ] Audience size estimates display

#### Budget & Schedule
- [ ] Daily budget input validates
- [ ] Total budget input validates
- [ ] Start date picker works
- [ ] End date picker works
- [ ] Timezone selection works
- [ ] Budget warnings display correctly

### 9. Ad Publishing

- [ ] Review screen shows all ad details
- [ ] Payment connection check works
- [ ] Can add payment method in Meta
- [ ] Publish button enabled when ready
- [ ] Ad submits to Meta API successfully
- [ ] Success message displays
- [ ] Meta ad ID saved to database
- [ ] Can view ad in Meta Ads Manager

### 10. Dashboard & Analytics

- [ ] Dashboard loads with user's campaigns
- [ ] Campaign cards display correctly
- [ ] Ad metrics display (impressions, clicks, etc.)
- [ ] Charts render correctly
- [ ] Real-time data updates
- [ ] Can filter by date range
- [ ] Can sort campaigns
- [ ] Can search campaigns

### 11. Error Handling

- [ ] Network errors display user-friendly messages
- [ ] API errors handled gracefully
- [ ] Validation errors show helpful feedback
- [ ] 404 pages work correctly
- [ ] 500 errors caught and logged
- [ ] Retry mechanisms work for transient failures
- [ ] User not left in broken state

### 12. Performance

- [ ] Initial page load < 3 seconds
- [ ] TTI (Time to Interactive) < 5 seconds
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling and animations
- [ ] Images lazy-load correctly
- [ ] No jank or frame drops
- [ ] Works on slower connections

### 13. Security

- [ ] All API calls authenticated
- [ ] Tokens stored securely
- [ ] No sensitive data in console logs
- [ ] CSRF protection enabled
- [ ] XSS prevention measures in place
- [ ] SQL injection protection (via Supabase RLS)
- [ ] Rate limiting works
- [ ] Origin validation works for postMessage

### 14. Browser Compatibility

#### Chrome (Latest)
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors

#### Chrome (Previous version)
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors

#### Edge (Latest)
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors

#### Brave (Latest)
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors

### 15. Navigation & SPA Handling

- [ ] Grow button re-appears after Lovable navigation
- [ ] Extension state preserved during navigation
- [ ] URL changes handled correctly
- [ ] Clicking other tabs (Cloud, Code, etc.) hides Grow panel
- [ ] Clicking Preview button hides Grow panel
- [ ] SPA mutation observer working
- [ ] No duplicate buttons injected

### 16. Edge Cases

- [ ] Works with multiple Lovable tabs open
- [ ] Works after Chrome restart
- [ ] Works after computer sleep/wake
- [ ] Handles poor internet connection
- [ ] Handles complete network loss
- [ ] Recovers after network restored
- [ ] Works with browser extensions disabled temporarily
- [ ] Works with ad blockers (shouldn't interfere)

### 17. User Experience

- [ ] Loading states display correctly
- [ ] Success messages clear and helpful
- [ ] Error messages actionable
- [ ] Forms validate on blur
- [ ] Submit buttons disable during processing
- [ ] Tooltips helpful and accurate
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Focus states visible

### 18. Accessibility

- [ ] ARIA labels present
- [ ] Semantic HTML used
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly
- [ ] Keyboard accessible
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Form labels associated correctly

### 19. Data & Privacy

- [ ] Privacy policy accessible at `/privacy`
- [ ] Terms of service accessible at `/terms`
- [ ] No data collected without consent
- [ ] User can delete their account
- [ ] User can export their data
- [ ] GDPR compliance (if applicable)
- [ ] User notified of data usage

### 20. Documentation

- [ ] README.md up to date
- [ ] CHROME_STORE_PUBLISHING.md accurate
- [ ] API documentation complete
- [ ] Code comments helpful
- [ ] Environment setup instructions clear
- [ ] Troubleshooting guide available

## Pre-Submission Checklist

### Chrome Web Store Requirements

- [ ] Extension version 1.0.0 or higher
- [ ] All development URLs removed from manifest
- [ ] Homepage URL valid and accessible
- [ ] Icons present (16, 48, 128 px)
- [ ] Description clear and accurate
- [ ] Screenshots prepared (minimum 1, maximum 5)
- [ ] Promotional images created (440x280, 1400x560)
- [ ] Privacy policy URL valid
- [ ] Terms of service URL valid
- [ ] Permissions justified
- [ ] Single purpose clearly defined

### Final Verification

- [ ] Production backend running and stable
- [ ] Database migrations applied
- [ ] All tests passing
- [ ] No critical bugs in issue tracker
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented
- [ ] Support email configured
- [ ] Team notified of launch

## Post-Submission Monitoring

### First 24 Hours

- [ ] Monitor Chrome Web Store review status
- [ ] Check email for review feedback
- [ ] Monitor server logs for errors
- [ ] Check database for unusual activity
- [ ] Monitor API rate limits
- [ ] Watch for user reviews/ratings
- [ ] Be ready for hotfix if needed

### First Week

- [ ] Track installation count
- [ ] Monitor active users
- [ ] Check error rates
- [ ] Review user feedback
- [ ] Respond to reviews
- [ ] Fix any reported bugs
- [ ] Plan first update if needed

## Issue Tracking

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |

## Sign-Off

- [ ] Developer tested and approved
- [ ] QA tested and approved
- [ ] Product owner reviewed
- [ ] Security review complete
- [ ] Ready for Chrome Web Store submission

**Tested by:** ___________________________

**Date:** ___________________________

**Version:** ___________________________

**Notes:**

