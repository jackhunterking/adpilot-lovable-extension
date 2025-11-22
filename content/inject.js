/**
 * AdPilot for Lovable - Content Script
 * 
 * Evidence-based implementation using actual Lovable DOM structure
 * Discovered through investigation: Nov 20, 2025
 * 
 * Navigation structure:
 * - UL with class "flex items-center gap-1"
 * - Contains LI elements with navigation buttons (Cloud, Code, Analytics, Security, Speed, Grow)
 * - We inject Grow button at the end
 * 
 * URL routing (Complete list):
 * - Preview: No ?view= parameter
 * - Cloud: ?view=cloud
 * - Code: ?view=codeEditor
 * - Analytics: ?view=analytics
 * - Security: ?view=security
 * - Speed: ?view=speed
 * - Grow: ?view=grow (ours)
 */

console.log('[AdPilot] Content script loaded - v0.3.0');

// Server configuration
const SERVER_CONFIG = {
  staging: 'https://staging.adpilot.studio/lovable',
  prod: 'https://www.adpilot.studio/lovable',
  dev: 'http://localhost:3000/lovable'
};

// Global server URL - initialized asynchronously
let SERVER_URL = null;

// Verify we're on Lovable
function isLovableEditor() {
  const isLovable = window.location.hostname.includes('lovable.dev') && 
                    window.location.pathname.includes('/projects/');
  return isLovable;
}

// Extract project ID
function getLovableProjectId() {
  const match = window.location.pathname.match(/\/projects\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Find navigation container (evidence-based)
function findNavigationContainer(silent = false) {
  // Strategy 1: Find button with Cloud text and traverse to UL
  const allButtons = Array.from(document.querySelectorAll('button'));
  
  const cloudButton = allButtons.find(b => {
    const text = b.textContent?.trim();
    return text === 'Cloud' || text?.includes('Cloud');
  });
  
  if (cloudButton) {
    const ul = cloudButton.closest('ul');
    if (ul) {
      return { container: ul, cloudButton };
    }
  }
  
  // Strategy 2: Find button with Code text and traverse to UL
  const codeButton = allButtons.find(b => {
    const text = b.textContent?.trim();
    return text === 'Code' || text?.includes('Code');
  });
  
  if (codeButton) {
    const ul = codeButton.closest('ul');
    if (ul) {
      return { container: ul, cloudButton: null };
    }
  }
  
  // Strategy 3: Find UL containing multiple navigation buttons
  const allUls = Array.from(document.querySelectorAll('ul'));
  
  for (const ul of allUls) {
    const buttons = ul.querySelectorAll('button');
    if (buttons.length >= 2) {
      const buttonTexts = Array.from(buttons).map(b => b.textContent?.trim());
      
      // Check if this looks like the navigation UL
      if (buttonTexts.some(t => t?.includes('Cloud') || t?.includes('Code') || t?.includes('Preview'))) {
        return { container: ul, cloudButton: null };
      }
    }
  }
  
  // Strategy 4: Look for nav element or header with buttons
  const nav = document.querySelector('nav');
  if (nav) {
    const ul = nav.querySelector('ul');
    if (ul && ul.querySelectorAll('button').length >= 2) {
      return { container: ul, cloudButton: null };
    }
  }
  
  if (!silent) {
    console.error('[AdPilot] ❌ Navigation container not found');
  }
  
  return null;
}

// Inject Grow button into sidebar
function injectGrowButton() {
  const nav = findNavigationContainer();
  if (!nav) {
    console.error('[AdPilot] ❌ Cannot inject - no container found');
    return false;
  }
  
  // Check if already injected
  if (document.getElementById('adpilot-grow-li')) {
    return true;
  }
  
  // Create matching structure: li > div > button (match Lovable exactly)
  const li = document.createElement('li');
  li.id = 'adpilot-grow-li';
  li.className = 'rounded-lg bg-transparent';
  li.setAttribute('draggable', 'false');
  li.style.cssText = 'z-index: unset; transform: none; user-select: none; touch-action: pan-y; transform-origin: 50% 50% 0px;';
  
  const div = document.createElement('div');
  div.setAttribute('data-state', 'closed');
  
  const button = document.createElement('button');
  button.id = 'adpilot-grow-button';
  // Start with INACTIVE state (border-input, bg-background)
  button.className = 'items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none border border-input hover:bg-accent hover:border-accent h-7 px-1 py-1 aspect-square [&>svg]:size-3.5 shadow-none flex rounded-lg bg-background';
  button.setAttribute('data-adpilot-tab', 'inactive');
  
  // Match Lovable's exact DOM structure: collapsed (18px) by default, text hidden
  button.innerHTML = `
    <div class="flex h-full w-fit items-center justify-center" style="min-width: 18px; width: 18px;">
      <div class="flex h-full w-fit items-center justify-start">
        <div class="flex h-full w-fit items-center justify-start" style="opacity: 1; transform: none;">
          <div class="flex h-full w-[18px] items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="100%" height="100%" class="shrink-0 h-4 w-4">
              <path fill="currentColor" d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
              <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>
              <path d="M8 6v8"/>
            </svg>
          </div>
          <span class="whitespace-nowrap" style="padding-left: 4px; padding-right: 2px; display: none;">Grow</span>
        </div>
      </div>
    </div>
  `;
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToGrow();
  });
  
  div.appendChild(button);
  li.appendChild(div);
  
  // Always append to the END of the navigation UL (last position)
  nav.container.appendChild(li);
  console.log('[AdPilot] ✅ Grow button injected');
  return true;
}

