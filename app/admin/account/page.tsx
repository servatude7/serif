import type * as React from "react"
import { LogOut, ShieldCheck, User } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import {
  RoleBadge,
  SubscriptionStatusBadge,
} from "@/components/admin/status-badge"
import { LogoutButton } from "@/components/logout-button"
import { ProfileForm } from "@/components/settings/profile-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { requireAdmin } from "@/lib/auth/dal"
import { formatDate } from "@/lib/admin/format"
import { getDisplayName, getInitialsFromName } from "@/lib/profile"

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-sm font-medium">{children}</dd>
    </div>
  )
}

export default async function AdminAccountPage() {
  // Already resolved by the layout, so this is free.
  const profile = await requireAdmin()
  const name = getDisplayName(profile.firstName)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Account"
        description="Your administrator account and session."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Signed in as
            </CardTitle>
            <CardDescription>
              Details from your Supabase Auth session and profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback>{getInitialsFromName(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {profile.email ?? "No email on file"}
                </p>
              </div>
            </div>

            <Separator />

            <dl className="space-y-3">
              <DetailRow label="Role">
                <RoleBadge role={profile.role} />
              </DetailRow>
              <DetailRow label="Subscription">
                <SubscriptionStatusBadge status={profile.subscriptionStatus} />
              </DetailRow>
              <DetailRow label="Joined">
                {formatDate(profile.createdAt)}
              </DetailRow>
              <DetailRow label="User ID">
                <span className="font-mono text-xs">{profile.userId}</span>
              </DetailRow>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Update the name and avatar shown alongside your activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                firstName={profile.firstName}
                avatarUrl={profile.avatarUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="size-5" />
                Session
              </CardTitle>
              <CardDescription>
                Sign out of the admin dashboard on this device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoutButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
