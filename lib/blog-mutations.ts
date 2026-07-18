import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { JSONContent } from '@tiptap/react'

import type { Database, Json } from '@/lib/database.types'

type BlogStatus = Database['public']['Enums']['blog_status']

interface CreateBlogRecordInput {
  title: string
  summary: string | null
  body: JSONContent | null
  image: string | null
  status: BlogStatus
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled-post'
  )
}

export function computeReadTime(body: JSONContent | null): number {
  if (!body) return 1

  function extractText(node: JSONContent): string {
    if (node.text) return node.text
    if (node.content) return node.content.map(extractText).join(' ')
    return ''
  }

  const words = extractText(body).trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export async function createBlogRecord(
  supabase: SupabaseClient<Database>,
  authorId: string,
  input: CreateBlogRecordInput,
): Promise<{ id: string; slug: string }> {
  const baseSlug = slugify(input.title)
  const readTime = computeReadTime(input.body)
  const publishedAt =
    input.status === 'published' ? new Date().toISOString() : null

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        title: input.title,
        summary: input.summary,
        body: input.body as Json | null,
        image: input.image,
        author_id: authorId,
        status: input.status,
        read_time: readTime,
        slug,
        published_at: publishedAt,
      })
      .select('id')
      .single()

    if (!error && data) return { id: data.id, slug }
    if (error?.code !== '23505') throw new Error(error?.message ?? 'Insert failed')
  }

  throw new Error('Could not create a unique post slug')
}
