import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Frontend Supabase client (uses anon key)
// This is safe to use in browser/client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Browser client automatically uses localStorage for session persistence
// Custom cookie handlers are only needed for server-side clients (see server.ts)
// This ensures sessions persist across page refreshes and browser restarts
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
  // No custom options needed - uses localStorage by default for session storage
)

