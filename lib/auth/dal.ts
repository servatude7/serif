import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'

import type { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/server'

export type UserRole = Database['public']['Enums']['user_role']
export type SubscriptionStatus =
  Database['public']['Enums']['subscription_status']

export interface SessionProfile {
  userId: string
  email: string | null
  firstName: string | null
  avatarUrl: string | null
  role: UserRole
  subscriptionStatus: SubscriptionStatus | null
  createdAt: string | null
}

/**
 * Resolves the signed-in user together with the authorization fields from their
 * profile row. Memoized with `cache()` so a layout and the page it renders share
 * one round trip per request.
 */
export const getSessionProfile = cache(
  async (): Promise<SessionProfile | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    const claims = data?.claims

    if (error || !claims?.sub) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, avatar_url, role, subscription_status, created_at')
      .eq('id', claims.sub)
      .maybeSingle()

    if (profileError) throw profileError

    return {
      userId: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : null,
      firstName: profile?.first_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      // Default to the least privileged role: a missing profile row must never
      // read as admin.
      role: profile?.role ?? 'user',
      subscriptionStatus: profile?.subscription_status ?? null,
      createdAt: profile?.created_at ?? null,
    }
  }
)

/**
 * Gate for `/admin`. Sends anonymous visitors to the login page and signed-in
 * non-admins back to their own dashboard.
 */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return profile
}

/**
 * Gate for `/dashboard`. Admins are sent to the admin dashboard, which is the
 * single place that decides where each role lands after signing in.
 */
export async function requireUser(): Promise<SessionProfile> {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role === 'admin') {
    redirect('/admin')
  }

  return profile
}
