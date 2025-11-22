# Incident Response Plan

This document outlines procedures for handling production incidents with the AdPilot for Lovable extension.

## Severity Levels

### P0 - Critical (Resolve within 1 hour)
- Extension completely broken for all users
- Data loss or corruption
- Security breach
- Backend completely down

### P1 - High (Resolve within 4 hours)
- Major feature not working
- Authentication failures
- API returning errors for most requests
- Significant performance degradation

### P2 - Medium (Resolve within 24 hours)
- Minor feature not working
- Some API endpoints failing
- UI bugs affecting experience
- Moderate performance issues

### P3 - Low (Resolve within 1 week)
- Cosmetic issues
- Minor bugs
- Enhancement requests
- Documentation updates

## Emergency Contacts

**Technical Lead:** [Your Name]  
**Email:** [Your Email]  
**Phone:** [Your Phone]

**Backup Contact:** [Backup Name]  
**Email:** [Backup Email]

**Supabase Dashboard:** https://supabase.com/dashboard  
**Vercel Dashboard:** https://vercel.com/dashboard  
**Chrome Web Store:** https://chrome.google.com/webstore/devconsole

## Incident Response Workflow

### 1. Detection
Incidents can be detected through:
- User reports
- Monitoring alerts
- Error tracking (Sentry, etc.)
- Manual testing
- Chrome Web Store reviews

### 2. Assessment
1. Determine severity (P0-P3)
2. Identify affected users (all, some, specific)
3. Determine root cause (if obvious)
4. Estimate impact

### 3. Communication
1. Acknowledge incident internally
2. Update status page (if applicable)
3. Notify affected users if P0/P1
4. Post in support channels

### 4. Resolution
1. Implement fix
2. Test thoroughly
3. Deploy fix
4. Verify resolution
5. Monitor for recurrence

### 5. Post-Mortem
1. Document what happened
2. Document root cause
3. Document resolution
4. Identify preventive measures
5. Update runbooks

## Common Incidents & Solutions

### Incident: Extension Not Loading

**Symptoms:**
- Users report extension not appearing
- Grow button missing from Lovable

**Diagnosis:**
```javascript
// Check in browser console
console.log('[AdPilot] Version:', chrome.runtime.getManifest().version);
```

**Solutions:**
1. Check if content script loaded:
   - Open browser console
   - Look for `[AdPilot] Content script loaded` message
2. Verify manifest matches are correct
3. Check Lovable UI hasn't changed
4. Reload extension: `chrome://extensions/` → Reload

**Rollback:**
1. Push previous working version to Chrome Web Store
2. Users will auto-update within 24 hours
3. Force update: Remove and reinstall

### Incident: Iframe Not Loading (X-Frame-Options)

**Symptoms:**
- "refused to connect" error
- Blank iframe
- X-Frame-Options error in console

**Diagnosis:**
```bash
# Check headers
curl -I https://www.adpilot.studio/lovable
```

**Solutions:**
1. **Quick Fix:** Rollback Vercel deployment
   ```bash
   vercel rollback <previous-deployment-url>
   ```

2. **Permanent Fix:**
   - Verify `vercel.json` is correct
   - Remove conflicting headers in Vercel Dashboard
   - Redeploy with correct configuration

**Prevention:**
- Always test headers after deployment
- Monitor with automated checks

### Incident: Authentication Failures

**Symptoms:**
- Users can't sign in
- OAuth errors
- Session not persisting

**Diagnosis:**
1. Check Supabase Dashboard → Auth → Logs
2. Check browser console for errors
3. Verify environment variables:
   ```bash
   vercel env ls production
   ```

**Solutions:**
1. **OAuth Issues:**
   - Check Meta app is in Live mode
   - Verify OAuth redirect URLs
   - Check app permissions

2. **Session Issues:**
   - Check cookie settings
   - Verify Supabase Auth configuration
   - Check for CORS errors

3. **Environment Variables:**
   - Verify all keys are set in Vercel
   - Check for typos or extra spaces
   - Redeploy after fixing

**Rollback:**
- Revert to last working deployment
- Check if environment variables changed

### Incident: API Errors (401, 403, 500)

**Symptoms:**
- API calls failing
- Error messages in extension
- Empty data or loading states

**Diagnosis:**
```bash
# Check API health
curl https://www.adpilot.studio/api/v1/health

# Check logs
vercel logs --prod

# Check Supabase logs
# Go to Dashboard → Logs
```

**Solutions:**
1. **401 Unauthorized:**
   - Check authentication token is sent
   - Verify Supabase RLS policies
   - Check session hasn't expired

2. **403 Forbidden:**
   - Check user permissions
   - Verify RLS policies allow access
   - Check campaign/ad ownership

3. **500 Internal Server Error:**
   - Check Vercel logs for stack trace
   - Check database connection
   - Verify environment variables
   - Check for recent code changes

**Prevention:**
- Implement proper error handling
- Add retry logic for transient failures
- Monitor error rates

### Incident: Database Issues

**Symptoms:**
- Data not saving
- Queries timing out
- Database connection errors

**Diagnosis:**
1. Check Supabase Dashboard → Database → Health
2. Check connection count
3. Check for long-running queries
4. Check disk usage

**Solutions:**
1. **Connection Pool Exhausted:**
   - Restart Supabase (if allowed)
   - Check for connection leaks in code
   - Increase connection limit

2. **Slow Queries:**
   - Identify slow queries in Supabase Dashboard
   - Add missing indexes
   - Optimize query logic

