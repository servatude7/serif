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

  const userId = data.claims.sub
  const profile = await getProfile(supabase, userId)
  const firstName = profile?.first_name?.trim()
  const [totalResult, draftResult, publishedResult] = await Promise.all([
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("status", "draft"),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("status", "published"),
  ])

  const countError =
    totalResult.error ?? draftResult.error ?? publishedResult.error
  if (countError) {
    throw new Error(`Unable to load blog counts: ${countError.message}`)
  }

  const totalPosts = totalResult.count ?? 0
  const draftPosts = draftResult.count ?? 0
  const publishedPosts = publishedResult.count ?? 0

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
            <CardTitle className="text-3xl">{totalPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalPosts === 0
                ? "Create your first blog post to start publishing."
                : `${totalPosts} post${totalPosts === 1 ? "" : "s"} in your library.`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">{draftPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {draftPosts === 0
                ? "No drafts waiting for review."
                : `${draftPosts} draft${draftPosts === 1 ? "" : "s"} waiting for review.`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">{publishedPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {publishedPosts === 0
                ? "No published posts yet."
                : `${publishedPosts} post${publishedPosts === 1 ? "" : "s"} live.`}
            </p>
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
            <p>Draft, review, and publish posts from one focused workspace.</p>
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
