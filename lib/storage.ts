export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGE_SIZE_LABEL = '5 MB'

export const IMAGE_TYPE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const

export type SupportedImageType = keyof typeof IMAGE_TYPE_EXTENSIONS

export function isSupportedImageType(type: string): type is SupportedImageType {
  return type in IMAGE_TYPE_EXTENSIONS
}

/**
 * True when `url` points at a file in the given public bucket of this project's
 * Supabase storage. Image URLs reach the database through plain form fields
 * (`avatar_url`, `image`), so they are validated before they are stored rather
 * than trusted because an upload happened earlier in the same form.
 */
export function isSupabasePublicUrl(url: string, bucket: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  try {
    const parsed = new URL(url)
    const expected = new URL(
      `/storage/v1/object/public/${bucket}/`,
      supabaseUrl
    )

    return (
      parsed.origin === expected.origin &&
      parsed.pathname.startsWith(expected.pathname) &&
      parsed.pathname.length > expected.pathname.length
    )
  } catch {
    return false
  }
}

/** Storage object path for a public URL, or null when it is not one. */
export function getStoragePath(url: string, bucket: string): string | null {
  if (!isSupabasePublicUrl(url, bucket)) return null

  const prefix = `/storage/v1/object/public/${bucket}/`
  const { pathname } = new URL(url)

  return decodeURIComponent(pathname.slice(prefix.length))
}
