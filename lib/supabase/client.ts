import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Frontend Supabase client (uses anon key)
// This is safe to use in browser/client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// CRITICAL: @supabase/ssr requires explicit cookie handlers for session persistence
// Without this, setSession() succeeds but stores nothing (sessions don't persist)
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
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
        if (options?.path) cookie += `; path=${options.path}`
        if (options?.domain) cookie += `; domain=${options.domain}`
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
        if (options?.secure) cookie += '; secure'
        
        document.cookie = cookie
        console.log('[SUPABASE-CLIENT] Cookie set:', name)
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return
        
        let cookie = `${name}=; max-age=0`
        if (options?.path) cookie += `; path=${options.path}`
        if (options?.domain) cookie += `; domain=${options.domain}`
        
        document.cookie = cookie
        console.log('[SUPABASE-CLIENT] Cookie removed:', name)
      }
    }
  }
)

