'use server'

import { revalidatePath } from 'next/cache'
import type { JSONContent } from '@tiptap/react'

import {
  computeReadTime,
  createBlogRecord,
  slugify,
} from '@/lib/blog-mutations'
import {
  getStoragePath,
  IMAGE_TYPE_EXTENSIONS,
  isSupabasePublicUrl,
  isSupportedImageType,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_LABEL,
} from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type BlogStatus = Database['public']['Enums']['blog_status']

export type BlogWithAuthor = Database['public']['Tables']['blogs']['Row'] & {
  profiles: {
    first_name: string | null
    avatar_url: string | null
  } | null
}

/**
 * Cover images are submitted as a plain URL field, so only URLs inside this
 * project's `blog-images` bucket are accepted.
 */
function parseImageUrl(value: FormDataEntryValue | null): string | null {
  const image = typeof value === 'string' ? value.trim() : ''
  if (!image) return null
  if (!isSupabasePublicUrl(image, 'blog-images')) {
    throw new Error('Cover image must be an uploaded image')
  }

  return image
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient()
  let slug = base
  let attempt = 0

  while (true) {
    let query = supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query
    if (!data || data.length === 0) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getBlogs(): Promise<BlogWithAuthor[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(first_name, avatar_url)')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogWithAuthor[]
}

export async function getBlog(id: string): Promise<BlogWithAuthor | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(first_name, avatar_url)')
    .eq('id', id)
    .eq('author_id', user.id)
    .single()

  if (error) return null
  return data as BlogWithAuthor
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createBlog(formData: FormData): Promise<{ id: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const title = String(formData.get('title') ?? '').trim()
  if (!title) throw new Error('Title is required')

  const summary = (formData.get('summary') as string) || null
  const bodyRaw = formData.get('body') as string
  const body: JSONContent | null = bodyRaw ? JSON.parse(bodyRaw) : null
  const image = parseImageUrl(formData.get('image'))
  const status: BlogStatus =
    formData.get('status') === 'published' ? 'published' : 'draft'

  const { id } = await createBlogRecord(supabase, user.id, {
    title,
    summary,
    body,
    image,
    status,
  })

  revalidatePath('/dashboard/blogs')
  revalidatePath('/blogs')
  return { id }
}

export async function updateBlog(id: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const title = formData.get('title') as string
  const summary = (formData.get('summary') as string) || null
  const bodyRaw = formData.get('body') as string
  const body: JSONContent | null = bodyRaw ? JSON.parse(bodyRaw) : null
  const image = parseImageUrl(formData.get('image'))
  const status = (formData.get('status') as BlogStatus) || 'draft'

  const slug = await uniqueSlug(slugify(title), id)
  const read_time = computeReadTime(body)

  const existing = await getBlog(id)
  const published_at =
    status === 'published'
      ? (existing?.published_at ?? new Date().toISOString())
      : null

  const { error } = await supabase
    .from('blogs')
    .update({
      title,
      summary,
      body,
      image,
      status,
      read_time,
      slug,
      published_at,
    })
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/blogs')
  revalidatePath(`/dashboard/blogs/${id}/edit`)
  revalidatePath('/blogs')
  if (existing?.slug) revalidatePath(`/blogs/${existing.slug}`)
  revalidatePath(`/blogs/${slug}`)
}

export async function deleteBlog(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  // Delete the cover image from storage if present
  const blog = await getBlog(id)
  const imagePath = blog?.image ? getStoragePath(blog.image, 'blog-images') : null
  if (imagePath) {
    await supabase.storage.from('blog-images').remove([imagePath])
  }

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/blogs')
  revalidatePath('/blogs')
  if (blog?.slug) revalidatePath(`/blogs/${blog.slug}`)
}

export async function uploadBlogImage(formData: FormData): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('No file provided')
  }
  if (!isSupportedImageType(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF image')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller`)
  }

  const path = `${user.id}/${crypto.randomUUID()}.${IMAGE_TYPE_EXTENSIONS[file.type]}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
  return data.publicUrl
}
