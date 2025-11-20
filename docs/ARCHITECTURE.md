# Architecture - AdPilot for Lovable Extension

## Overview

This Chrome extension follows a microservices architecture, acting as a thin client that integrates Lovable's editor with AdPilot's advertising platform.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│   Lovable Editor (lovable.dev)          │
│   User's development environment        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Chrome Extension (This Repo)          │
│   ┌───────────────────────────────────┐ │
│   │ Content Script (inject.js)        │ │
│   │ - Detect Lovable pages            │ │
│   │ - Inject "Ads" tab                │ │
│   │ - Extract project context         │ │
│   └───────────────────────────────────┘ │
│   ┌───────────────────────────────────┐ │
│   │ Service Worker                    │ │
│   │ - Lifecycle management            │ │
│   │ - Storage management              │ │
│   └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓ postMessage
┌─────────────────────────────────────────┐
│   AdPilot UI (lovable.adpilot.com)      │
│   Iframe embedded in Lovable            │
│   - Campaign builder                    │
│   - Ad management                       │
│   - Analytics dashboard                 │
└─────────────────────────────────────────┘
                    ↓ REST API
┌─────────────────────────────────────────┐
│   AdPilot Backend (api.adpilot.com)     │
│   - Authentication                      │
│   - Campaign CRUD                       │
│   - Meta API integration                │
│   - Database (Supabase)                 │
└─────────────────────────────────────────┘
```

## Component Responsibilities

### Content Script (`content/inject.js`)

**Responsibilities:**
- Detect Lovable editor pages
- Find and inject "Ads" tab into navigation
- Show/hide AdPilot iframe panel
- Extract project context from URL
- Bridge communication via postMessage

**Does NOT:**
- Store campaign data
- Make API calls
- Handle business logic
- Manage authentication

### Service Worker (`background/service-worker.js`)

**Responsibilities:**
- Handle extension install/update events
- Manage chrome.storage data
- Forward messages between content scripts
- Handle background tasks

**Does NOT:**
- Access DOM
- Make business decisions
- Store sensitive data

### Types (`types/`)

**Responsibilities:**
- Define message contracts
- Type safety for postMessage
- Shared interfaces

**Note:** Copied from main AdPilot repo, not imported. Extension is standalone.

## Communication Flow

### 1. Extension → iframe (UI)

```javascript
// Project context on load
{
  type: 'ADPILOT_PROJECT_CONTEXT',
  payload: {
    lovableProjectId: 'abc123',
    lovableProjectUrl: 'https://lovable.dev/projects/abc123',
    supabaseUrl: 'https://xxx.supabase.co',
    timestamp: 1234567890
  }
}

// New images detected
{
  type: 'ADPILOT_NEW_IMAGES',
  payload: {
    images: [
      {
        bucket: 'generated-images',
        url: 'https://...',
        createdAt: '2025-11-20T...'
      }
    ]
  }
}
```

### 2. iframe (UI) → Extension

```javascript
// Request project context
{
  type: 'ADPILOT_REQUEST_CONTEXT',
  timestamp: 1234567890
}

// Start monitoring Lovable Storage
{
  type: 'ADPILOT_START_MONITORING',
  payload: {
    supabaseUrl: 'https://...',
    supabaseAnonKey: 'eyJ...'
  }
}
```

## Security

### Origin Validation

All postMessage events validate origin:

```javascript
window.addEventListener('message', (event) => {
  // MUST validate origin
  if (!event.origin.includes('adpilot.com')) {
    return; // Reject unknown origins
  }
  // Process message
});
```

### Permissions

**Minimal permissions requested:**
- `storage` - For caching project context
- `tabs` - For detecting Lovable pages

**No dangerous permissions:**
- ❌ No `<all_urls>`
- ❌ No `webRequest` blocking
- ❌ No `cookies`
- ❌ No `history`

### Data Storage

- **Project context:** Stored in chrome.storage.local
- **Campaign data:** NEVER stored in extension (always fetched from AdPilot API)
- **Auth tokens:** NEVER stored in extension (managed by AdPilot backend)

## Performance Considerations

### Injection Optimization

- MutationObserver with 10-second timeout
- Disconnect observer after injection
- Lazy-load iframe on demand

### Memory Management

- No global listeners without cleanup
- Disconnect observers when done
- Clear data from storage periodically

## Extension Lifecycle

```
1. User installs extension
   ↓
2. Service worker activates
   ↓
3. User navigates to lovable.dev/projects/*
   ↓
4. Content script injects
   ↓
5. MutationObserver finds tab container
   ↓
6. "Ads" tab injected
   ↓
7. User clicks "Ads" tab
   ↓
8. iframe created and loaded
   ↓
9. Project context sent to iframe
   ↓
10. iframe loads AdPilot UI
```

## Future Enhancements

### Image Monitoring Service

Will add `services/monitoring-service.js`:
- Poll Lovable Supabase Storage
- Detect new images in buckets
- Notify iframe of new images

### Bridge Service

Will add `services/bridge-service.js`:
- Centralize postMessage logic
- Request-response pattern
- Message queuing

### Error Handling Service

Will add `services/error-handler.js`:
- Capture and log errors
- Retry failed operations
- User-friendly error messages

## References

- **Main AdPilot Repo:** [github.com/user/adpilot](https://github.com/user/adpilot)
- **API Documentation:** [api.adpilot.com/docs](https://api.adpilot.com/docs)
- **Chrome Extensions:** [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions/)

