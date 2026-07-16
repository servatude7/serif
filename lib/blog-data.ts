import 'server-only'

import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

export type BlogWithAuthor = Database['public']['Tables']['blogs']['Row'] & {
  profiles: {
    first_name: string | null
    avatar_url: string | null
  } | null
}

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export const getPublishedBlogs = cache(async (): Promise<BlogWithAuthor[]> => {
  const { data, error } = await createPublicClient()
    .from('blogs')
    .select('*, profiles(first_name, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogWithAuthor[]
})

export const getPublishedBlogBySlug = cache(
  async (slug: string): Promise<BlogWithAuthor | null> => {
    const { data, error } = await createPublicClient()
      .from('blogs')
      .select('*, profiles(first_name, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as BlogWithAuthor | null
  }
)

export const getRelatedPublishedBlogs = cache(
  async (postId: string, limit = 3): Promise<BlogWithAuthor[]> => {
    const { data, error } = await createPublicClient()
      .from('blogs')
      .select('*, profiles(first_name, avatar_url)')
      .eq('status', 'published')
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return (data ?? []) as BlogWithAuthor[]
  }
)
