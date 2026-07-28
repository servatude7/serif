import type * as React from "react"
import Link from "next/link"
import { PenLine } from "lucide-react"

import { AppShell } from "@/components/shell/app-shell"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string | null
  avatarUrl?: string | null
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  avatarUrl,
}: DashboardShellProps) {
  return (
    <AppShell
      brandHref="/dashboard"
      nav={<DashboardNav />}
      navLabel="Dashboard"
      eyebrow="Serif Dashboard"
      title="Manage your blog"
      user={{
        name: userName ?? "Account",
        email: userEmail,
        avatarUrl,
      }}
      action={
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/dashboard/blogs/new">
            <PenLine />
            New post
          </Link>
        </Button>
      }
    >
      {children}
    </AppShell>
  )
}
