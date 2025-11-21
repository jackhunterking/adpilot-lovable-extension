/**
 * AdPilot for Lovable - Content Script
 * 
 * Evidence-based implementation using actual Lovable DOM structure
 * Discovered through investigation: Nov 20, 2025
 * 
 * Navigation structure:
 * - UL with class "flex items-center gap-1"
 * - Contains LI elements with Cloud, Database, etc. buttons
 * - We inject after Cloud button
 * 
 * URL routing:
 * - Lovable uses ?view=cloud, ?view=database pattern
 * - We use ?view=ads
 */

console.log('[AdPilot] Content script loaded - v0.2.0');

// Verify we're on Lovable
function isLovableEditor() {
  const isLovable = window.location.hostname.includes('lovable.dev') && 
                    window.location.pathname.includes('/projects/');
  console.log('[AdPilot] Is Lovable editor:', isLovable);
  return isLovable;
}

// Extract project ID
function getLovableProjectId() {
  const match = window.location.pathname.match(/\/projects\/([^\/\?]+)/);
  const projectId = match ? match[1] : null;
  console.log('[AdPilot] Project ID:', projectId);
  return projectId;
}

// Find navigation container (evidence-based)
function findNavigationContainer() {
  console.log('[AdPilot] Searching for navigation container...');
  
  // Strategy 1: Find UL with Cloud button (most reliable)
  const allButtons = Array.from(document.querySelectorAll('button'));
  const cloudButton = allButtons.find(b => b.textContent.trim() === 'Cloud');
  
  if (cloudButton) {
    // Traverse up to UL: button → div → li → ul
    const ul = cloudButton.closest('ul');
    if (ul) {
      console.log('[AdPilot] Found navigation UL via Cloud button');
      return { container: ul, cloudButton };
    }
  }
  
  // Strategy 2: Find UL with specific classes
  const navUl = document.querySelector('ul.flex.items-center.gap-1');
  if (navUl) {
    console.log('[AdPilot] Found navigation UL by classes');
    return { container: navUl, cloudButton: null };
  }
  
  console.error('[AdPilot] Navigation container not found');
  return null;
}

