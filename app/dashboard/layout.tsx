import type * as React from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getDisplayName, getProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    redirect("/auth/login")
  }

  const profile = await getProfile(supabase, data.claims.sub)
  const userName = getDisplayName(profile?.first_name)

  return (
    <DashboardShell
      userName={userName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DashboardShell>
  )
}
