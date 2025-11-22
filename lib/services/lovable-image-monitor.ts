/**
 * Lovable Image Monitor Service
 * Purpose: Monitor Lovable AI chat for generated images using MutationObserver
 * 
 * Features:
 * - Watch chat container for new image elements
 * - Detect AI-generated images (not existing ones)
 * - Extract image URLs from Lovable DOM
 * - Send notifications back to iframe
 * 
 * Usage (in content script):
 * ```javascript
 * const monitor = new LovableImageMonitor((imageUrl) => {
 *   // Send to iframe
 *   iframe.contentWindow.postMessage({
 *     type: 'ADPILOT_IMAGE_GENERATED',
 *     payload: { imageUrl, timestamp: Date.now() }
 *   }, '*')
 * })
 * monitor.start()
 * ```
 */

export interface DetectedImage {
  url: string
  format?: 'square' | 'vertical'
  timestamp: number
  element: HTMLImageElement
}

export class LovableImageMonitor {
  private observer: MutationObserver | null = null
  private onImageDetected: (image: DetectedImage) => void
  private detectedUrls = new Set<string>() // Prevent duplicate notifications
  private isMonitoring = false
  
  constructor(onImageDetected: (image: DetectedImage) => void) {
    this.onImageDetected = onImageDetected
  }
  
  /**
   * Start monitoring Lovable chat for generated images
   */
  start() {
    if (this.isMonitoring) {
      console.log('[LovableImageMonitor] Already monitoring')
      return
    }
    
    console.log('[LovableImageMonitor] Starting image monitoring...')
    
    // Find chat container
    const chatContainer = this.findChatContainer()
    
    if (!chatContainer) {
      console.warn('[LovableImageMonitor] Chat container not found')
      // Retry after a delay
      setTimeout(() => this.start(), 2000)
      return
    }
    
    console.log('[LovableImageMonitor] Chat container found, setting up observer')
    
    // Create MutationObserver
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations)
    })
    
    // Start observing
    this.observer.observe(chatContainer, {
      childList: true,
      subtree: true,
      attributes: false
    })
    
    this.isMonitoring = true
    console.log('[LovableImageMonitor] ✓ Monitoring active')
  }
  
  /**
   * Stop monitoring
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    this.isMonitoring = false
    this.detectedUrls.clear()
    console.log('[LovableImageMonitor] Monitoring stopped')
  }
  
  /**
   * Handle DOM mutations
   */
  private handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      // Check added nodes
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.checkForImages(node as Element)
        }
      }
    }
  }
  
  /**
   * Check element and its children for images
   */
  private checkForImages(element: Element) {
    // Check if element itself is an image
    if (element.tagName === 'IMG') {
      this.handleImageElement(element as HTMLImageElement)
    }
    
    // Check children
    const images = element.querySelectorAll('img')
    images.forEach(img => this.handleImageElement(img))
  }
  
  /**
   * Handle discovered image element
   */
  private handleImageElement(img: HTMLImageElement) {
    const url = img.src || img.getAttribute('src')
    
    if (!url) return
    
    // Skip if already detected
    if (this.detectedUrls.has(url)) return
    
    // Validate this looks like a Lovable-generated image
    if (!this.isLovableImage(url)) return
    
    // Check if this is a new image (not an old one in chat history)
    if (!this.isNewImage(img)) return
    
    console.log('[LovableImageMonitor] ✓ New image detected:', url)
    
    // Mark as detected
    this.detectedUrls.add(url)
    
    // Determine format from dimensions
    const format = this.determineFormat(img)
    
    // Notify callback
    this.onImageDetected({
      url,
      format,
      timestamp: Date.now(),
      element: img
    })
  }
  
  /**
   * Check if URL looks like a Lovable-generated image
   */
  private isLovableImage(url: string): boolean {
    // Lovable images typically come from:
    // - Supabase Storage (lovable's storage)
    // - AI generation services
    // - Blob URLs (temporary)
    
    return (
      url.includes('supabase') ||
      url.includes('lovable') ||
      url.startsWith('blob:') ||
      url.includes('generated') ||
      url.includes('ai-image') ||
      // Generic image patterns
      /\.(png|jpg|jpeg|webp)/.test(url)
    )
  }
  
  /**
   * Check if this is a newly generated image (not from chat history)
   */
  private isNewImage(img: HTMLImageElement): boolean {
    // Strategy 1: Check if image is in viewport (newly added images are scrolled into view)
    const rect = img.getBoundingClientRect()
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
    
    // Strategy 2: Check parent elements for "new message" indicators
    let parent = img.parentElement
    let depth = 0
    while (parent && depth < 10) {
      // Look for class names that indicate new messages
      const classes = parent.className || ''
      if (
        classes.includes('new') ||
        classes.includes('latest') ||
        classes.includes('recent')
      ) {
        return true
      }
      parent = parent.parentElement
      depth++
    }
    
    // Strategy 3: Check if image was just loaded (complete but recently)
    // Newly generated images are likely still loading or just loaded
    return isInViewport || !img.complete
  }
  
  /**
   * Determine image format from dimensions
   */
  private determineFormat(img: HTMLImageElement): 'square' | 'vertical' | undefined {
    // Wait for image to load if not already loaded
    if (!img.complete) {
      img.onload = () => {
        // Re-check format after load
        const format = this.calculateFormat(img)
        console.log('[LovableImageMonitor] Format after load:', format, {
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      return undefined
    }
    
    return this.calculateFormat(img)
  }
  
  private calculateFormat(img: HTMLImageElement): 'square' | 'vertical' | undefined {
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height
    
    if (!width || !height) return undefined
    
    const aspectRatio = width / height
    
    // Square: aspect ratio close to 1:1 (allow 10% tolerance)
    if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
      return 'square'
    }
    
    // Vertical: aspect ratio less than 1 (taller than wide)
    if (aspectRatio < 0.9) {
      return 'vertical'
    }
    
    // Default to square for other cases
    return 'square'
  }
  
  /**
   * Find Lovable chat container
   */
  private findChatContainer(): Element | null {
    // Try multiple selectors
    const selectors = [
      '[role="log"]',              // Chat log container
      '[data-chat]',               // Custom chat attribute
      '.chat-container',           // Class name
      '#chatContainer',            // ID
      '.messages',                 // Generic messages container
      '[aria-label*="chat"]',      // ARIA label with "chat"
      '[aria-label*="messages"]',  // ARIA label with "messages"
    ]
    
    for (const selector of selectors) {
      const container = document.querySelector(selector)
      if (container) {
        console.log('[LovableImageMonitor] Found chat with selector:', selector)
        return container
      }
    }
    
    // Fallback: Find any div with lots of images (likely the chat)
    const allDivs = document.querySelectorAll('div')
    for (const div of allDivs) {
      const imageCount = div.querySelectorAll('img').length
      if (imageCount > 5) {
        console.log('[LovableImageMonitor] Found chat by image count:', imageCount)
        return div
      }
    }
    
    return null
  }
  
  /**
   * Reset detected URLs (for testing/debugging)
   */
  reset() {
    this.detectedUrls.clear()
    console.log('[LovableImageMonitor] Reset detected URLs')
  }
}

