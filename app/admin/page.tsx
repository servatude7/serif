import Link from "next/link"
import { CreditCard, FileText, Receipt, TrendingUp, Users } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { StatCard } from "@/components/admin/stat-card"
import {
  BlogStatusBadge,
  SubscriptionStatusBadge,
} from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { daysAgoIso, formatCurrency, formatDate } from "@/lib/admin/format"
import { getDisplayName } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

const ACTIVE_STATUSES = ["active", "trialing"] as const

export default async function AdminHomePage() {
  const supabase = await createClient()
  const thirtyDaysAgo = daysAgoIso(30)

  const [
    users,
    newUsers,
    admins,
    posts,
    publishedPosts,
    activeSubscriptions,
    revenueRows,
    recentUsers,
    recentPosts,
    recentTransactions,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    supabase.from("blogs").select("id", { count: "exact", head: true }),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ACTIVE_STATUSES),
    // Only checkout sessions carry an amount today, and scoping to that one
    // event type keeps the total from double counting if invoice events are
    // enabled on the webhook later (a first payment emits both).
    supabase
      .from("transactions")
      .select("amount_total, currency")
      .eq("stripe_event_type", "checkout.session.completed")
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("profiles")
      .select("id, first_name, role, subscription_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("blogs")
      .select("id, title, status, created_at, profiles(first_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("transactions")
      .select("id, stripe_event_type, amount_total, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const failure =
    users.error ??
    newUsers.error ??
    admins.error ??
    posts.error ??
    publishedPosts.error ??
    activeSubscriptions.error ??
    revenueRows.error ??
    recentUsers.error ??
    recentPosts.error ??
    recentTransactions.error

  if (failure) {
    throw new Error(`Unable to load admin analytics: ${failure.message}`)
  }

  const totalPosts = posts.count ?? 0
  const published = publishedPosts.count ?? 0
  const drafts = totalPosts - published
  const revenue = (revenueRows.data ?? []).reduce(
    (total, row) => total + (row.amount_total ?? 0),
    0
  )
  const revenueCurrency = revenueRows.data?.[0]?.currency ?? "usd"

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Home"
        description="Platform activity across every user, post, and payment."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.count ?? 0}
          hint={`${admins.count ?? 0} with admin access`}
          icon={Users}
        />
        <StatCard
          label="New users (30 days)"
          value={newUsers.count ?? 0}
          hint="Signed up in the last 30 days"
          icon={TrendingUp}
        />
        <StatCard
          label="Active subscribers"
          value={activeSubscriptions.count ?? 0}
          hint="Active or trialing Pro plans"
          icon={CreditCard}
        />
        <StatCard
          label="Revenue (30 days)"
          value={formatCurrency(revenue, revenueCurrency)}
          hint="New subscription checkouts"
          icon={Receipt}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total posts" value={totalPosts} icon={FileText} />
        <StatCard label="Published" value={published} />
        <StatCard label="Drafts" value={drafts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Newest users</CardTitle>
            <CardDescription>The five most recent sign-ups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.data?.length ? (
              recentUsers.data.map((user, index) => (
                <div key={user.id} className="space-y-3">
                  {index > 0 ? <Separator /> : null}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {getDisplayName(user.first_name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(user.created_at)}
                      </p>
                    </div>
                    <SubscriptionStatusBadge
                      status={user.subscription_status}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest posts</CardTitle>
            <CardDescription>
              The five most recently created posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.data?.length ? (
              recentPosts.data.map((post, index) => (
                <div key={post.id} className="space-y-3">
                  {index > 0 ? <Separator /> : null}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getDisplayName(post.profiles?.first_name)} ·{" "}
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                    <BlogStatusBadge status={post.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent billing events</CardTitle>
          <CardDescription>
            The latest Stripe webhook deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.data?.length ? (
            recentTransactions.data.map((transaction, index) => (
              <div key={transaction.id} className="space-y-3">
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">
                      {transaction.stripe_event_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(
                      transaction.amount_total,
                      transaction.currency
                    )}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No billing events recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/users">View all users</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/transactions">View all transactions</Link>
        </Button>
      </div>
    </div>
  )
}
