/**
 * AdPilot for Lovable - Background Service Worker
 * 
 * Responsibilities:
 * - Handle extension lifecycle events
 * - Manage persistent state
 * - No business logic (pure infrastructure)
 */

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[AdPilot] Extension installed:', details.reason);
  
  // Set default server configuration
  chrome.storage.local.get(['adpilot_server'], (result) => {
    if (!result.adpilot_server) {
      // Default to staging for unpacked extensions, production for packaged
      const manifest = chrome.runtime.getManifest();
      const defaultServer = manifest.update_url ? 'prod' : 'staging';
      
      chrome.storage.local.set({ adpilot_server: defaultServer }, () => {
        console.log('[AdPilot] Default server set to:', defaultServer);
        console.log('[AdPilot] Change with: chrome.storage.local.set({adpilot_server: "dev|staging|prod"})');
      });
    }
  });
  
  if (details.reason === 'install') {
    // First install - show welcome page
    chrome.tabs.create({
      url: 'https://adpilot.com/lovable/welcome'
    });
  }
});

// Extension messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AdPilot] Message received:', message.type);
  
  // Handle different message types
  switch (message.type) {
    case 'EXTENSION_READY':
      sendResponse({ success: true, version: chrome.runtime.getManifest().version });
      break;
      
    case 'STORE_DATA':
      // Store data in chrome.storage
      chrome.storage.local.set(message.data, () => {
        sendResponse({ success: true });
      });
      return true; // Keep channel open for async response
      
    case 'GET_DATA':
      // Retrieve data from chrome.storage
      chrome.storage.local.get(message.keys, (data) => {
        sendResponse({ success: true, data });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Tab updated - check if Lovable project page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('lovable.dev/projects/')) {
      console.log('[AdPilot] Lovable project page detected:', tab.url);
    }
  }
});