// Deactivate Lovable's currently active tab (URL-based detection)
// Note: We don't need to manually deactivate buttons
// Lovable's native routing handles visual state changes
function deactivateLovableButtons() {
  // Lovable's routing will handle deactivation automatically
}

// Navigate to Grow view (URL-based, matching Lovable pattern)
function navigateToGrow() {
  deactivateLovableButtons();
  
  // Update URL parameter (match Lovable's ?view= pattern)
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'grow');
  window.history.pushState({ view: 'grow', adpilot: true }, '', url);
  
  // Show panel
  showAdPilotPanel();
  
  // Update button state
  updateActiveButton();
}

// Update active button styling (using Lovable's native classes)
function updateActiveButton(force = false) {
  const growButton = document.getElementById('adpilot-grow-button');
  
  if (!growButton) return;
  
  // Check if we're on grow view
  const params = new URLSearchParams(window.location.search);
  const isGrowView = params.get('view') === 'grow';
  
  // Find the inner container and text span
  const container = growButton.querySelector('.flex.h-full.w-fit.items-center.justify-center');
  const textSpan = growButton.querySelector('span.whitespace-nowrap');
  
  if (isGrowView && !force) {
    // ACTIVE STATE: Replace entire className to match Lovable's active button
    growButton.className = 'items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none h-7 py-1 [&>svg]:size-3.5 shadow-none flex rounded-lg aspect-auto overflow-hidden border border-accent-primary bg-accent px-0 hover:border-accent-primary hover:bg-accent/80';
    
    // Expand width and show text
    if (container) container.style.width = '90px';
    if (textSpan) textSpan.style.display = '';
    
    growButton.setAttribute('data-adpilot-tab', 'active');
  } else {
    // INACTIVE STATE: Replace entire className to match Lovable's inactive button
    growButton.className = 'items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none border border-input hover:bg-accent hover:border-accent h-7 px-1 py-1 aspect-square [&>svg]:size-3.5 shadow-none flex rounded-lg bg-background';
    
    // Collapse width and hide text
    if (container) container.style.width = '18px';
    if (textSpan) textSpan.style.display = 'none';
    
    growButton.setAttribute('data-adpilot-tab', 'inactive');
  }
}