3. **Disk Full:**
   - Check storage usage
   - Clean up old data
   - Upgrade plan if needed

**Emergency Contact:**
- Supabase Support: support@supabase.com

### Incident: High Error Rate

**Symptoms:**
- Multiple errors across different features
- Monitoring shows spike in errors
- Users reporting various issues

**Diagnosis:**
1. Check Vercel Analytics → Errors
2. Check Sentry/error tracking
3. Review recent deployments
4. Check for infrastructure issues

**Solutions:**
1. **Recent Deployment:**
   - Rollback to previous version immediately
   - Investigate issues in staging
   - Fix and redeploy

2. **Infrastructure Issues:**
   - Check Vercel status page
   - Check Supabase status page
   - Wait for service restoration

3. **Rate Limiting:**
   - Check API rate limits
   - Implement backoff strategy
   - Contact provider for limit increase

## Rollback Procedures

### Rollback Extension

**Chrome Web Store:**
1. Go to Developer Dashboard
2. Click "Package" tab
3. Upload previous working version
4. Submit for review (may take 1-3 days)

**For Urgent Issues:**
1. Remove extension from store temporarily
2. Communicate to users via website/email
3. Fix issue
4. Resubmit for expedited review

### Rollback Backend (Vercel)

**Option 1: Via Dashboard**
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Wait 1-2 minutes for deployment

**Option 2: Via CLI**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

**Option 3: Git Revert**
```bash
# Revert last commit
git revert HEAD

# Push to trigger deployment
git push origin main
```

### Rollback Database (Supabase)

**⚠️  Caution: Data operations can cause data loss**

1. Restore from backup (if available)
   - Go to Supabase Dashboard → Database → Backups
   - Select backup
   - Restore (THIS WILL OVERWRITE CURRENT DATA)

2. Revert migration
   ```bash
   # Get list of migrations
   npx supabase migration list

   # Rollback specific migration (if possible)
   # This may require manual SQL
   ```

## Remote Feature Toggle

**Implementation:** Add feature flags to disable broken features without deployment

### Example: Disable AI Generation
```typescript
// lib/constants.ts
export const FEATURE_FLAGS = {
  AI_GENERATION_ENABLED: process.env.NEXT_PUBLIC_FEATURE_AI_GENERATION !== 'false',
  META_PUBLISHING_ENABLED: process.env.NEXT_PUBLIC_FEATURE_META_PUBLISH !== 'false',
}
```

**To Disable Feature:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_FEATURE_AI_GENERATION = false`
3. Redeploy (under 2 minutes)

**Benefits:**
- Quick mitigation without code changes
- Can enable/disable per environment
- Can gradually roll out fixes

## Monitoring & Alerts

### Set Up Monitoring

**Vercel:**
- Enable Vercel Analytics
- Set up alerts for high error rates
- Monitor response times

**Supabase:**
- Monitor database health
- Set up alerts for high CPU/memory
- Watch for connection pool exhaustion

**Error Tracking:**
- Implement Sentry or similar
- Set up Slack/email notifications
- Create alerts for error spikes

**Uptime Monitoring:**
- Use UptimeRobot or Pingdom
- Monitor https://www.adpilot.studio/lovable
- Alert on downtime

### Key Metrics to Monitor

1. **Extension Health:**
   - Install count
   - Active users
   - Uninstall rate
   - Chrome Web Store rating

2. **Backend Health:**
   - Response time (p95, p99)
   - Error rate
   - Request count
   - Database query time

3. **Business Metrics:**
   - New user signups
   - Campaigns created
   - Ads published
   - User retention

## Communication Templates

### Incident Notification (Internal)

```
🚨 INCIDENT ALERT - P[0-3]

Title: [Brief description]
Status: Investigating / Identified / Resolved
Impact: [Number of users affected]
Started: [Time]

Details:
[What's happening]

Next Steps:
[What we're doing]

Updates will be posted every [15 min / 1 hour]
```

### User Communication (External)

```
We're aware of an issue affecting [feature/all users].

What's happening: [Brief, non-technical explanation]
Impact: [What users can/can't do]
ETA: [When we expect to resolve]

We're working on a fix and will update you shortly.

We apologize for the inconvenience.
```

### Resolution Announcement

```
✅ RESOLVED

The issue affecting [feature] has been resolved.

What happened: [Brief explanation]
Root cause: [Non-technical explanation]
Resolution: [What we did]

All systems are now operating normally.

Thank you for your patience.
```

## Post-Incident Review

After resolving P0/P1 incidents, conduct a post-mortem:

### Template

**Date:** [Date of incident]  
**Severity:** P[0-3]  
**Duration:** [Start time] - [End time]

**Summary:**
[1-2 sentence summary]

**Impact:**
- Users affected: [Number/percentage]
- Features affected: [List]
- Revenue impact: [If applicable]

**Timeline:**
- [Time] - Incident detected
- [Time] - Response team assembled
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Incident resolved

**Root Cause:**
[Detailed technical explanation]

**Resolution:**
[What we did to fix it]

**Prevention:**
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

**Lessons Learned:**
- [Lesson 1]
- [Lesson 2]

**Action Items:**
- [ ] [Owner] - [Action] - [Due date]

## Training & Drills

**Quarterly:** Run incident response drill
- Simulate P1 incident
- Practice rollback procedures
- Test communication channels
- Review and update procedures

**Annually:** Review and update this document
- Update contact information
- Add new common incidents
- Update procedures based on learnings
- Test all emergency procedures

---

**Last Updated:** November 22, 2025  
**Next Review:** May 2026  
**Owner:** Technical Lead

