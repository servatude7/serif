import { Bell, Shield, User } from "lucide-react"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                placeholder="Your name"
                defaultValue={profile?.first_name ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publication-name">Publication name</Label>
              <Input id="publication-name" placeholder="Serif Journal" />
            </div>
            <Button>Save profile</Button>
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
