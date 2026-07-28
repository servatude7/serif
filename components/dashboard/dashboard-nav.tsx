"use client"

import { FileText, Home, Settings } from "lucide-react"

import { SidebarNav, type NavRoute } from "@/components/shell/sidebar-nav"

const dashboardRoutes: NavRoute[] = [
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

export function DashboardNav() {
  return <SidebarNav routes={dashboardRoutes} indexHref="/dashboard" />
}
