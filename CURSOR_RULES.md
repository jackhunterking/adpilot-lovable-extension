# Cursor Rules - AdPilot Lovable Extension

Complete reference guide for developing Chrome extensions with Lovable integration.

## Chrome Extension Development

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "tabs"],
  "host_permissions": [
    "https://lovable.dev/*",
    "https://*.supabase.co/*"
  ],
  "content_scripts": [{
    "matches": ["https://lovable.dev/projects/*"],
    "js": ["content/inject.js"],
    "run_at": "document_end"
  }],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "web_accessible_resources": [{
    "resources": ["ui/panel.html", "assets/*"],
    "matches": ["https://lovable.dev/*"]
  }]
}
```

**Security principles:**
- Minimal permissions only
- No `<all_urls>` or dangerous APIs
- Always validate postMessage origins

### Content Scripts

**Evidence-based DOM discovery:**
```javascript
// Find by known landmarks, not brittle selectors
const allButtons = Array.from(document.querySelectorAll('button'));
const cloudButton = allButtons.find(b => b.textContent.trim() === 'Cloud');
const ul = cloudButton.closest('ul');
```

**Wait for DOM elements:**
```javascript
async function waitForNavigation() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
    const check = setInterval(() => {
      const result = findNavigationContainer();
      if (result) {
        clearInterval(check);
        clearTimeout(timeout);
        resolve();
      }
    }, 500);
  });
}
```

**SPA navigation detection:**
```javascript
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (!document.getElementById('my-button')) {
      initialize(); // Re-inject if needed
    }
  }
}).observe(document, { subtree: true, childList: true });
```

### Background Service Workers

**Message routing pattern:**
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'STORE_DATA':
      chrome.storage.local.set(message.data, () => {
        sendResponse({ success: true });
      });
      return true; // Keep channel open for async
      
    case 'GET_DATA':
      chrome.storage.local.get(message.keys, (data) => {
        sendResponse({ success: true, data });
      });
      return true;
  }
});
```

**Key differences from V2:**
- Service workers terminate when idle
- No DOM access
- Must use chrome.storage, not memory
- Always return `true` for async responses

### Messaging

**Runtime messaging (extension internal):**
```javascript
// Content script → Background
chrome.runtime.sendMessage({ type: 'GET_DATA', keys: ['projectId'] }, (response) => {
  console.log('Data:', response.data);
});
```

**PostMessage (cross-origin with iframe):**
```javascript
// Content script → Iframe
iframe.contentWindow.postMessage({
  type: 'ADPILOT_PROJECT_CONTEXT',
  payload: { projectId: 'abc123' }
}, '*');

// ⚠️ Always validate origin when receiving
window.addEventListener('message', (event) => {
  if (!event.origin.includes('adpilot.com')) return;
  processMessage(event.data);
});
```

### Storage

```javascript
// Save data
await chrome.storage.local.set({ projectId: 'abc123' });

// Get with defaults
const { theme = 'light' } = await chrome.storage.local.get({ theme: 'light' });

// Batch operations
await chrome.storage.local.set({
  key1: 'a',
  key2: 'b',
  key3: 'c'
});
```

## Lovable Integration

### URL Patterns

Lovable uses `?view=` parameters for navigation:
- `?view=cloud` - Cloud view
- `?view=database` - Database view
- `?view=ads` - Custom ads view (this extension)

```javascript
// Extract project ID
function getLovableProjectId() {
  const match = window.location.pathname.match(/\/projects\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Navigate to custom view
function navigateToAds() {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'ads');
  window.history.pushState({ view: 'ads' }, '', url);
  showAdPilotPanel();
}
```

### AI Features

**Default model:** Gemini 2.5 Flash (balanced speed/cost/quality)

**Model selection guide:**
- **Images**: Gemini 2.5 Flash Image (cheapest for images)
- **Copy**: Gemini 2.5 Flash (default, balanced)
- **Analysis**: GPT-5 Mini (better reasoning)
- **High-volume**: Gemini 2.5 Flash Lite (cheapest)
- **Critical quality**: GPT-5 (most expensive)

**Image generation:**
```
"Generate a Facebook ad image for summer sale using Gemini 2.5 Flash Image:
- 1080x1080 square format
- Bright colors
- Product in center
- '50% OFF' text overlay"
```

**Ad copy generation:**
```
"Write Facebook ad copy (max 125 chars) for organic coffee subscription:
- Target: Busy professionals
- Benefit: Fresh weekly delivery
- Tone: Friendly, energetic
Use Gemini 2.5 Flash"
```

### Supabase Backend

**⚠️ BACKEND OPERATION - Always notify user before:**
- Database queries/mutations
- Migration creation
- Storage operations
- RLS policy changes

**Use Supabase MCP tools in Cursor:**
```bash
# List tables
mcp_supabase_list_tables --project_id YOUR_PROJECT_ID

# Execute SQL
mcp_supabase_execute_sql --project_id YOUR_PROJECT_ID --query "SELECT * FROM campaigns"

# Apply migration
mcp_supabase_apply_migration --project_id YOUR_PROJECT_ID --name "create_campaigns" --query "CREATE TABLE..."

# Check security
mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

**Environment variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Client-safe
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Server-only!
```

**Client setup:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  return createClientComponentClient<Database>();
}
```

**Basic operations:**
```typescript
// Insert
const { data, error } = await supabase
  .from('campaigns')
  .insert({ name: 'Summer Sale', user_id: user.id })
  .select()
  .single();

