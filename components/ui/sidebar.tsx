"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function SidebarProvider({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-provider"
      className={cn("flex min-h-svh w-full bg-background", className)}
      {...props}
    />
  )
}

function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex h-16 items-center border-b px-4", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto border-t p-3", className)}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  className,
  isActive,
  asChild = false,
  ...props
}: React.ComponentProps<"a"> & {
  isActive?: boolean
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
}
