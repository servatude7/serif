export const MAX_BLOG_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_BLOG_IMAGE_SIZE_LABEL = '5 MB'

export const BLOG_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export function isSupportedBlogImageType(
  type: string,
): type is (typeof BLOG_IMAGE_TYPES)[number] {
  return BLOG_IMAGE_TYPES.some((supportedType) => supportedType === type)
}
