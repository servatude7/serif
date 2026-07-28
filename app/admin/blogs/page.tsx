import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/admin-table"
import { AdminPageHeader } from "@/components/admin/page-header"
import { BlogStatusBadge } from "@/components/admin/status-badge"
import { formatDate } from "@/lib/admin/format"
import type { Tables } from "@/lib/database.types"
import { getDisplayName } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

type AdminBlogRow = Pick<
  Tables<"blogs">,
  | "id"
  | "title"
  | "slug"
  | "status"
  | "read_time"
  | "published_at"
  | "created_at"
> & { profiles: { first_name: string | null } | null }

const columns: AdminTableColumn<AdminBlogRow>[] = [
  {
    key: "title",
    header: "Post",
    cell: (post) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{post.title}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          /{post.slug}
        </p>
      </div>
    ),
  },
  {
    key: "author",
    header: "Author",
    cell: (post) => getDisplayName(post.profiles?.first_name),
  },
  {
    key: "status",
    header: "Status",
    cell: (post) => <BlogStatusBadge status={post.status} />,
  },
  {
    key: "read_time",
    header: "Read time",
    hideOnMobile: true,
    cell: (post) => (post.read_time ? `${post.read_time} min` : "—"),
  },
  {
    key: "published_at",
    header: "Published",
    hideOnMobile: true,
    cell: (post) => formatDate(post.published_at),
  },
  {
    key: "created_at",
    header: "Created",
    hideOnMobile: true,
    alignEnd: true,
    cell: (post) => formatDate(post.created_at),
  },
]

export default async function AdminBlogsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(
      "id, title, slug, status, read_time, published_at, created_at, profiles(first_name)"
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Unable to load posts: ${error.message}`)
  }

  const rows = data ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blogs"
        description={`Every post across all authors (${rows.length}).`}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(post) => post.id}
        empty="No posts have been created yet."
      />
    </div>
  )
}
