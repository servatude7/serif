import type * as React from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireUser } from "@/lib/auth/dal"
import { getDisplayName } from "@/lib/profile"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Also sends admins to /admin, so this layout is the single place that
  // decides where each role lands after signing in.
  const profile = await requireUser()

  return (
    <DashboardShell
      userName={getDisplayName(profile.firstName)}
      userEmail={profile.email}
      avatarUrl={profile.avatarUrl}
    >
      {children}
    </DashboardShell>
  )
}
