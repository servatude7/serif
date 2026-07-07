import Link from "next/link"
import { redirect } from "next/navigation"
import { FileText, Settings, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    redirect("/auth/login")
  }

  const profile = await getProfile(supabase, data.claims.sub)
  const firstName = profile?.first_name?.trim()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Home"}
          </h2>
          <p className="text-muted-foreground">
            Track your writing activity and jump back into managing your posts.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blogs">
            <FileText />
            Manage blogs
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total posts</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Create your first blog post to start publishing.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Draft tracking will appear here as posts are added.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Published post metrics will show up in this space.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Writing workflow
            </CardTitle>
            <CardDescription>
              Use the dashboard to draft, review, and publish long-form content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Start by adding blog storage and editor flows, then connect the counts above to real post data.</p>
            <p>The shell is ready for authenticated blog management without exposing dashboard routes publicly.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Account setup
            </CardTitle>
            <CardDescription>
              Keep account and publishing preferences under Settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings">Open settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
