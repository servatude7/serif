import { Bell, Shield, User } from "lucide-react"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/settings/profile-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardSettingsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    redirect("/auth/login")
  }

  const profile = await getProfile(supabase, data.claims.sub)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage profile, publishing, and account preferences.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Update the public details readers see when you publish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              firstName={profile?.first_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Email notification preferences will be configurable here.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Security
              </CardTitle>
              <CardDescription>
                Password and session controls remain protected by Supabase Auth.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
