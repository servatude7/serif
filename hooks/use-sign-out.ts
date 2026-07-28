"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

/**
 * Signs the user out and returns them to the login page. `refresh()` clears the
 * cached Server Component render so no authenticated markup survives the
 * navigation.
 */
export function useSignOut() {
  const router = useRouter()

  return useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/auth/login")
    router.refresh()
  }, [router])
}
