import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/admin-table"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SubscriptionStatusBadge } from "@/components/admin/status-badge"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/admin/format"
import type { Tables } from "@/lib/database.types"
import { getDisplayName } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

type AdminSubscriptionRow = Pick<
  Tables<"subscriptions">,
  | "id"
  | "plan"
  | "status"
  | "stripe_subscription_id"
  | "current_period_end"
  | "cancel_at_period_end"
  | "created_at"
> & { profiles: { first_name: string | null } | null }

const columns: AdminTableColumn<AdminSubscriptionRow>[] = [
  {
    key: "subscriber",
    header: "Subscriber",
    cell: (subscription) => (
      <div className="min-w-0">
        <p className="truncate font-medium">
          {getDisplayName(subscription.profiles?.first_name)}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {subscription.stripe_subscription_id}
        </p>
      </div>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    cell: (subscription) => (
      <Badge variant="outline">{subscription.plan}</Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (subscription) => (
      <SubscriptionStatusBadge status={subscription.status} />
    ),
  },
  {
    key: "renews",
    header: "Renews",
    hideOnMobile: true,
    cell: (subscription) =>
      subscription.cancel_at_period_end ? (
        <span className="text-muted-foreground">
          Ends {formatDate(subscription.current_period_end)}
        </span>
      ) : (
        formatDate(subscription.current_period_end)
      ),
  },
  {
    key: "started",
    header: "Started",
    hideOnMobile: true,
    alignEnd: true,
    cell: (subscription) => formatDate(subscription.created_at),
  },
]

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, plan, status, stripe_subscription_id, current_period_end, cancel_at_period_end, created_at, profiles(first_name)"
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Unable to load subscriptions: ${error.message}`)
  }

  const rows = data ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        description={`Stripe subscription state for every customer (${rows.length}).`}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(subscription) => subscription.id}
        empty="No subscriptions yet."
      />
    </div>
  )
}
