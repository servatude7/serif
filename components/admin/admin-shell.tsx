import type * as React from "react"

import { AdminNav } from "@/components/admin/admin-nav"
import { AppShell } from "@/components/shell/app-shell"
import { Badge } from "@/components/ui/badge"

interface AdminShellProps {
  children: React.ReactNode
  userName: string
  userEmail?: string | null
  avatarUrl?: string | null
}

export function AdminShell({
  children,
  userName,
  userEmail,
  avatarUrl,
}: AdminShellProps) {
  return (
    <AppShell
      brandHref="/admin"
      nav={<AdminNav />}
      navLabel="Administration"
      eyebrow="Serif Admin"
      title="Platform overview"
      user={{ name: userName, email: userEmail, avatarUrl }}
      action={<Badge variant="secondary">Admin</Badge>}
    >
      {children}
    </AppShell>
  )
}
