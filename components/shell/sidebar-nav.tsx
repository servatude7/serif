"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavRoute {
  title: string
  href: string
  icon: LucideIcon
}

interface SidebarNavProps {
  routes: NavRoute[]
  /**
   * Route that should only match exactly, so it doesn't stay highlighted while
   * a nested route is open. Usually the section index (`/dashboard`, `/admin`).
   */
  indexHref: string
}

export function SidebarNav({ routes, indexHref }: SidebarNavProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const Icon = route.icon
        const isActive =
          pathname === route.href ||
          (route.href !== indexHref && pathname.startsWith(`${route.href}/`))

        return (
          <SidebarMenuItem key={route.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={route.title}
            >
              <Link href={route.href} onClick={() => setOpenMobile(false)}>
                <Icon />
                <span>{route.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
