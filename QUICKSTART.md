# Quick Start Guide - AdPilot for Lovable Extension

## ✅ Extension is Ready!

Your Chrome extension is set up and ready to test.

## 🚀 Load Extension in Chrome

### Step 1: Open Extensions Page

```
1. Open Chrome
2. Go to: chrome://extensions/
3. Enable "Developer mode" (toggle in top right)
```

### Step 2: Load Extension

```
1. Click "Load unpacked" button
2. Navigate to:
   /Users/metinhakanokuyucu/projects/adpilot-lovable-extension
3. Click "Select"
```

### Step 3: Verify Installation

You should see:
- ✅ Extension card: "AdPilot for Lovable"
- ✅ Version: 0.1.0
- ✅ Status: Enabled
- ✅ Icons display correctly
- ✅ No errors

## 🧪 Test on Lovable

### Step 1: Navigate to Lovable

```
1. Go to: https://lovable.dev/projects/{any-project-id}
2. Wait 5-10 seconds for page to load
```

### Step 2: Find Ads Tab

Look for the "Ads" tab in the top navigation (next to Cloud, Speed, etc.)

**If tab doesn't appear:**
- Check console (Right-click → Inspect → Console)
- Look for [AdPilot] logs
- Verify URL matches: lovable.dev/projects/*

### Step 3: Click Ads Tab

```
1. Click the "Ads" tab
2. Panel should open
3. iframe loads (currently shows loading spinner)
```

### Step 4: Check Console Logs

**Expected logs:**
```
[AdPilot] Content script loaded
[AdPilot] Lovable editor detected
[AdPilot] Tab container found, injecting Ads tab
[AdPilot] Ads tab injected successfully
[AdPilot] Showing panel
[AdPilot] Sending project context: {...}
```

## 🐛 Troubleshooting

### Problem: Extension won't load

**Solution:**
- Check for errors in chrome://extensions/
- Click "Errors" button if shown
- Verify all required files exist (especially icons)

### Problem: Tab doesn't appear

**Solution:**
- Verify you're on lovable.dev/projects/* page
- Check console for [AdPilot] logs
- Reload extension: chrome://extensions/ → reload button
- Hard refresh page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Problem: iframe doesn't load

**Solution:**
- Check console for CORS errors
- Verify iframe src: https://lovable.adpilot.com
- Note: UI service not deployed yet (iframe will show error until deployed)

## 📝 Next Steps

1. **Test Basic Functionality**
   - Tab injection ✅
   - Panel opening ✅
   - Project context detection ✅

2. **Deploy UI Service**
   - Build Next.js app at lovable.adpilot.com
   - iframe will then load actual UI

3. **Test Integration**
   - API connection
   - Image import
   - Conversion tracking

4. **Publish to Chrome Web Store**
   - See docs/DEPLOYMENT.md

## 📚 Documentation

- **Development:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Testing:** [docs/TESTING.md](docs/TESTING.md)
- **Deployment:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🎉 Success Criteria

✅ Extension loads in Chrome  
✅ No errors in extensions page  
✅ Tab appears on Lovable projects  
✅ Clicking tab opens panel  
✅ Console shows project context  

## 🆘 Need Help?

- **Extension Issues:** Check [docs/TESTING.md](docs/TESTING.md)
- **API Issues:** See main AdPilot repo
- **General Help:** dev@adpilot.com

