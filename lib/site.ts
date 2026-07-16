export const siteName = 'Serif'
export const siteDescription =
  'Serif is a modern publishing platform for thinkers, writers, and creators.'

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL

  if (!configuredUrl) {
    return new URL('http://localhost:3000')
  }

  const normalizedUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`

  return new URL(normalizedUrl)
}

export function absoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString()
}
