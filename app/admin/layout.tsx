import type * as React from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/auth/dal"
import { getDisplayName } from "@/lib/profile"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAdmin()

  return (
    <AdminShell
      userName={getDisplayName(profile.firstName)}
      userEmail={profile.email}
      avatarUrl={profile.avatarUrl}
    >
      {children}
    </AdminShell>
  )
}