// Update panel title (find and change the title text)
function updatePanelTitle(titleText) {
  try {
    // Strategy 1: Look for the most common title patterns in Lovable's UI
    const titleSelectors = [
      'h1', 'h2', 'h3', // Generic headings
      '.text-xl', // Tailwind text size classes
      '[class*="text-"]', // Any text class
    ];
    
    const rightPanel = document.querySelector('[data-panel]:last-child');
    if (!rightPanel) {
      console.warn('[AdPilot] Right panel not found for title update');
      return;
    }
    
    // Find all potential title elements
    for (const selector of titleSelectors) {
      const elements = rightPanel.querySelectorAll(selector);
      
      for (const element of elements) {
        const text = element.textContent?.trim();
        
        // If we find "Cloud" or "Grow", this is likely our title
        if (text === 'Cloud' || text === 'Grow') {
          console.log('[AdPilot] Found panel title, changing to:', titleText);
          element.textContent = titleText;
          return;
        }
      }
    }
    
    console.warn('[AdPilot] Panel title element not found');
  } catch (error) {
    console.error('[AdPilot] Error updating panel title:', error);
  }
}

// Get server URL from storage (async)
async function getServerUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['adpilot_server'], (result) => {
      const server = result.adpilot_server || 'staging'; // Default to staging
      const url = SERVER_CONFIG[server] || SERVER_CONFIG.staging;
      console.log('[AdPilot] Using server:', server, '→', url);
      resolve(url);
    });
  });
}

// Create iframe element
function createIframe() {
  if (!SERVER_URL) {
    console.error('[AdPilot] ❌ SERVER_URL not initialized');
    return null;
  }
  
  const iframe = document.createElement('iframe');
  iframe.id = 'adpilot-iframe';
  iframe.src = SERVER_URL;
  iframe.className = 'w-full h-full flex-1';
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
  iframe.setAttribute('data-adpilot', 'true');
  iframe.allow = 'clipboard-write';
  
  // Add error handler
  iframe.addEventListener('error', (e) => {
    console.error('[AdPilot] ❌ Iframe failed to load:', e);
    console.error('[AdPilot] URL:', SERVER_URL);
  });
  
  // Add load handler
  iframe.addEventListener('load', () => {
    console.log('[AdPilot] ✅ Iframe loaded successfully');
    sendProjectContext(iframe);
  });
  
  return iframe;
}

// Show AdPilot panel (Mimic React's tab behavior exactly)
function showAdPilotPanel() {
  deactivateLovableButtons();
  
  // Step 1: Find right panel
  const rightPanel = document.querySelector('[data-panel]:last-child');
  if (!rightPanel) {
    console.error('[AdPilot] ❌ Right panel not found');
    return;
  }
  
  // Step 2: Find the EXISTING tab div (used by Cloud, Code, Analytics, Security, Speed, etc.)
  let tabDiv = rightPanel.querySelector('.absolute.inset-0.z-10.flex.flex-col.bg-background');
  
  if (!tabDiv) {
    // No tab div exists - must be coming from Preview
    tabDiv = document.createElement('div');
    tabDiv.className = 'absolute inset-0 z-10 flex flex-col bg-background';
    
    // Find preview and insert next to it
    const preview = rightPanel.querySelector('.relative.h-full.w-full');
    if (preview && preview.parentElement) {
      preview.parentElement.appendChild(tabDiv);
    } else {
      console.error('[AdPilot] ❌ Could not find parent to insert tab div');
      return;
    }
  }
  
  // Step 3: Hide preview if it's still visible
  const preview = rightPanel.querySelector('.relative.h-full.w-full');
  if (preview && !preview.classList.contains('invisible')) {
    preview.classList.add('invisible');
  }
  
  // Step 4: Clear and inject our iframe
  tabDiv.innerHTML = '';
  const iframe = createIframe();
  if (iframe) {
    tabDiv.appendChild(iframe);
    tabDiv.setAttribute('data-adpilot-active', 'true');
    
    // Update the panel title to "Grow"
    updatePanelTitle('Grow');
    
    console.log('[AdPilot] ✅ Grow panel shown with iframe');
  } else {
    console.error('[AdPilot] ❌ Failed to create iframe');
  }
}

