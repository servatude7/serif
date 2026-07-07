import { notFound } from 'next/navigation'

import { getBlog } from '@/lib/actions/blog'
import { BlogForm } from '@/components/blog/blog-form'

interface EditBlogPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params
  const blog = await getBlog(id)

  if (!blog) notFound()

  return <BlogForm blog={blog} />
}
