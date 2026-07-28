import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/database.types"

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"]
type BlogStatus = Database["public"]["Enums"]["blog_status"]
type UserRole = Database["public"]["Enums"]["user_role"]

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const SUBSCRIPTION_VARIANTS: Record<SubscriptionStatus, BadgeVariant> = {
  active: "default",
  trialing: "default",
  past_due: "destructive",
  unpaid: "destructive",
  incomplete: "destructive",
  canceled: "outline",
  incomplete_expired: "outline",
  paused: "secondary",
}

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus | null | undefined
}) {
  if (!status) {
    return <span className="text-muted-foreground">No subscription</span>
  }

  return (
    <Badge variant={SUBSCRIPTION_VARIANTS[status]}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}

export function BlogStatusBadge({ status }: { status: BlogStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {status}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
  )
}
