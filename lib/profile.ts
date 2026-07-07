import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export function getDisplayName(firstName: string | null | undefined) {
  const trimmed = firstName?.trim()
  return trimmed || 'Account'
}

export function getInitialsFromName(name: string | null | undefined) {
  const trimmed = name?.trim()
  if (!trimmed) return 'S'

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return trimmed.slice(0, 2).toUpperCase()
}
