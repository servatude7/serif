import { Fragment, type ReactNode } from 'react'
import type { JSONContent } from '@tiptap/react'

import type { Json } from '@/lib/database.types'

interface BlogContentProps {
  content: Json
}

function renderChildren(node: JSONContent): ReactNode[] {
  return (node.content ?? []).map((child, index) =>
    renderNode(child, `${child.type ?? 'node'}-${index}`)
  )
}

function safeHref(value: unknown): string {
  if (typeof value !== 'string') return '#'

  const href = value.trim()
  if (href.startsWith('/') || href.startsWith('#')) return href

  try {
    const url = new URL(href)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? href : '#'
  } catch {
    return '#'
  }
}

function renderText(node: JSONContent): ReactNode {
  let content: ReactNode = node.text ?? ''

  for (const [index, mark] of (node.marks ?? []).entries()) {
    const key = `${mark.type}-${index}`

    switch (mark.type) {
      case 'bold':
        content = <strong key={key}>{content}</strong>
        break
      case 'italic':
        content = <em key={key}>{content}</em>
        break
      case 'strike':
        content = <s key={key}>{content}</s>
        break
      case 'underline':
        content = <u key={key}>{content}</u>
        break
      case 'code':
        content = (
          <code
            key={key}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {content}
          </code>
        )
        break
      case 'link': {
        const href = safeHref(mark.attrs?.href)
        const external = href.startsWith('http://') || href.startsWith('https://')

        content = (
          <a
            key={key}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer noopener' : undefined}
            className="font-medium text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {content}
          </a>
        )
        break
      }
    }
  }

  return content
}

function renderNode(node: JSONContent, key: string): ReactNode {
  if (node.type === 'text') {
    return <Fragment key={key}>{renderText(node)}</Fragment>
  }

  const children = renderChildren(node)

  switch (node.type) {
    case 'doc':
      return <Fragment key={key}>{children}</Fragment>
    case 'paragraph':
      return (
        <p
          key={key}
          className="mb-6 text-[1.05rem] leading-8 text-foreground/85 sm:text-lg sm:leading-9"
        >
          {children.length > 0 ? children : <br />}
        </p>
      )
    case 'heading': {
      const level = Number(node.attrs?.level)
      const className =
        'mb-4 mt-10 font-serif font-semibold tracking-[-0.025em] text-foreground first:mt-0'

      if (level === 1) {
        return (
          <h2 key={key} className={`${className} text-3xl sm:text-4xl`}>
            {children}
          </h2>
        )
      }

      if (level === 3) {
        return (
          <h4 key={key} className={`${className} text-xl sm:text-2xl`}>
            {children}
          </h4>
        )
      }

      return (
        <h3 key={key} className={`${className} text-2xl sm:text-3xl`}>
          {children}
        </h3>
      )
    }
    case 'bulletList':
      return (
        <ul
          key={key}
          className="mb-7 list-disc space-y-2 pl-6 text-[1.05rem] leading-8 marker:text-muted-foreground sm:text-lg"
        >
          {children}
        </ul>
      )
    case 'orderedList':
      return (
        <ol
          key={key}
          start={typeof node.attrs?.start === 'number' ? node.attrs.start : 1}
          className="mb-7 list-decimal space-y-2 pl-6 text-[1.05rem] leading-8 marker:font-medium marker:text-muted-foreground sm:text-lg"
        >
          {children}
        </ol>
      )
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="my-8 border-l-2 border-foreground/20 pl-6 font-serif text-xl italic leading-8 text-foreground/80 sm:text-2xl sm:leading-9"
        >
          {children}
        </blockquote>
      )
    case 'codeBlock':
      return (
        <pre
          key={key}
          className="my-8 overflow-x-auto rounded-xl bg-foreground p-5 text-sm leading-7 text-background"
        >
          <code>{children}</code>
        </pre>
      )
    case 'horizontalRule':
      return <hr key={key} className="my-10" />
    case 'hardBreak':
      return <br key={key} />
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

export function BlogContent({ content }: BlogContentProps) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl">
      {renderNode(content as JSONContent, 'document')}
    </div>
  )
}
