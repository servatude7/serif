"use client"

import {
  CreditCard,
  FileText,
  Home,
  Receipt,
  UserCog,
  Users,
} from "lucide-react"

import { SidebarNav, type NavRoute } from "@/components/shell/sidebar-nav"

const adminRoutes: NavRoute[] = [
  {
    title: "Home",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: Receipt,
  },
  {
    title: "Account",
    href: "/admin/account",
    icon: UserCog,
  },
]

export function AdminNav() {
  return <SidebarNav routes={adminRoutes} indexHref="/admin" />
}
