"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const dashboardRoutes = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Blogs",
    href: "/dashboard/blogs",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface DashboardNavProps {
  className?: string
  onNavigate?: () => void
}

export function DashboardNav({ className, onNavigate }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {dashboardRoutes.map((route) => {
        const Icon = route.icon
        const isActive =
          pathname === route.href ||
          (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`))

        return (
          <SidebarMenuItem key={route.href}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={route.href} onClick={onNavigate}>
                <Icon />
                {route.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </div>
  )
}
