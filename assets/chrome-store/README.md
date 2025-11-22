# Chrome Web Store Assets

This directory contains all assets required for Chrome Web Store submission.

## Required Assets

### 1. Screenshots (Required)
- **Dimensions:** 1280x800 or 640x400 pixels
- **Format:** PNG or JPEG
- **Count:** Minimum 1, Maximum 5
- **File Size:** Maximum 5MB each

#### Recommended Screenshots to Capture:

1. **`01-lovable-navigation.png`** - Extension button in Lovable navigation
   - Open Lovable project
   - Show Grow button in navigation bar
   - Highlight the button integration

2. **`02-auth-signin.png`** - Authentication screen
   - Sign-in interface
   - Clean, professional look
   - Show Google OAuth option

3. **`03-dashboard.png`** - Main dashboard with campaigns
   - Campaign overview
   - Multiple campaigns shown
   - Analytics preview

4. **`04-ad-builder.png`** - Ad creation interface
   - Ad builder workflow
   - Show AI generation features
   - Professional and intuitive UI

5. **`05-analytics.png`** - Analytics dashboard
   - Performance metrics
   - Charts and graphs
   - Real-time data

### 2. Promotional Images

#### Small Promotional Tile (Required)
- **Filename:** `promo-small.png`
- **Dimensions:** 440x280 pixels
- **Format:** PNG
- **Purpose:** Displayed in store listings

#### Large Promotional Tile (Optional but Recommended)
- **Filename:** `promo-large.png`
- **Dimensions:** 920x680 pixels
- **Format:** PNG
- **Purpose:** Featured in Chrome Web Store

#### Marquee Promotional Tile (Optional)
- **Filename:** `promo-marquee.png`
- **Dimensions:** 1400x560 pixels
- **Format:** PNG
- **Purpose:** Large banner for featured listings

### 3. Icons (Already Exist)
- ✅ 16x16: `../icon-16.png`
- ✅ 48x48: `../icon-48.png`
- ✅ 128x128: `../icon-128.png`

## Screenshot Guidelines

### Best Practices

1. **Use Real Data** (or realistic demo data)
   - Avoid lorem ipsum
   - Use professional business names
   - Show realistic metrics

2. **Show Key Features**
   - AI-powered image generation
   - AI-powered copy writing
   - Visual targeting map
   - Real-time analytics

3. **Keep It Clean**
   - No browser chrome visible
   - No personal information
   - No debug console
   - No loading states or errors

4. **Highlight Value**
   - Show the problem being solved
   - Demonstrate ease of use
   - Display professional results

5. **Consistent Branding**
   - Use AdPilot brand colors
   - Maintain visual consistency
   - Professional typography

### How to Capture Screenshots

#### Option 1: Browser DevTools
```javascript
// Open DevTools
// Set device to specific resolution
// Take screenshot via DevTools
```

#### Option 2: macOS Screenshot
```bash
# Cmd + Shift + 4 for area selection
# Cmd + Shift + 5 for screenshot tool
```

#### Option 3: Chrome Extension
- Use "Full Page Screen Capture" extension
- Or "Awesome Screenshot" extension

### Resize Screenshots
Use ImageMagick if needed:
```bash
# Resize to 1280x800
convert input.png -resize 1280x800 output.png

# Resize maintaining aspect ratio
convert input.png -resize 1280x800^ -gravity center -extent 1280x800 output.png
```

## Promotional Tile Design

### Small Tile (440x280)
**Layout Suggestion:**
- AdPilot logo (top-left)
- Tagline: "Grow Your Lovable Projects"
- Key feature icons
- Clean gradient background
- Call-to-action

### Large Tile (920x680)
**Layout Suggestion:**
- Large hero image of extension in action
- AdPilot branding
- "AI-Powered Meta Ads"
- Feature bullets:
  - ✨ AI Image Generation
  - 📝 AI Copy Writing
  - 🎯 Advanced Targeting
  - 📊 Real-Time Analytics
- Professional design

### Marquee Tile (1400x560)
**Layout Suggestion:**
- Wide banner format
- Left: Extension screenshot
- Right: Benefits and features
- Strong call-to-action
- Professional, eye-catching design

## Design Tools

### Recommended Tools
1. **Figma** (free for personal use)
   - Professional design tool
   - Collaborative
   - Export to PNG

2. **Canva** (free tier available)
   - Templates available
   - Easy to use
   - Quick turnaround

3. **Adobe Photoshop** (paid)
   - Professional grade
   - Full control
   - Industry standard

4. **Sketch** (macOS only, paid)
   - macOS native
   - Professional results
   - Popular choice

## Checklist

### Screenshots
- [ ] 01-lovable-navigation.png (1280x800)
- [ ] 02-auth-signin.png (1280x800)
- [ ] 03-dashboard.png (1280x800)
- [ ] 04-ad-builder.png (1280x800)
- [ ] 05-analytics.png (1280x800)

### Promotional Tiles
- [ ] promo-small.png (440x280)
- [ ] promo-large.png (920x680) - Optional
- [ ] promo-marquee.png (1400x560) - Optional

### Quality Check
- [ ] All images are PNG format
- [ ] Dimensions are exact
- [ ] File sizes under 5MB
- [ ] No personal information visible
- [ ] Professional appearance
- [ ] Consistent branding
- [ ] High resolution (not blurry)
- [ ] No errors or loading states shown

## Upload Instructions

When ready to upload:

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select your extension
3. Navigate to "Store listing"
4. Scroll to "Screenshots" section
5. Upload your 5 screenshots in order
6. Upload promotional tiles in "Promotional images" section
7. Preview how they look
8. Save changes

## Tips for Approval

- Use actual extension screenshots (not mockups)
- Show real functionality
- Ensure screenshots match description
- Maintain professional quality
- Update screenshots with each major release

---

**Note:** Screenshots are a critical part of your Chrome Web Store listing. They are often the first thing potential users see, so make them count!