// Query
const { data } = await supabase
  .from('campaigns')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Update
const { data } = await supabase
  .from('campaigns')
  .update({ budget: 1500 })
  .eq('id', campaignId);
```

**Row Level Security (RLS) - CRITICAL:**
```sql
-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Check security after changes
-- mcp_supabase_get_advisors --project_id YOUR_PROJECT_ID --type security
```

**Storage:**
```typescript
// Upload
const { data } = await supabase.storage
  .from('generated-images')
  .upload(`ads/${userId}/${Date.now()}.png`, file);

// Get public URL
const { data } = supabase.storage
  .from('generated-images')
  .getPublicUrl('path/to/file.png');
```

## AdPilot Architecture Patterns

### Evidence-Based DOM Injection

```javascript
function findNavigationContainer() {
  // Strategy 1: Find by known landmark
  const allButtons = Array.from(document.querySelectorAll('button'));
  const cloudButton = allButtons.find(b => b.textContent.trim() === 'Cloud');
  if (cloudButton) {
    const ul = cloudButton.closest('ul');
    if (ul) return { container: ul, cloudButton };
  }
  
  // Strategy 2: Fallback
  return { container: document.querySelector('ul.flex.items-center.gap-1') };
}

function injectAdsButton() {
  const nav = findNavigationContainer();
  if (!nav) return false;
  
  // Create matching structure: li > div > button
  const li = document.createElement('li');
  li.id = 'adpilot-ads-li';
  li.className = 'rounded-lg bg-transparent';
  
  const button = document.createElement('button');
  button.id = 'adpilot-ads-button';
  button.className = 'items-center justify-center gap-2 whitespace-nowrap text-sm font-medium...';
  button.onclick = navigateToAds;
  
  li.appendChild(button);
  nav.cloudButton?.closest('li').after(li);
  return true;
}
```

### Project Context Sharing

```javascript
// Content script extracts context
function sendProjectContext(iframe) {
  const message = {
    type: 'ADPILOT_PROJECT_CONTEXT',
    payload: {
      lovableProjectId: getLovableProjectId(),
      lovableProjectUrl: window.location.href,
      timestamp: Date.now()
    }
  };
  iframe.contentWindow.postMessage(message, '*');
}

// Next.js app receives context
function useLovableContext() {
  const [context, setContext] = useState(null);
  
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'ADPILOT_PROJECT_CONTEXT') {
        setContext(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Request context on mount
    window.parent.postMessage({ type: 'ADPILOT_REQUEST_CONTEXT' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  return context;
}
```

### Panel Management

```javascript
function showAdPilotPanel() {
  const panelGroup = document.querySelector('[data-panel-group]');
  const panels = panelGroup.querySelectorAll('[data-panel]');
  const rightPanel = panels[panels.length - 1];
  
  // Hide Lovable's panel
  rightPanel.style.display = 'none';
  
  // Show/create AdPilot panel
  let panel = document.getElementById('adpilot-panel');
  if (!panel) {
    panel = createAdPilotPanel();
    rightPanel.after(panel);
  } else {
    panel.style.display = 'flex';
  }
}

function createAdPilotPanel() {
  const panel = document.createElement('div');
  panel.id = 'adpilot-panel';
  panel.setAttribute('data-panel', '');
  
  const iframe = document.createElement('iframe');
  iframe.src = 'http://localhost:3000';
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.onload = () => sendProjectContext(iframe);
  
  panel.appendChild(iframe);
  return panel;
}
```

## Best Practices Checklist

**DOM Manipulation:**
- ✅ Use evidence-based element discovery
- ✅ Match site's HTML structure exactly
- ✅ Have fallback strategies
- ✅ Clean up event listeners

**URL Routing:**
- ✅ Match site's URL patterns
- ✅ Support browser back/forward
- ✅ Update UI based on URL state

**Messaging:**
- ✅ Always validate message origins
- ✅ Use type prefixes (ADPILOT_)
- ✅ Handle missing context gracefully

**Backend Operations:**
- ✅ Notify user before database/storage operations
- ✅ Use Supabase MCP tools for schema changes
- ✅ Always enable RLS on production tables
- ✅ Check security advisors after changes

**Performance:**
- ✅ Disconnect observers when done
- ✅ Cache DOM queries
- ✅ Batch operations
- ✅ Debounce expensive operations

## Testing

**Chrome extension:**
```bash
# Load extension
# 1. chrome://extensions/
# 2. Developer mode ON
# 3. Load unpacked → select directory
```

**Verify:**
- ✅ Extension loads without errors
- ✅ Button appears on Lovable
- ✅ Panel opens correctly
- ✅ Context shared with iframe
- ✅ No console errors

**Backend testing:**
```bash
# Run security check
mcp_supabase_get_advisors --project_id PROJECT_ID --type security

# Test query
mcp_supabase_execute_sql --project_id PROJECT_ID --query "SELECT * FROM campaigns LIMIT 1"
```

## Common Pitfalls

**❌ Don't:**
- Assume DOM structure
- Store state in service worker memory
- Use broad permissions
- Skip origin validation
- Forget to enable RLS

**✅ Do:**
- Use evidence-based discovery
- Store in chrome.storage
- Request minimal permissions
- Validate all messages
- Always enable RLS

## Resources

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)

