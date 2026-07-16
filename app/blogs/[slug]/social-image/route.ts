import { createElement } from 'react'
import { ImageResponse } from 'next/og'

import { getPublishedBlogBySlug } from '@/lib/blog-data'
import { getBlogAuthorName } from '@/lib/blog-text'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPublishedBlogBySlug(slug)

  if (!post) {
    return new Response('Not found', { status: 404 })
  }

  const authorName = getBlogAuthorName(post.profiles?.first_name)

  return new ImageResponse(
    createElement(
      'div',
      {
        style: {
          alignItems: 'stretch',
          background: '#f4f1eb',
          color: '#171717',
          display: 'flex',
          height: '100%',
          padding: '64px',
          width: '100%',
        },
      },
      createElement(
        'div',
        {
          style: {
            background: '#fffdf9',
            border: '2px solid rgba(23, 23, 23, 0.12)',
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
            width: '100%',
          },
        },
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            },
          },
          'Serif'
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            },
          },
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: post.title.length > 70 ? '54px' : '64px',
                fontWeight: 700,
                letterSpacing: '-0.045em',
                lineHeight: 1.05,
                maxWidth: '980px',
              },
            },
            post.title
          ),
          createElement(
            'div',
            {
              style: {
                color: '#68645e',
                display: 'flex',
                fontSize: '24px',
              },
            },
            `By ${authorName}`
          )
        )
      )
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
