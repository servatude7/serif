import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

export type SubscriptionStatus =
  Database['public']['Enums']['subscription_status']

/**
 * Statuses that should unlock Pro features. `trialing` is included so a
 * future trial period would also unlock access; there is no trial flow yet.
 */
const PRO_STATUSES: readonly SubscriptionStatus[] = ['active', 'trialing']

export function isProStatus(status: SubscriptionStatus | null | undefined) {
  return !!status && PRO_STATUSES.includes(status)
}

/**
 * Looks up whether a user currently has an active (or trialing) Pro
 * subscription based on the denormalized `profiles.subscription_status`
 * column, which is kept in sync by the Stripe webhook.
 */
export async function isProUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return isProStatus(data?.subscription_status)
}
