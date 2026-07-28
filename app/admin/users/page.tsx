import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table"
import {
  RoleBadge,
  SubscriptionStatusBadge,
} from "@/components/admin/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/admin/format"
import type { Tables } from "@/lib/database.types"
import { getDisplayName, getInitialsFromName } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

type AdminUserRow = Pick<
  Tables<"profiles">,
  | "id"
  | "first_name"
  | "avatar_url"
  | "role"
  | "subscription_status"
  | "stripe_customer_id"
  | "created_at"
> & { email: string | null }

const columns: AdminTableColumn<AdminUserRow>[] = [
  {
    key: "user",
    header: "User",
    cell: (user) => {
      const name = getDisplayName(user.first_name)

      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={name} />
            ) : null}
            <AvatarFallback>{getInitialsFromName(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email ?? "Email unavailable"}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    key: "role",
    header: "Role",
    cell: (user) => <RoleBadge role={user.role} />,
  },
  {
    key: "subscription",
    header: "Subscription",
    cell: (user) => (
      <SubscriptionStatusBadge status={user.subscription_status} />
    ),
  },
  {
    key: "customer",
    header: "Stripe customer",
    hideOnMobile: true,
    cell: (user) => (
      <span className="font-mono text-xs">
        {user.stripe_customer_id ?? "—"}
      </span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    hideOnMobile: true,
    alignEnd: true,
    cell: (user) => formatDate(user.created_at),
  },
]

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const [profiles, emails] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, avatar_url, role, subscription_status, stripe_customer_id, created_at"
      )
      .order("created_at", { ascending: false }),
    // Emails live in auth.users; this RPC returns nothing for non-admins.
    supabase.rpc("admin_list_user_emails"),
  ])

  if (profiles.error) {
    throw new Error(`Unable to load users: ${profiles.error.message}`)
  }
  if (emails.error) {
    throw new Error(`Unable to load user emails: ${emails.error.message}`)
  }

  const emailById = new Map(
    (emails.data ?? []).map((entry) => [entry.id, entry.email])
  )

  const rows: AdminUserRow[] = (profiles.data ?? []).map((profile) => ({
    ...profile,
    email: emailById.get(profile.id) ?? null,
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`Every account on the platform (${rows.length}).`}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(user) => user.id}
        empty="No users yet."
      />
    </div>
  )
}
