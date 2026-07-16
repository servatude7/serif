import type { MetadataRoute } from 'next'

import { getPublishedBlogs } from '@/lib/blog-data'
import { absoluteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedBlogs()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
    },
    {
      url: absoluteUrl('/blogs'),
      lastModified: posts[0]?.updated_at
        ? new Date(posts[0].updated_at)
        : new Date(),
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blogs/${post.slug}`),
      lastModified: new Date(post.updated_at),
      images: post.image ? [post.image] : undefined,
    })),
  ]
}
