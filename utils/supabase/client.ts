// utils/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'


let browserClient: SupabaseClient | null = null



const safeStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }


export function createClient() {

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  

  if (!supabaseUrl || !supabaseAnonKey) {

    console.error(
      'Supabase URL or Anon Key is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )

    return {
      from: () => {
        throw new Error(
          'Supabase client is not configured. Check environment variables.'
        )
      },
    } as any
  }

  
  if (browserClient) {
    return browserClient
  }

  
  browserClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,

        
        storage: safeStorage,

        storageKey: 'cricket-app-auth-browser',

        flowType: 'pkce',
      },
    }
  )

  return browserClient
}