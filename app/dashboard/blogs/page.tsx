import { CalendarDays, FileText, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const draftPosts = [
  {
    title: "Welcome to Serif",
    status: "Draft",
    updatedAt: "Ready for your first outline",
  },
  {
    title: "Untitled idea",
    status: "Idea",
    updatedAt: "Add notes to turn this into a post",
  },
]

export default function DashboardBlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blogs</h2>
          <p className="text-muted-foreground">
            Manage drafts, published posts, and upcoming article ideas.
          </p>
        </div>
        <Button>
          <Plus />
          New post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>
            Your blog management table will live here once post storage is connected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {draftPosts.map((post) => (
            <div
              key={post.title}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="secondary">{post.status}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {post.updatedAt}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