// Inject Ads button into sidebar
function injectAdsButton() {
  console.log('[AdPilot] Injecting Ads button...');
  
  const nav = findNavigationContainer();
  if (!nav) {
    console.error('[AdPilot] Cannot inject - no container found');
    return false;
  }
  
  // Check if already injected
  if (document.getElementById('adpilot-ads-li')) {
    console.log('[AdPilot] Already injected');
    return true;
  }
  
  // Create matching structure: li > div > button (match Lovable exactly)
  const li = document.createElement('li');
  li.id = 'adpilot-ads-li';
  li.className = 'rounded-lg bg-transparent';
  
  const div = document.createElement('div');
  div.setAttribute('data-state', 'closed');
  
  const button = document.createElement('button');
  button.id = 'adpilot-ads-button';
  // Use EXACT classes from Cloud button (from evidence)
  button.className = 'items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  button.style.cssText = 'padding: 8px 16px; display: inline-flex;';
  
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink: 0;">
      <path d="M13 2L3 6v4l10 4V2zM2 7h1v2H2V7zm13 5.5l-9-3.6V7.1l9-3.6v8.5z"/>
    </svg>
    <span>Ads</span>
  `;
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToAds();
  });
  
  div.appendChild(button);
  li.appendChild(div);
  
  // Insert after Cloud's li
  if (nav.cloudButton) {
    const cloudLi = nav.cloudButton.closest('li');
    if (cloudLi) {
      cloudLi.after(li);
      console.log('[AdPilot] Injected after Cloud button');
      return true;
    }
  }
  
  // Fallback: append to UL
  nav.container.appendChild(li);
  console.log('[AdPilot] Appended to navigation UL');
  return true;
}

// Navigate to Ads view (URL-based, matching Lovable pattern)
function navigateToAds() {
  console.log('[AdPilot] Navigating to Ads view');
  
  // Update URL parameter (match Lovable's ?view= pattern)
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'ads');
  window.history.pushState({ view: 'ads', adpilot: true }, '', url);
  
  // Show panel
  showAdPilotPanel();
  
  // Update button state
  updateActiveButton();
}

// Update active button styling
function updateActiveButton() {
  // Remove active from all nav buttons
  const allNavButtons = document.querySelectorAll('ul.flex.items-center button');
  allNavButtons.forEach(btn => {
    btn.classList.remove('bg-accent', 'text-accent-foreground');
  });
  
  // Add active to Ads button
  const adsButton = document.getElementById('adpilot-ads-button');
  if (adsButton) {
    adsButton.classList.add('bg-accent', 'px-4');
  }
}

// Show AdPilot panel
function showAdPilotPanel() {
  console.log('[AdPilot] Showing panel');
  
  // Find content area (CONFIRMED selector from evidence)
  const contentArea = document.querySelector('[data-panel-group]');
  
  if (!contentArea) {
    console.error('[AdPilot] Content area not found');
    return;
  }
  
  // Hide Lovable content
  contentArea.dataset.adpilotOriginalDisplay = contentArea.style.display || 'flex';
  contentArea.style.display = 'none';
  
  // Get or create panel
  let panel = document.getElementById('adpilot-panel');
  
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'adpilot-panel';
    panel.className = 'h-full w-full';
    panel.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #0a0a0a;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.id = 'adpilot-iframe';
    // EXPERIMENTAL: Load full Next.js app
    // Development: http://localhost:3000
    // Production: Deploy to lovable.adpilot.com
    iframe.src = 'http://localhost:3000';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
    iframe.allow = 'clipboard-write';  // Allow clipboard access for copy operations
    
    iframe.addEventListener('load', () => {
      sendProjectContext(iframe);
    });
    
    panel.appendChild(iframe);
    contentArea.parentElement.appendChild(panel);
    
    console.log('[AdPilot] Panel created');
  } else {
    panel.style.display = 'flex';
    console.log('[AdPilot] Panel shown');
  }
}

// Hide panel and restore Lovable content
function hideAdPilotPanel() {
  const panel = document.getElementById('adpilot-panel');
  if (panel) {
    panel.style.display = 'none';
  }
  
  const contentArea = document.querySelector('[data-panel-group]');
  if (contentArea) {
    contentArea.style.display = contentArea.dataset.adpilotOriginalDisplay || 'flex';
  }
  
  console.log('[AdPilot] Panel hidden');
}

// Send project context to iframe
function sendProjectContext(iframe) {
  const projectId = getLovableProjectId();
  const projectUrl = window.location.href;
  
  const message = {
    type: 'ADPILOT_PROJECT_CONTEXT',
    payload: {
      lovableProjectId: projectId,
      lovableProjectUrl: projectUrl,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  };
  
  console.log('[AdPilot] Sending project context:', message);
  
  // postMessage to iframe (no origin validation needed - same extension)
  iframe.contentWindow.postMessage(message, '*');
}

// Listen for messages from iframe
window.addEventListener('message', (event) => {
  // Accept messages from our iframe
  if (event.data && event.data.type && event.data.type.startsWith('ADPILOT_')) {
    console.log('[AdPilot] Received message from iframe:', event.data.type);
    
    if (event.data.type === 'ADPILOT_REQUEST_CONTEXT') {
      const iframe = document.getElementById('adpilot-iframe');
      if (iframe) {
        sendProjectContext(iframe);
      }
    }
  }
});

// Check view parameter on load/change
function checkViewParam() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  
  if (view === 'ads') {
    showAdPilotPanel();
    updateActiveButton();
  } else if (document.getElementById('adpilot-panel')) {
    hideAdPilotPanel();
  }
}

// Wait for navigation to be ready
async function waitForNavigation() {
  console.log('[AdPilot] Waiting for navigation...');
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.warn('[AdPilot] Timeout waiting for navigation (30s)');
      reject(new Error('Timeout'));
    }, 30000);
    
    const check = setInterval(() => {
      const result = findNavigationContainer();
      if (result) {
        clearInterval(check);
        clearTimeout(timeout);
        console.log('[AdPilot] Navigation found!');
        resolve();
      }
    }, 500); // Check every 500ms
  });
}

// Initialize extension
async function initialize() {
  if (!isLovableEditor()) {
    console.log('[AdPilot] Not a Lovable editor page');
    return;
  }
  
  console.log('[AdPilot] Lovable editor detected, initializing...');
  
  try {
    await waitForNavigation();
    const injected = injectAdsButton();
    
    if (injected) {
      // Check if URL has ?view=ads already
      checkViewParam();
      
      // Watch for view changes (browser back/forward)
      window.addEventListener('popstate', checkViewParam);
      
      console.log('[AdPilot] Initialization complete ✅');
    }
  } catch (error) {
    console.error('[AdPilot] Initialization failed:', error);
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Handle SPA navigation (Lovable is a React app)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('[AdPilot] URL changed, checking state');
    
    // Re-inject button if it disappeared
    if (!document.getElementById('adpilot-ads-button')) {
      console.log('[AdPilot] Button missing, re-initializing');
      initialize();
    }
    
    // Check view parameter
    checkViewParam();
  }
}).observe(document, { subtree: true, childList: true });
