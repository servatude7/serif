import Stripe from 'stripe'

/**
 * Server-only Stripe client. Never import this from a Client Component.
 *
 * The real `Stripe` instance is constructed lazily on first property
 * access (via the Proxy below) rather than at module load time. Next.js
 * imports route modules while collecting build metadata even for routes
 * that never execute at build time (e.g. this webhook), and the Stripe SDK
 * throws synchronously if constructed without an API key — eagerly
 * instantiating here would break `next build` whenever
 * `STRIPE_SECRET_KEY` isn't set. Call sites that actually talk to Stripe
 * only run at request time, when the env var is expected to be present.
 */
let cachedClient: Stripe | null = null

function getClient(): Stripe {
  if (!cachedClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    cachedClient = new Stripe(apiKey, {
      apiVersion: '2026-06-24.dahlia',
      appInfo: {
        name: 'Serif',
      },
    })
  }
  return cachedClient
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
