/**
 * AdPilot for Lovable - Content Script (Injection)
 * 
 * Responsibilities:
 * - Detect Lovable editor page
 * - Inject "Ads" tab into Lovable UI
 * - Show/hide AdPilot panel
 * - Send project context to iframe
 */

console.log('[AdPilot] Content script loaded');

// Check if this is a Lovable editor page
function isLovableEditor() {
  return window.location.hostname.includes('lovable.dev') && 
         window.location.pathname.includes('/projects/');
}

// Extract project ID from URL
function getLovableProjectId() {
  const match = window.location.pathname.match(/\/projects\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Extract Supabase URL from page (if possible)
function detectSupabaseConfig() {
  // Try to find Supabase client initialization in scripts
  const scripts = Array.from(document.querySelectorAll('script'));
  
  for (const script of scripts) {
    const content = script.textContent || '';
    
    // Look for createClient calls
    const urlMatch = content.match(/createClient\s*\(\s*['"]([^'"]+supabase[^'"]+)['"]/);
    const keyMatch = content.match(/createClient\s*\([^,]+,\s*['"]([^'"]+)['"]/);
    
    if (urlMatch) {
      return {
        supabaseUrl: urlMatch[1],
        supabaseAnonKey: keyMatch ? keyMatch[1] : null
      };
    }
  }
  
  return { supabaseUrl: null, supabaseAnonKey: null };
}

// Inject Ads tab into Lovable UI
function injectAdsTab() {
  // Find the floating tab container
  // Lovable has tabs at the top: Cloud, Speed, etc.
  // We need to find the container and add our tab
  
  // Wait for DOM to be ready
  const observer = new MutationObserver((mutations, obs) => {
    // Look for tab container
    // This is a placeholder - actual selector needs to be determined by inspecting Lovable UI
    const tabContainer = document.querySelector('[role="tablist"], .top-nav-tabs, .preview-tabs');
    
    if (tabContainer && !document.getElementById('adpilot-ads-tab')) {
      console.log('[AdPilot] Tab container found, injecting Ads tab');
      
      // Create Ads tab button
      const adsTab = document.createElement('button');
      adsTab.id = 'adpilot-ads-tab';
      adsTab.className = 'lovable-tab-button'; // Match Lovable's button style
      adsTab.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 4px;">
          <path d="M13 2L3 6v4l10 4V2zM2 7h1v2H2V7zm13 5.5l-9-3.6V7.1l9-3.6v8.5z"/>
        </svg>
        <span>Ads</span>
      `;
      
      // Add click handler
      adsTab.addEventListener('click', () => {
        showAdPilotPanel();
      });
      
      // Insert after Speed tab (or at end if not found)
      const speedTab = Array.from(tabContainer.children).find(el => 
        el.textContent && el.textContent.includes('Speed')
      );
      
      if (speedTab) {
        speedTab.after(adsTab);
      } else {
        tabContainer.appendChild(adsTab);
      }
      
      console.log('[AdPilot] Ads tab injected successfully');
      obs.disconnect();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Timeout after 10 seconds
  setTimeout(() => observer.disconnect(), 10000);
}

// Show AdPilot panel (iframe)
function showAdPilotPanel() {
  console.log('[AdPilot] Showing panel');
  
  // Find preview panel
  const previewPanel = document.querySelector('[data-preview-area], .preview-panel, .right-panel');
  
  if (!previewPanel) {
    console.error('[AdPilot] Preview panel not found');
    return;
  }
  
  // Hide existing preview
  if (previewPanel.style.display !== 'none') {
    previewPanel.dataset.adpilotHidden = 'true';
    previewPanel.style.display = 'none';
  }
  
  // Create or show AdPilot container
  let adpilotContainer = document.getElementById('adpilot-container');
  
  if (!adpilotContainer) {
    // Create container
    adpilotContainer = document.createElement('div');
    adpilotContainer.id = 'adpilot-container';
    adpilotContainer.className = 'lovable-cloud-container'; // Match Cloud section style
    adpilotContainer.style.cssText = `
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: var(--lovable-bg-primary, #0a0a0a);
      z-index: 1000;
    `;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'adpilot-iframe';
    iframe.src = 'https://lovable.adpilot.com'; // AdPilot UI service URL
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: inherit;
    `;
    
    // Send project context when iframe loads
    iframe.addEventListener('load', () => {
      sendProjectContext(iframe);
    });
    
    adpilotContainer.appendChild(iframe);
    document.body.appendChild(adpilotContainer);
  } else {
    adpilotContainer.style.display = 'block';
  }
  
  // Mark tab as active
  document.querySelectorAll('.lovable-tab-button').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById('adpilot-ads-tab')?.classList.add('active');
}

// Send project context to iframe
function sendProjectContext(iframe) {
  const projectId = getLovableProjectId();
  const projectUrl = window.location.href;
  const supabaseConfig = detectSupabaseConfig();
  
  const message = {
    type: 'ADPILOT_PROJECT_CONTEXT',
    payload: {
      lovableProjectId: projectId,
      lovableProjectUrl: projectUrl,
      supabaseUrl: supabaseConfig.supabaseUrl,
      supabaseAnonKey: supabaseConfig.supabaseAnonKey,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  };
  
  console.log('[AdPilot] Sending project context:', message);
  iframe.contentWindow.postMessage(message, 'https://lovable.adpilot.com');
}

// Listen for messages from iframe
window.addEventListener('message', (event) => {
  // Validate origin
  if (!event.origin.includes('adpilot.com')) {
    return;
  }
  
  // Handle message types
  if (event.data.type === 'ADPILOT_REQUEST_CONTEXT') {
    const iframe = document.getElementById('adpilot-iframe');
    if (iframe) {
      sendProjectContext(iframe);
    }
  }
});

// Initialize
if (isLovableEditor()) {
  console.log('[AdPilot] Lovable editor detected');
  
  // Inject tab when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAdsTab);
  } else {
    injectAdsTab();
  }
  
  // Handle SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('[AdPilot] URL changed, re-injecting');
      injectAdsTab();
    }
  }).observe(document, { subtree: true, childList: true });
}

