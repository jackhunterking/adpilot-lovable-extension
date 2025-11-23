import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Frontend Supabase client (uses anon key)
// This is safe to use in browser/client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// CROSS-ORIGIN IFRAME CONTEXT:
// This app runs inside a cross-origin iframe (lovable.dev embeds staging.adpilot.studio)
// localStorage is isolated per origin, so we MUST use cookies with SameSite=None; Secure
// This allows Supabase sessions to persist across page refreshes in the iframe context
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift()
        }
        return undefined
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return
        
        let cookie = `${name}=${value}`
        
        // Use provided maxAge or default to 1 year for persistence
        cookie += `; max-age=${options?.maxAge || 31536000}`
        
        // Ensure cookies are available site-wide
        cookie += `; path=${options?.path || '/'}`
        
        // CRITICAL: SameSite=None and Secure are REQUIRED for cross-origin iframe cookies
        // Without these, browsers will block cookies in third-party context
        cookie += `; samesite=None`
        cookie += `; secure`
        
        // Optional: domain if specified
        if (options?.domain) cookie += `; domain=${options.domain}`
        
        document.cookie = cookie
        console.log('[SUPABASE-CLIENT] Cross-origin cookie set:', name, '(SameSite=None; Secure)')
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return
        
        let cookie = `${name}=; max-age=0`
        cookie += `; path=${options?.path || '/'}`
        
        // Must match the attributes used when setting the cookie
        cookie += `; samesite=None`
        cookie += `; secure`
        
        if (options?.domain) cookie += `; domain=${options.domain}`
        
        document.cookie = cookie
        console.log('[SUPABASE-CLIENT] Cross-origin cookie removed:', name)
      }
    }
  }
)

