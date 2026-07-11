'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteBlog } from '@/lib/actions/blog'
import { Button } from '@/components/ui/button'

export function DeleteBlogButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return

    startTransition(async () => {
      try {
        await deleteBlog(id)
        toast.success('Post deleted')
      } catch {
        toast.error('Failed to delete post')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={pending}
      title="Delete post"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
