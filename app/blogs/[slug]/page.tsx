import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react'

import {
  getPublishedBlogBySlug,
  getRelatedPublishedBlogs,
} from '@/lib/blog-data'
import {
  getBlogAuthorName,
  getBlogDescription,
  getBlogWordCount,
} from '@/lib/blog-text'
import { absoluteUrl, siteName } from '@/lib/site'
import { AuthorBadge } from '@/components/blog/author-badge'
import { BlogContent } from '@/components/blog/blog-content'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Badge } from '@/components/ui/badge'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
})

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogBySlug(slug)

  if (!post) {
    return {
      title: 'Story not found',
      robots: { index: false, follow: false },
    }
  }

  const canonicalUrl = absoluteUrl(`/blogs/${post.slug}`)
  const description = getBlogDescription(post.summary, post.body)
  const authorName = getBlogAuthorName(post.profiles?.first_name)
  const socialImage =
    post.image ?? absoluteUrl(`/blogs/${post.slug}/social-image`)

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      siteName,
      title: post.title,
      description,
      publishedTime: post.published_at ?? post.updated_at,
      modifiedTime: post.updated_at,
      authors: [authorName],
      images: [{ url: socialImage, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [socialImage],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedBlogBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPublishedBlogs(post.id)
  const canonicalUrl = absoluteUrl(`/blogs/${post.slug}`)
  const description = getBlogDescription(post.summary, post.body)
  const publishedAt = post.published_at ?? post.updated_at
  const authorName = getBlogAuthorName(post.profiles?.first_name)
  const imageUrl =
    post.image ?? absoluteUrl(`/blogs/${post.slug}/social-image`)
  const showUpdatedDate =
    new Date(post.updated_at).getTime() - new Date(publishedAt).getTime() > 60_000

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image: [imageUrl],
      datePublished: publishedAt,
      dateModified: post.updated_at,
      wordCount: getBlogWordCount(post.body),
      author: {
        '@type': 'Person',
        name: authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        url: absoluteUrl('/'),
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Stories',
          item: absoluteUrl('/blogs'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1 pb-12 md:pb-24 lg:pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />

        <article className="container mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center justify-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link
              href="/blogs"
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Stories
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span aria-current="page" className="max-w-52 truncate text-foreground/75 sm:max-w-sm">
              {post.title}
            </span>
          </nav>

          <header className="mb-12 space-y-8 text-center">
            <Badge variant="secondary" className="mb-2">
              Article
            </Badge>
            <h1 className="text-balance font-serif text-3xl font-semibold tracking-[-0.035em] sm:text-4xl md:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mx-auto max-w-[700px] text-lg leading-8 text-muted-foreground text-balance sm:text-xl">
                {post.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4 text-sm text-muted-foreground">
              {post.profiles ? (
                <AuthorBadge
                  firstName={post.profiles.first_name}
                  avatarUrl={post.profiles.avatar_url}
                />
              ) : (
                <span>Serif contributor</span>
              )}
              <time
                dateTime={publishedAt}
                className="flex items-center gap-1.5"
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                Published {dateFormatter.format(new Date(publishedAt))}
              </time>
              {showUpdatedDate && (
                <time
                  dateTime={post.updated_at}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Updated {dateFormatter.format(new Date(post.updated_at))}
                </time>
              )}
              {post.read_time != null && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  {post.read_time} min read
                </span>
              )}
            </div>
          </header>

          {post.image && (
            <div className="relative mb-12 aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.image}
                alt={`Cover image for ${post.title}`}
                fill
                preload
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {post.body ? (
            <BlogContent content={post.body} />
          ) : (
            <p className="text-center text-muted-foreground">
              No content available.
            </p>
          )}
        </article>

        {relatedPosts.length > 0 && (
          <section
            aria-labelledby="related-stories-heading"
            className="mx-auto mt-4 max-w-6xl border-t px-5 pt-14 sm:px-6 lg:px-8"
          >
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Keep reading
                </p>
                <h2
                  id="related-stories-heading"
                  className="mt-2 font-serif text-3xl font-semibold tracking-[-0.03em]"
                >
                  More from Serif
                </h2>
              </div>
              <Link
                href="/blogs"
                className="hidden items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline sm:inline-flex"
              >
                View all stories
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="group min-w-0">
                  <Link
                    href={`/blogs/${relatedPost.slug}`}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                      {relatedPost.image ? (
                        <Image
                          src={relatedPost.image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,var(--color-muted),var(--color-secondary))] font-serif text-4xl font-semibold text-foreground/20">
                          S
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-semibold leading-tight tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">
                      {relatedPost.title}
                    </h3>
                    <time
                      dateTime={relatedPost.published_at ?? relatedPost.updated_at}
                      className="mt-2 block text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(
                        new Date(
                          relatedPost.published_at ?? relatedPost.updated_at
                        )
                      )}
                    </time>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
