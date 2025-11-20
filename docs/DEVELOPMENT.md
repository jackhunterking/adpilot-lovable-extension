# Development Guide - AdPilot for Lovable Extension

## Prerequisites

- Chrome browser (latest version)
- Text editor (VS Code recommended)
- Git

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/adpilot-lovable-extension.git
   cd adpilot-lovable-extension
   ```

2. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `adpilot-lovable-extension` directory
   - Extension should load without errors

3. **Verify installation**
   - Extension appears in extensions list
   - No errors shown
   - Icons display correctly

## Development Workflow

### Making Changes

1. **Edit files** in your text editor
2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload icon on AdPilot extension
3. **Refresh test page:**
   - Go to `lovable.dev/projects/{any-project}`
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
4. **Check console logs:**
   - Right-click page → Inspect → Console
   - Look for `[AdPilot]` messages

### Testing on Lovable

1. Navigate to any Lovable project: `https://lovable.dev/projects/{project-id}`
2. Wait for content script to load (5-10 seconds)
3. Look for "Ads" tab next to existing tabs
4. Click "Ads" tab
5. Verify iframe loads

### Debugging

**Content Script Console:**
```
1. On Lovable page: Right-click → Inspect
2. Console tab
3. Filter by "[AdPilot]"
```

**Service Worker Console:**
```
1. Go to chrome://extensions/
2. Find AdPilot extension
3. Click "service worker" link
4. Console opens with background script logs
```

**Common Issues:**

- **Tab not appearing:** Check console for errors, verify Lovable page URL matches `matches` pattern
- **iframe not loading:** Check CORS, verify URL is correct
- **postMessage not working:** Verify origin validation in both extension and iframe

## Project Structure

```
adpilot-lovable-extension/
├── manifest.json              # Extension config
├── background/
│   └── service-worker.js     # Background tasks
├── content/
│   ├── inject.js             # Main injection logic
│   └── styles.css            # UI styles
├── services/                 # Business logic (future)
├── ui/
│   └── panel.html            # iframe panel
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── types/                    # TypeScript types
└── scripts/                  # Build scripts
```

## Adding New Features

### 1. Content Script Changes

Edit `content/inject.js` for:
- DOM manipulation
- Tab injection logic
- Event listeners

### 2. Background Script Changes

Edit `background/service-worker.js` for:
- Extension lifecycle
- Persistent state
- Message handling

### 3. Styles

Edit `content/styles.css` to match Lovable's design system.

## Code Style

- Use ES6+ JavaScript
- Add JSDoc comments for functions
- Log important events with `[AdPilot]` prefix
- Validate all user inputs
- Handle errors gracefully

## Testing Checklist

Before committing:

- [ ] Extension loads without errors
- [ ] Tab injection works on Lovable
- [ ] Console shows no errors
- [ ] Styles match Lovable design
- [ ] postMessage communication works
- [ ] No memory leaks (check with DevTools)

## Release Process

1. Update version in `package.json`
2. Update version in `manifest.json`
3. Run `npm run validate`
4. Run `npm run package`
5. Test packaged extension
6. Commit and tag: `git tag v0.1.0`
7. Push to GitHub
8. Upload to Chrome Web Store

## References

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Service Workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)

