"use client"

import type * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Menu, PenLine } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { getInitialsFromName } from "@/lib/profile"

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
}

export function DashboardShell({ children, userName }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <BrandLink />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              <DashboardNav />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserMenu userName={userName} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <MobileDashboardMenu userName={userName} />
          <div className="flex flex-1 items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Serif Dashboard</p>
              <h1 className="text-lg font-semibold tracking-tight">Manage your blog</h1>
            </div>
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/dashboard/blogs">
                <PenLine />
                New post
              </Link>
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function BrandLink() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
      <Image src="/icon.png" alt="Serif" width={24} height={24} className="size-6" />
      Serif
    </Link>
  )
}

function MobileDashboardMenu({ userName }: { userName?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Open dashboard navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
        <SheetHeader className="border-b px-4 py-5">
          <SheetTitle asChild>
            <BrandLink />
          </SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarMenu>
                <DashboardNav />
              </SidebarMenu>
            </SidebarGroup>
          </div>
          <div className="mt-auto border-t p-3">
            <UserMenu userName={userName} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function UserMenu({ userName }: { userName?: string }) {
  const router = useRouter()
  const initials = getInitialsFromName(userName)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/auth/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-2">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-sm">{userName ?? "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{userName ?? "Signed in"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

