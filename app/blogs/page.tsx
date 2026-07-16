import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Clock, FileText } from 'lucide-react'

import { getPublishedBlogs } from '@/lib/blog-data'
import { absoluteUrl, siteName } from '@/lib/site'
import { AuthorBadge } from '@/components/blog/author-badge'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Badge } from '@/components/ui/badge'

const pageDescription =
  'Discover thoughtful stories, practical ideas, and fresh perspectives from Serif writers.'

export const metadata: Metadata = {
  title: 'Stories',
  description: pageDescription,
  alternates: {
    canonical: absoluteUrl('/blogs'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/blogs'),
    siteName,
    title: 'Stories',
    description: pageDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stories',
    description: pageDescription,
  },
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-28">
        <section className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24 lg:pt-28">
          <Badge
            variant="secondary"
            className="mb-6 border border-border/70 bg-muted/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
          >
            Latest stories
          </Badge>
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            Ideas worth sharing.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground text-balance sm:text-lg sm:leading-8">
            Thoughtful essays, fresh perspectives, and practical ideas from
            writers in the Serif community.
          </p>
        </section>

        <section
          aria-label="Published stories"
          className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8"
        >
          {blogs.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
              <div className="mb-5 rounded-full border bg-background p-4 shadow-sm">
                <FileText className="size-6 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                Stories are on the way
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                There are no published stories yet. Check back soon for the
                first dispatch from our writers.
              </p>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5"
                >
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-95"
                      />
                    ) : (
                      <div className="relative flex size-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-background),transparent_55%),linear-gradient(135deg,var(--color-muted),var(--color-secondary))]">
                        <div className="absolute -right-10 -top-10 size-36 rounded-full border border-foreground/5" />
                        <div className="absolute -bottom-14 -left-8 size-44 rounded-full border border-foreground/5" />
                        <span className="font-serif text-5xl font-semibold text-foreground/20">
                          S
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h2 className="font-serif text-2xl font-semibold leading-tight tracking-[-0.025em] text-balance">
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="decoration-1 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      <time
                        dateTime={post.published_at || post.updated_at}
                        className="flex items-center gap-1.5"
                      >
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {dateFormatter.format(
                          new Date(post.published_at || post.updated_at)
                        )}
                      </time>
                      {post.read_time != null && (
                        <>
                          <span aria-hidden="true" className="text-border">
                            /
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {post.read_time} min read
                          </span>
                        </>
                      )}
                    </div>

                    {post.summary && (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
                        {post.summary}
                      </p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-4 pt-7">
                      {post.profiles ? (
                        <AuthorBadge
                          firstName={post.profiles.first_name}
                          avatarUrl={post.profiles.avatar_url}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Serif contributor
                        </span>
                      )}
                      <Link
                        href={`/blogs/${post.slug}`}
                        aria-label={`Read ${post.title}`}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
