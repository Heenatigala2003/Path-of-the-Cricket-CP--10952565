import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Safe storage (prevents lock issues)
const safeStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }

// Global singleton (prevents multiple clients)
declare global {
  var __supabase__: SupabaseClient | undefined
}

let supabase: SupabaseClient

if (typeof window !== 'undefined') {
  if (!globalThis.__supabase__) {
    globalThis.__supabase__ = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,

          // Prevent multi-tab lock conflicts
          multiTab: false,

          storageKey: 'sb-auth-token-v2',

          storage: safeStorage,

          flowType: 'pkce',
        },
      }
    )
  }

  supabase = globalThis.__supabase__
} else {
  supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,

        multiTab: false,

        storageKey: 'sb-auth-token-v2',

        storage: safeStorage,

        flowType: 'pkce',
      },
    }
  )
}

export { supabase }