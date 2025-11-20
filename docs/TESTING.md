# Testing Guide - AdPilot for Lovable Extension

## Quick Test

1. **Load extension:**
   ```bash
   # Open chrome://extensions/
   # Enable Developer mode
   # Load unpacked → select extension directory
   ```

2. **Test on Lovable:**
   ```
   Navigate to: lovable.dev/projects/{any-project-id}
   Wait for "Ads" tab to appear
   Click "Ads" tab
   ```

3. **Expected result:**
   - ✅ "Ads" tab appears next to Speed/Cloud tabs
   - ✅ Clicking opens AdPilot panel
   - ✅ No console errors

## Detailed Testing

### 1. Extension Installation

**Test:** Extension loads without errors

```
Steps:
1. Open chrome://extensions/
2. Load unpacked extension
3. Check for errors
4. Verify extension card shows:
   - Name: "AdPilot for Lovable"
   - Version: 0.1.0
   - Icons display correctly
```

**Expected:** ✅ No errors, all metadata correct

### 2. Tab Injection

**Test:** "Ads" tab appears on Lovable

```
Steps:
1. Go to lovable.dev/projects/{project-id}
2. Wait 5-10 seconds for content script
3. Look for "Ads" tab
4. Check console for logs
```

**Expected console logs:**
```
[AdPilot] Content script loaded
[AdPilot] Lovable editor detected
[AdPilot] Tab container found, injecting Ads tab
[AdPilot] Ads tab injected successfully
```

### 3. Panel Opening

**Test:** Panel opens when clicking tab

```
Steps:
1. Click "Ads" tab
2. Verify panel appears
3. Check iframe loads
```

**Expected:**
- ✅ Preview panel hidden
- ✅ AdPilot container visible
- ✅ iframe loads (shows loading spinner)

### 4. Project Context Detection

**Test:** Extension detects project info

```
Steps:
1. On Lovable project page
2. Open console
3. Look for project context message
```

**Expected log:**
```
[AdPilot] Sending project context: {
  type: "ADPILOT_PROJECT_CONTEXT",
  payload: {
    lovableProjectId: "...",
    lovableProjectUrl: "...",
    supabaseUrl: "...",
    timestamp: ...
  }
}
```

### 5. SPA Navigation

**Test:** Extension survives page navigation

```
Steps:
1. Click "Ads" tab on project A
2. Navigate to project B (Lovable SPA routing)
3. Verify "Ads" tab still exists
4. Click tab again
```

**Expected:** ✅ Tab persists, re-injection works

### 6. Service Worker

**Test:** Background script runs

```
Steps:
1. Go to chrome://extensions/
2. Find extension
3. Click "service worker" link
4. Check console
```

**Expected logs:**
```
[AdPilot] Extension installed: install
[AdPilot] Lovable project page detected: ...
```

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Chrome (previous version)
- [ ] Edge (Chromium-based)

## Performance Testing

### Memory Usage

1. Open Chrome Task Manager: `Shift+Esc`
2. Find "Extension: AdPilot for Lovable"
3. Monitor memory usage
4. Navigate between projects
5. Verify no memory leaks

**Expected:** < 50MB memory usage

### CPU Usage

1. Open DevTools Performance tab
2. Record while using extension
3. Check for long tasks or excessive reflows

**Expected:** Minimal CPU impact when idle

## Error Scenarios

### 1. Invalid Lovable URL

**Test:** Extension doesn't activate on non-Lovable pages

```
Steps:
1. Go to google.com
2. Check if content script runs
```

**Expected:** ✅ No injection, no errors

### 2. Missing Preview Panel

**Test:** Graceful failure if preview panel not found

```
Steps:
1. Simulate missing preview panel
2. Click "Ads" tab
3. Check console
```

**Expected:**
```
[AdPilot] Preview panel not found
```

### 3. iframe Load Failure

**Test:** Handle iframe errors

```
Steps:
1. Block lovable.adpilot.com in hosts file
2. Click "Ads" tab
3. Check behavior
```

**Expected:** ✅ Error message shown, no crash

## Automated Tests (Future)

Future test framework setup:

```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Run automated tests
npm test
```

## Test Checklist

Before releasing:

- [ ] Extension loads in Chrome without errors
- [ ] All icons display correctly
- [ ] Tab injection works on Lovable
- [ ] Panel opens on tab click
- [ ] Project context detected correctly
- [ ] Service worker runs without errors
- [ ] No console errors or warnings
- [ ] Memory usage acceptable (< 50MB)
- [ ] Works on multiple Lovable projects
- [ ] Survives page navigation
- [ ] Graceful error handling
- [ ] manifest.json validates successfully
- [ ] Package script creates valid .zip

## Reporting Issues

When reporting bugs, include:
1. Chrome version
2. Extension version
3. Lovable project URL (if possible)
4. Console logs (both page and service worker)
5. Steps to reproduce
6. Expected vs actual behavior