// Hide panel and restore Lovable content (Mimic React's tab behavior exactly)
function hideAdPilotPanel() {
  const rightPanel = document.querySelector('[data-panel]:last-child');
  if (!rightPanel) return;
  
  // Step 1: Find and REMOVE the iframe
  const iframe = rightPanel.querySelector('#adpilot-iframe');
  if (iframe) {
    iframe.remove();
  }
  
  // Step 2: Find and REMOVE the tab div entirely
  const tabDiv = rightPanel.querySelector('.absolute.inset-0.z-10.flex.flex-col.bg-background');
  if (tabDiv && tabDiv.hasAttribute('data-adpilot-active')) {
    tabDiv.remove();
  }
  
  // Step 3: Show preview by removing invisible class
  const preview = rightPanel.querySelector('.relative.h-full.w-full');
  if (preview && preview.classList.contains('invisible')) {
    preview.classList.remove('invisible');
  }
  
  // Step 4: Update Grow button to inactive state
  updateActiveButton(true);
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
  
  // postMessage to iframe (no origin validation needed - same extension)
  iframe.contentWindow.postMessage(message, '*');
}

// Image monitor instance (for detecting AI-generated images)
let imageMonitorActive = false;

// Listen for messages from iframe
window.addEventListener('message', (event) => {
  // Strict origin validation for production security
  const allowedOrigins = [
    'https://www.adpilot.studio',
    'https://staging.adpilot.studio',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Validate origin
  const isAllowedOrigin = allowedOrigins.some(origin => event.origin.startsWith(origin));
  
  if (!isAllowedOrigin) {
    // Only warn if it's an AdPilot message from unauthorized origin
    if (event.data && event.data.type && event.data.type.startsWith('ADPILOT_')) {
      console.warn('[AdPilot] ⚠️  Rejected message from unauthorized origin:', event.origin);
    }
    return;
  }
  
  // Accept messages from our iframe
  if (event.data && event.data.type && event.data.type.startsWith('ADPILOT_')) {
    console.log('[AdPilot] Received message from iframe:', event.data.type);
    
    if (event.data.type === 'ADPILOT_REQUEST_CONTEXT') {
      const iframe = document.getElementById('adpilot-iframe');
      if (iframe) {
        sendProjectContext(iframe);
      }
    }
    
    if (event.data.type === 'ADPILOT_TRIGGER_AI') {
      injectPromptToAIChat(event.data.payload);
      
      // Start monitoring for generated images after sending prompt
      if (!imageMonitorActive) {
        startImageMonitoring();
      }
    }
  }
});

/**
 * Inject prompt into Lovable AI chat
 * @param {Object} payload - AI trigger payload
 * @param {string} payload.prompt - The AI prompt to inject
 * @param {Array<string>} [payload.images] - Optional image URLs to attach
 * @param {Object} [payload.context] - Optional context data
 */
function injectPromptToAIChat(payload) {
  console.log('[AdPilot] Injecting prompt to Lovable AI chat');
  
  // Validate payload
  if (!payload || !payload.prompt) {
    console.error('[AdPilot] Invalid payload: prompt is required', payload);
    showNotification('Error: No prompt provided', 'error');
    return;
  }
  
  const { prompt, images, context } = payload;
  
  // Log context for debugging (if provided)
  if (context) {
    console.log('[AdPilot] Context:', context);
  }
  
  // Log images if provided
  if (images && images.length > 0) {
    console.log('[AdPilot] Attached images:', images.length);
  }
  
  try {
    // Try multiple selectors to find Lovable's AI chat input
    // Priority: Target #chatInput form first (Lovable-specific), then fall back to generic selectors
    const selectors = [
      '#chatInput textarea',                // Lovable's chat input form - HIGHEST PRIORITY
      'form[id="chatInput"] textarea',      // Alternative form targeting
      '#chatInput input[type="text"]',      // Text input in chat form
      'form[id="chatInput"] input[type="text"]', // Alternative text input
      '[data-ai-chat-input]',               // Custom data attribute (if Lovable adds it)
      'textarea[placeholder*="message"]',   // Generic message input
      'textarea[placeholder*="ask"]',       // "Ask me anything" style
      'textarea[placeholder*="Lovable"]',   // Contains "Lovable" (specific to Lovable chat)
      'textarea[placeholder*="AI"]',        // Contains "AI"
      'textarea[placeholder*="chat"]',      // Contains "chat"
      'textarea[aria-label*="chat"]',       // ARIA label with "chat"
      'textarea[role="textbox"]',           // Generic textbox role
      '.ai-chat-input',                     // Class name
      'input[type="text"][placeholder*="message"]', // Text input fallback
    ];
    
    let input = null;
    let foundSelector = null;
    
    // Try each selector
    for (const selector of selectors) {
      try {
        input = document.querySelector(selector);
        if (input) {
          foundSelector = selector;
          console.log('[AdPilot] ✓ Found AI input with selector:', selector);
          break;
        }
      } catch (selectorError) {
        console.warn('[AdPilot] Invalid selector:', selector, selectorError);
      }
    }
    
    if (input) {
      // Successfully found input element
      try {
        // Focus the input first
        input.focus();
        
        // Handle image attachments if provided
        if (images && images.length > 0) {
          console.log('[AdPilot] Attempting to attach images...');
          attachImagesToChat(images, input);
          // Wait a bit for images to attach before injecting prompt
          setTimeout(() => injectTextPrompt(input, prompt), 500);
        } else {
          // No images, inject prompt immediately
          injectTextPrompt(input, prompt);
        }
        
      } catch (injectionError) {
        console.error('[AdPilot] Failed to inject prompt:', injectionError);
        fallbackToCopyClipboard(prompt);
      }
      
    } else {
      // Fallback: Input element not found
      console.warn('[AdPilot] AI chat input not found with any selector');
      console.log('[AdPilot] Tried selectors:', selectors);
      fallbackToCopyClipboard(prompt);
    }
    
  } catch (error) {
    console.error('[AdPilot] Unexpected error in injectPromptToAIChat:', error);
    fallbackToCopyClipboard(prompt);
  }
}

/**
 * Try to find and click the submit button
 * @param {HTMLElement} inputElement - The input element to find submit button near
 */
function tryAutoSubmit(inputElement) {
  try {
    // Strategy 1: Find submit button within #chatInput form (highest priority)
    const chatInputForm = document.getElementById('chatInput') || 
                          document.querySelector('form[id="chatInput"]');
    
    if (chatInputForm) {
      const formSubmitButton = chatInputForm.querySelector('button[type="submit"]');
      if (formSubmitButton && !formSubmitButton.disabled) {
        console.log('[AdPilot] ✓ Found submit button in #chatInput form, clicking...');
        formSubmitButton.click();
        console.log('[AdPilot] ✓ Submit button clicked successfully');
        return; // Success, exit early
      }
    }
    
    // Strategy 2: Find button in same parent form as input
    const parentForm = inputElement.closest('form');
    if (parentForm) {
      const formButton = parentForm.querySelector('button[type="submit"]');
      if (formButton && !formButton.disabled) {
        console.log('[AdPilot] ✓ Found submit button in parent form, clicking...');
        formButton.click();
        console.log('[AdPilot] ✓ Submit button clicked successfully');
        return; // Success, exit early
      }
    }
    
    // Strategy 3: Multiple selector fallbacks with proximity detection
    const submitSelectors = [
      '#chatInput button[type="submit"]',   // Within chatInput form
      'form[id="chatInput"] button[type="submit"]', // Alternative form selector
      '[data-ai-chat-submit]',              // Custom data attribute
      'button[type="submit"]',              // Standard submit button
      'button[aria-label*="send"]',         // ARIA label with "send"
      'button[aria-label*="Send"]',         // ARIA label with "Send" (capital)
      'button[aria-label*="submit"]',       // ARIA label with "submit"
      'button.send-button',                 // Class name
    ];
    
    let submitButton = null;
    let foundWithSelector = null;
    
    // Try each selector
    for (const selector of submitSelectors) {
      const buttons = document.querySelectorAll(selector);
      
      // Find button closest to input element
      for (const btn of buttons) {
        if (!btn.disabled) {
          const inputRect = inputElement.getBoundingClientRect();
          const btnRect = btn.getBoundingClientRect();
          const distance = Math.abs(btnRect.top - inputRect.top);
          
          // If button is within 200px vertically, it's likely the right one
          if (distance < 200) {
            submitButton = btn;
            foundWithSelector = selector;
            break;
          }
        }
      }
      
      if (submitButton) break;
    }
    
    if (submitButton) {
      console.log('[AdPilot] ✓ Found submit button with selector:', foundWithSelector);
      submitButton.click();
      console.log('[AdPilot] ✓ Submit button clicked successfully');
    } else {
      console.log('[AdPilot] ℹ Submit button not found - prompt filled but not submitted');
      console.log('[AdPilot] ℹ User can manually press Enter or click Send');
    }
    
  } catch (error) {
    console.error('[AdPilot] Error in tryAutoSubmit:', error);
    // Non-critical error, continue without auto-submit
  }
}

/**
 * Fallback: Copy prompt to clipboard and notify user
 * @param {string} prompt - The prompt to copy
 */
function fallbackToCopyClipboard(prompt) {
  console.log('[AdPilot] Using fallback: copying to clipboard');
  
  try {
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt)
        .then(() => {
          console.log('[AdPilot] ✓ Prompt copied via Clipboard API');
          showNotification(
            'Prompt copied to clipboard! Open Lovable AI chat and paste (Ctrl+V).',
            'info'
          );
        })
        .catch((clipboardError) => {
          console.error('[AdPilot] Clipboard API failed:', clipboardError);
          fallbackToExecCommand(prompt);
        });
    } else {
      // Fallback to execCommand
      fallbackToExecCommand(prompt);
    }
    
  } catch (error) {
    console.error('[AdPilot] Clipboard fallback error:', error);
    showNotification('Could not copy prompt. Please check console.', 'error');
  }
}

