import type { Json } from '@/lib/database.types'

function collectText(value: Json): string[] {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    return []
  }

  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectText)
  }

  const ownText = typeof value.text === 'string' ? [value.text] : []
  const childText = Array.isArray(value.content)
    ? value.content.flatMap(collectText)
    : []

  return [...ownText, ...childText]
}

export function getBlogPlainText(body: Json) {
  return collectText(body).join(' ').replace(/\s+/g, ' ').trim()
}

export function getBlogDescription(summary: string | null, body: Json) {
  const text = (summary?.trim() || getBlogPlainText(body)).replace(/\s+/g, ' ')

  if (text.length <= 180) return text
  return `${text.slice(0, 177).trimEnd()}…`
}

export function getBlogWordCount(body: Json) {
  const text = getBlogPlainText(body)
  return text ? text.split(/\s+/).length : 0
}

export function getBlogAuthorName(firstName: string | null | undefined) {
  return firstName?.trim() || 'Serif contributor'
}
