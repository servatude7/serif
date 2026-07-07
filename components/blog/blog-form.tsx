'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { JSONContent } from '@tiptap/react'
import { ImageIcon, Loader2, Save, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { createBlog, updateBlog, uploadBlogImage } from '@/lib/actions/blog'
import type { BlogWithAuthor } from '@/lib/actions/blog'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(
  () => import('@/components/blog/tiptap-editor').then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="min-h-[320px] rounded-md border bg-muted/30 animate-pulse" /> },
)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BlogFormProps {
  blog?: BlogWithAuthor | null
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(blog?.title ?? '')
  const [summary, setSummary] = useState(blog?.summary ?? '')
  const [body, setBody] = useState<JSONContent | null>(
    (blog?.body as JSONContent | null) ?? null,
  )
  const [image, setImage] = useState<string>(blog?.image ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(
    blog?.status ?? 'draft',
  )
  const [uploading, setUploading] = useState(false)
  const [saving, startSaving] = useTransition()

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadBlogImage(fd)
      setImage(url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error('Image upload failed')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  function buildFormData(): FormData {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('summary', summary)
    fd.append('body', JSON.stringify(body))
    fd.append('image', image)
    fd.append('status', status)
    return fd
  }

  function handleSave() {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    startSaving(async () => {
      try {
        const fd = buildFormData()
        if (blog?.id) {
          await updateBlog(blog.id, fd)
          toast.success('Post saved')
        } else {
          await createBlog(fd)
          // createBlog redirects to edit page — toast shown after navigation
        }
      } catch (err) {
        toast.error('Failed to save post')
        console.error(err)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {blog ? 'Edit post' : 'New post'}
          </h2>
          {blog && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Last saved{' '}
              {new Date(blog.updated_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/blogs')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <Label>Cover image</Label>
        <div className="flex items-start gap-4">
          {image ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Cover"
                className="h-32 w-48 rounded-md border object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 size-6"
                onClick={() => setImage('')}
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="size-5" />
                  <span>Upload image</span>
                </>
              )}
            </button>
          )}

          {image && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="size-4" />
              Replace
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          placeholder="A short description shown in post listings…"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as 'draft' | 'published')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label>Content</Label>
        <TiptapEditor
          content={body}
          onChange={setBody}
          placeholder="Start writing your post…"
        />
      </div>
    </div>
  )
}