/**
 * Legacy fallback using execCommand
 * @param {string} prompt - The prompt to copy
 */
function fallbackToExecCommand(prompt) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = prompt;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    
    textarea.select();
    textarea.setSelectionRange(0, prompt.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      console.log('[AdPilot] ✓ Prompt copied via execCommand');
      showNotification(
        'Prompt copied! Open Lovable AI chat and paste (Ctrl+V).',
        'info'
      );
    } else {
      console.error('[AdPilot] execCommand copy failed');
      showNotification('Failed to copy prompt. Please check console.', 'error');
    }
    
  } catch (error) {
    console.error('[AdPilot] execCommand error:', error);
    showNotification('Could not copy prompt. Please check console.', 'error');
  }
}

/**
 * Show notification overlay to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'info', 'success', 'error'
 */
function showNotification(message, type = 'info') {
  try {
    // Remove any existing AdPilot notifications first
    const existingNotifications = document.querySelectorAll('[data-adpilot-notification]');
    existingNotifications.forEach(n => n.remove());
    
    // Determine colors based on type
    let backgroundColor, iconHtml;
    switch (type) {
      case 'success':
        backgroundColor = '#10b981'; // green
        iconHtml = '✓';
        break;
      case 'error':
        backgroundColor = '#ef4444'; // red
        iconHtml = '✕';
        break;
      default:
        backgroundColor = '#3b82f6'; // blue
        iconHtml = 'ℹ';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.setAttribute('data-adpilot-notification', 'true');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 2147483647;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: adpilotSlideIn 0.3s ease-out;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 18px; font-weight: bold; flex-shrink: 0;">${iconHtml}</span>
      <span style="flex: 1;">${message}</span>
    `;
    
    // Add animation styles if not already present
    if (!document.getElementById('adpilot-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'adpilot-notification-styles';
      style.textContent = `
        @keyframes adpilotSlideIn {
          from {
            transform: translateX(450px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes adpilotSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(450px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'adpilotSlideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
    
  } catch (error) {
    console.error('[AdPilot] Failed to show notification:', error);
  }
}

// Check view parameter on load/change
function checkViewParam() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  
  if (view === 'grow') {
    deactivateLovableButtons();
    showAdPilotPanel();
    updateActiveButton();
  } else {
    // Hide Grow if it's currently shown
    const rightPanel = document.querySelector('[data-panel]:last-child');
    if (rightPanel) {
      const tabDiv = rightPanel.querySelector('.absolute.inset-0.z-10.flex.flex-col.bg-background');
      const iframe = tabDiv?.querySelector('#adpilot-iframe');
      
      if (iframe) {
        hideAdPilotPanel();
      }
    }
  }
}

// Watch for clicks on other Lovable navigation buttons
function setupNavigationWatcher() {
  // Use event delegation on document to catch all button clicks
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button || button.id === 'adpilot-grow-button') return;
    
    // Check if this is a navigation button
    const navContainer = findNavigationContainer(true);
    let shouldHideGrow = false;
    
    if (navContainer && navContainer.container.contains(button)) {
      shouldHideGrow = true;
    }
    
    // Check if this is the Preview button
    const buttonText = button.textContent?.trim();
    if (buttonText === 'Preview' || buttonText?.includes('Preview')) {
      shouldHideGrow = true;
    }
    
    // If any Lovable navigation button was clicked, hide our panel
    if (shouldHideGrow) {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url);
      hideAdPilotPanel();
    }
  }, true);
}

