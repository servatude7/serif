import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/admin-table"
import { AdminPageHeader } from "@/components/admin/page-header"
import { formatCurrency, formatDateTime } from "@/lib/admin/format"
import type { Tables } from "@/lib/database.types"
import { getDisplayName } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

type AdminTransactionRow = Pick<
  Tables<"transactions">,
  | "id"
  | "stripe_event_id"
  | "stripe_event_type"
  | "stripe_invoice_id"
  | "amount_total"
  | "currency"
  | "status"
  | "created_at"
> & { profiles: { first_name: string | null } | null }

const columns: AdminTableColumn<AdminTransactionRow>[] = [
  {
    key: "event",
    header: "Event",
    cell: (transaction) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm">
          {transaction.stripe_event_type}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {transaction.stripe_event_id}
        </p>
      </div>
    ),
  },
  {
    key: "user",
    header: "User",
    cell: (transaction) =>
      transaction.profiles ? (
        getDisplayName(transaction.profiles.first_name)
      ) : (
        <span className="text-muted-foreground">Unmatched</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    hideOnMobile: true,
    cell: (transaction) => transaction.status ?? "—",
  },
  {
    key: "invoice",
    header: "Invoice",
    hideOnMobile: true,
    cell: (transaction) => (
      <span className="font-mono text-xs">
        {transaction.stripe_invoice_id ?? "—"}
      </span>
    ),
  },
  {
    key: "received",
    header: "Received",
    hideOnMobile: true,
    cell: (transaction) => formatDateTime(transaction.created_at),
  },
  {
    key: "amount",
    header: "Amount",
    alignEnd: true,
    cell: (transaction) =>
      formatCurrency(transaction.amount_total, transaction.currency),
  },
]

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, stripe_event_id, stripe_event_type, stripe_invoice_id, amount_total, currency, status, created_at, profiles(first_name)"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    throw new Error(`Unable to load transactions: ${error.message}`)
  }

  const rows = data ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        description="Audit log of Stripe webhook events, newest first (up to 200)."
      />
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(transaction) => transaction.id}
        empty="No Stripe events recorded yet."
      />
    </div>
  )
}
