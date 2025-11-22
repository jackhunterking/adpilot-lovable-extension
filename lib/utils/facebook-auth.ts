/**
 * Feature: Facebook OAuth Popup
 * Purpose: Handle Facebook OAuth in popup window (workaround for iframe X-Frame-Options)
 * References:
 *  - Meta OAuth: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */

/**
 * OAuth success message from callback page
 */
export interface FacebookOAuthSuccessMessage {
  type: 'FACEBOOK_OAUTH_SUCCESS'
  code: string
}

/**
 * OAuth error message from callback page
 */
export interface FacebookOAuthErrorMessage {
  type: 'FACEBOOK_OAUTH_ERROR'
  error: string
  error_description?: string
}

/**
 * Union type for OAuth messages
 */
export type FacebookOAuthMessage = FacebookOAuthSuccessMessage | FacebookOAuthErrorMessage

/**
 * Opens Facebook OAuth in popup window and returns authorization code
 * 
 * @returns Promise that resolves with OAuth code or rejects with error
 * 
 * @example
 * ```typescript
 * try {
 *   const code = await openFacebookOAuthPopup()
 *   // Exchange code for access token
 * } catch (error) {
 *   if (error.message === 'Popup blocked') {
 *     alert('Please allow popups for this site')
 *   }
 * }
 * ```
 */
export const openFacebookOAuthPopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Get Facebook App ID from environment
    const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID
    
    if (!fbAppId) {
      reject(new Error('Facebook App ID not configured. Please set NEXT_PUBLIC_FB_APP_ID in .env.local'))
      return
    }

    // Build OAuth URL
    const redirectUri = `${window.location.origin}/oauth/facebook/callback`
    const scope = 'ads_management,ads_read,business_management'
    const state = crypto.randomUUID() // CSRF protection
    
    const authUrl = 
      `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${fbAppId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}`

    console.log('[FacebookAuth] Opening OAuth popup:', {
      appId: fbAppId,
      redirectUri,
      scope,
    })

    // Open popup window
    const popup = window.open(
      authUrl,
      'Facebook Login',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      console.error('[FacebookAuth] Popup blocked by browser')
      reject(new Error('Popup blocked'))
      return
    }

    let messageHandlerActive = true

    // Listen for postMessage from callback page
    const handleMessage = (event: MessageEvent) => {
      if (!messageHandlerActive) return

      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) {
        console.warn('[FacebookAuth] Ignoring message from foreign origin:', event.origin)
        return
      }

      const data = event.data as FacebookOAuthMessage

      if (data.type === 'FACEBOOK_OAUTH_SUCCESS') {
        console.log('[FacebookAuth] ✓ OAuth success, received code')
        
        // Cleanup
        messageHandlerActive = false
        window.removeEventListener('message', handleMessage)
        clearInterval(checkClosed)
        
        // Close popup
        try {
          popup.close()
        } catch (e) {
          console.warn('[FacebookAuth] Could not close popup:', e)
        }
        
        // Resolve with code
        resolve(data.code)
        
      } else if (data.type === 'FACEBOOK_OAUTH_ERROR') {
        console.error('[FacebookAuth] OAuth error:', data.error)
        
        // Cleanup
        messageHandlerActive = false
        window.removeEventListener('message', handleMessage)
        clearInterval(checkClosed)
        
        // Close popup
        try {
          popup.close()
        } catch (e) {
          console.warn('[FacebookAuth] Could not close popup:', e)
        }
        
        // Reject with error
        reject(new Error(data.error_description || data.error || 'OAuth failed'))
      }
    }

    window.addEventListener('message', handleMessage)

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          console.log('[FacebookAuth] Popup closed by user')
          
          // Cleanup
          messageHandlerActive = false
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          
          // Reject
          reject(new Error('Popup closed by user'))
        }
      } catch (error) {
        // Popup might be inaccessible due to cross-origin
        console.warn('[FacebookAuth] Cannot check popup state:', error)
      }
    }, 1000)

    // Timeout after 5 minutes
    setTimeout(() => {
      if (messageHandlerActive) {
        console.error('[FacebookAuth] OAuth timeout after 5 minutes')
        
        // Cleanup
        messageHandlerActive = false
        window.removeEventListener('message', handleMessage)
        clearInterval(checkClosed)
        
        // Close popup
        try {
          popup.close()
        } catch (e) {
          console.warn('[FacebookAuth] Could not close popup:', e)
        }
        
        reject(new Error('OAuth timeout'))
      }
    }, 5 * 60 * 1000) // 5 minutes
  })
}

/**
 * Type guard to check if message is a Facebook OAuth message
 */
export function isFacebookOAuthMessage(message: any): message is FacebookOAuthMessage {
  return (
    message &&
    typeof message === 'object' &&
    (message.type === 'FACEBOOK_OAUTH_SUCCESS' || message.type === 'FACEBOOK_OAUTH_ERROR')
  )
}