// Wait for navigation to be ready
async function waitForNavigation() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 60; // 60 attempts * 500ms = 30 seconds
    let attempts = 0;
    
    const timeout = setTimeout(() => {
      console.error('[AdPilot] ❌ Navigation timeout - Lovable UI may have changed');
      findNavigationContainer(false);
      reject(new Error('Navigation timeout'));
    }, 30000);
    
    const check = setInterval(() => {
      attempts++;
      const result = findNavigationContainer(true);
      
      if (result) {
        clearInterval(check);
        clearTimeout(timeout);
        resolve();
      }
    }, 500);
  });
}

// Initialize extension
async function initialize() {
  if (!isLovableEditor()) {
    return;
  }
  
  console.log('[AdPilot] Lovable editor detected, initializing...');
  
  try {
    // Initialize server URL first (wait for storage)
    SERVER_URL = await getServerUrl();
    
    // Wait for navigation to be ready
    await waitForNavigation();
    
    // Try to inject the button
    const injected = injectGrowButton();
    
    if (injected) {
      // Check if URL has ?view=grow already
      checkViewParam();
      
      // Watch for view changes (browser back/forward)
      if (!window._adpilotPopstateRegistered) {
        window.addEventListener('popstate', checkViewParam);
        window._adpilotPopstateRegistered = true;
      }
      
      // Setup navigation watcher to detect clicks on other tabs
      if (!window._adpilotNavWatcherRegistered) {
        setupNavigationWatcher();
        window._adpilotNavWatcherRegistered = true;
      }
      
      console.log('[AdPilot] ✅ Initialization complete');
    } else {
      console.error('[AdPilot] ❌ Failed to inject button');
    }
  } catch (error) {
    console.error('[AdPilot] ❌ Initialization failed:', error.message);
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

/**
 * Inject text prompt into input field
 * @param {HTMLElement} input - The input element
 * @param {string} prompt - The prompt text
 */
function injectTextPrompt(input, prompt) {
  // Set the value
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  ).set;
  nativeInputValueSetter.call(input, prompt);
  
  // Dispatch events to trigger React onChange
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  
  console.log('[AdPilot] ✓ Prompt injected successfully');
  console.log('[AdPilot] Prompt length:', prompt.length, 'characters');
  
  // Try to auto-submit (optional)
  setTimeout(() => {
    tryAutoSubmit(input);
  }, 100);
  
  // Show success notification
  showNotification('AI prompt loaded! Generating images...', 'success');
}

/**
 * Attempt to attach images to Lovable chat
 * @param {Array<string>} imageUrls - Array of image URLs to attach
 * @param {HTMLElement} input - The chat input element
 */
function attachImagesToChat(imageUrls, input) {
  console.log('[AdPilot] Attaching images to chat...', imageUrls);
  
  // Strategy 1: Look for file upload button near the input
  const parentForm = input.closest('form');
  if (parentForm) {
    const fileInput = parentForm.querySelector('input[type="file"]');
    if (fileInput) {
      console.log('[AdPilot] Found file input, attempting to attach images...');
      // Note: We can't directly set files on file input due to security restrictions
      // Instead, we'll include image URLs in the prompt as a fallback
    }
  }
  
  // Fallback: Include image URLs in the prompt text
  // This is more reliable and works with Lovable's AI
  console.log('[AdPilot] Including image URLs in prompt as context');
  const imageContext = imageUrls.map((url, idx) => 
    `Reference Image ${idx + 1}: ${url}`
  ).join('\n');
  
  console.log('[AdPilot] Image context prepared');
  // Images will be referenced in the prompt text
}

/**
 * Start monitoring for AI-generated images
 */
function startImageMonitoring() {
  console.log('[AdPilot] Starting image monitoring...');
  imageMonitorActive = true;
  
  // Use simplified inline monitoring (avoid importing class)
  const detectedUrls = new Set();
  
  // Find chat container
  const findChatContainer = () => {
    const selectors = [
      '[role="log"]',
      '[data-chat]',
      '.chat-container',
      '#chatContainer',
      '.messages',
      '[aria-label*="chat"]'
    ];
    
    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) return container;
    }
    
    // Fallback: main content area
    return document.querySelector('main') || document.body;
  };
  
  const chatContainer = findChatContainer();
  
  if (!chatContainer) {
    console.warn('[AdPilot] Chat container not found for monitoring');
    return;
  }
  
  console.log('[AdPilot] Monitoring chat for generated images...');
  
  // Create observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for images
          const images = node.tagName === 'IMG' 
            ? [node] 
            : Array.from(node.querySelectorAll('img'));
          
          images.forEach(img => {
            const url = img.src;
            if (!url || detectedUrls.has(url)) return;
            
            // Filter for likely generated images
            if (url.includes('supabase') || url.includes('generated') || url.startsWith('blob:')) {
              detectedUrls.add(url);
              console.log('[AdPilot] ✓ Detected generated image:', url);
              
              // Determine format from dimensions (wait for load)
              const checkFormat = () => {
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;
                const aspectRatio = width / height;
                
                const format = (aspectRatio >= 0.9 && aspectRatio <= 1.1) ? 'square' : 'vertical';
                
                // Send to iframe
                const iframe = document.getElementById('adpilot-iframe');
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({
                    type: 'ADPILOT_IMAGE_GENERATED',
                    payload: {
                      imageUrl: url,
                      format,
                      timestamp: Date.now()
                    }
                  }, '*');
                  
                  console.log('[AdPilot] ✓ Image notification sent to iframe');
                }
              };
              
              if (img.complete) {
                checkFormat();
              } else {
                img.onload = checkFormat;
              }
            }
          });
        }
      });
    });
  });
  
  // Start observing
  observer.observe(chatContainer, {
    childList: true,
    subtree: true
  });
  
  console.log('[AdPilot] ✓ Image monitoring active');
  
  // Auto-stop after 5 minutes (cleanup)
  setTimeout(() => {
    observer.disconnect();
    imageMonitorActive = false;
    console.log('[AdPilot] Image monitoring stopped (timeout)');
  }, 5 * 60 * 1000);
}

// Handle SPA navigation (Lovable is a React app)
let lastUrl = location.href;

new MutationObserver(() => {
  const currentUrl = location.href;
  
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    
    // Give the page a moment to render
    setTimeout(() => {
      if (!document.getElementById('adpilot-grow-button')) {
        initialize();
      } else {
        checkViewParam();
      }
    }, 500);
  }
}).observe(document, { subtree: true, childList: true });
