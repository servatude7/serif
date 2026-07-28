"use client"

import type * as React from "react"
import Image from "next/image"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  SidebarUserMenu,
  type ShellUser,
} from "@/components/shell/sidebar-user-menu"

interface AppShellProps {
  children: React.ReactNode
  /** Target of the sidebar brand link, i.e. the section index. */
  brandHref: string
  /** Nav for this section, rendered inside the sidebar's menu group. */
  nav: React.ReactNode
  navLabel: string
  /** Small label above the page title in the header. */
  eyebrow: string
  title: string
  /** Optional primary action rendered on the right of the header. */
  action?: React.ReactNode
  user: ShellUser
}

/**
 * Sidebar layout shared by the user dashboard and the admin dashboard. The
 * sidebar collapses to icons on desktop and to a sheet on mobile, both handled
 * by `SidebarProvider`.
 */
export function AppShell({
  children,
  brandHref,
  nav,
  navLabel,
  eyebrow,
  title,
  action,
  user,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center border-b">
          <Link
            href={brandHref}
            className="flex items-center gap-2 px-2 font-serif text-xl font-bold tracking-tight"
          >
            <Image
              src="/icon.png"
              alt="Serif"
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              Serif
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{navLabel}</SidebarGroupLabel>
            <SidebarGroupContent>{nav}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserMenu user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {title}
              </h1>
            </div>
            {action}
          </div>
        </header>
        <div className="min-w-0 flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
