import Link from 'next/link'
import { CalendarDays, Clock, FileText, Pencil, Plus } from 'lucide-react'

import { getBlogs } from '@/lib/actions/blog'
import { AuthorBadge } from '@/components/blog/author-badge'
import { DeleteBlogButton } from '@/components/blog/delete-blog-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardBlogsPage() {
  const blogs = await getBlogs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blogs</h2>
          <p className="text-muted-foreground">
            Manage drafts, published posts, and upcoming article ideas.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blogs/new">
            <Plus />
            New post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>
            {blogs.length === 0
              ? 'No posts yet. Create your first post to get started.'
              : `${blogs.length} post${blogs.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <FileText className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first blog post to get started.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/blogs/new">
                  <Plus />
                  New post
                </Link>
              </Button>
            </div>
          ) : (
            blogs.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  {post.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt={post.title}
                      className="size-10 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <FileText className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/blogs/${post.slug}`} className="hover:underline">
                        <h3 className="truncate font-medium">{post.title}</h3>
                      </Link>
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' : 'secondary'
                        }
                      >
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {post.summary && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {post.summary}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {new Date(post.updated_at).toLocaleDateString(
                          undefined,
                          { dateStyle: 'medium' },
                        )}
                      </span>
                      {post.read_time != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {post.read_time} min read
                        </span>
                      )}
                      {post.profiles && (
                        <AuthorBadge
                          firstName={post.profiles.first_name}
                          avatarUrl={post.profiles.avatar_url}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/blogs/${post.id}/edit`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteBlogButton id={post.id} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
