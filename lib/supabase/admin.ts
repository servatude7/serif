import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

/**
 * Service-role Supabase client. This bypasses Row Level Security and the
 * column-level grants on `profiles`, so it must ONLY be used from trusted
 * server code that has already established who the acting user is
 * (server actions after `auth.getUser()`, or the Stripe webhook after
 * verifying the event signature). Never expose this client or the
 * `SUPABASE_SERVICE_ROLE_KEY` to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
