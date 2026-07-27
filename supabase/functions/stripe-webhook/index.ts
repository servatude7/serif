import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

import type { Database, Json, SubscriptionStatus } from './database.types.ts'

type AdminClient = SupabaseClient<Database>

function requireEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not set`)
  return value
}

// Signature verification goes through the Web Crypto API, which is async in
// Deno — hence `constructEventAsync` with an explicit crypto provider below.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Both clients are built on first use rather than at module load. A missing
// secret then fails a single request with a readable log line, instead of
// killing the isolate at boot and returning an opaque WORKER_ERROR.
let stripeClient: Stripe | null = null
let adminClient: AdminClient | null = null

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-06-24.dahlia',
      appInfo: { name: 'Serif' },
      // The Node http module isn't available in the edge runtime.
      httpClient: Stripe.createFetchHttpClient(),
    })
  }
  return stripeClient
}

/**
 * Service-role client. It bypasses Row Level Security and the column-level
 * grants on `profiles`, which is exactly what this function needs — but only
 * after the Stripe signature has been verified.
 */
function getAdmin(): AdminClient {
  if (!adminClient) {
    adminClient = createClient<Database>(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return adminClient
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Stripe objects sometimes return an expanded object, sometimes just an id. */
function extractId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

function toIsoOrNull(unixSeconds: number | null | undefined): string | null {
  return typeof unixSeconds === 'number'
    ? new Date(unixSeconds * 1000).toISOString()
    : null
}

/**
 * Best-effort extraction of common billing fields across the several event
 * object shapes we log (checkout sessions, subscriptions, invoices). Any
 * field that isn't present on a given object is left null.
 */
function extractTransactionFields(object: unknown) {
  const obj = object as {
    customer?: string | { id: string } | null
    subscription?: string | { id: string } | null
    amount_total?: number | null
    amount_paid?: number | null
    currency?: string | null
    status?: string | null
    id?: string
  }

  return {
    stripeCustomerId: extractId(obj.customer),
    stripeSubscriptionId: extractId(obj.subscription),
    stripeInvoiceId:
      typeof obj.id === 'string' && obj.id.startsWith('in_') ? obj.id : null,
    amountTotal: obj.amount_total ?? obj.amount_paid ?? null,
    currency: obj.currency ?? null,
    status: obj.status ?? null,
  }
}

/** Resolves the Supabase user id for a Stripe customer, preferring metadata. */
async function resolveUserId({
  metadataUserId,
  customerId,
}: {
  metadataUserId?: string | null
  customerId?: string | null
}): Promise<string | null> {
  if (metadataUserId) return metadataUserId
  if (!customerId) return null

  const { data } = await getAdmin()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.id ?? null
}

/** Upserts the subscriptions row and syncs the denormalized profile status. */
async function syncSubscription(
  subscription: Stripe.Subscription,
  userId: string
) {
  const item = subscription.items.data[0]
  const customerId = extractId(subscription.customer)
  if (!customerId) return

  const admin = getAdmin()

  const { error: subscriptionError } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: item?.price.id ?? '',
      plan: 'pro',
      status: subscription.status as SubscriptionStatus,
      current_period_start: toIsoOrNull(item?.current_period_start),
      current_period_end: toIsoOrNull(item?.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: toIsoOrNull(subscription.canceled_at),
    },
    { onConflict: 'stripe_subscription_id' }
  )

  if (subscriptionError) {
    console.error('Failed to upsert subscription', subscriptionError)
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      subscription_status: subscription.status as SubscriptionStatus,
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Failed to sync profile subscription status', profileError)
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription') return

  const subscriptionId = extractId(session.subscription)
  if (!subscriptionId) return

  const userId = await resolveUserId({
    metadataUserId:
      session.metadata?.supabase_user_id ?? session.client_reference_id,
    customerId: extractId(session.customer),
  })
  if (!userId) {
    console.error('checkout.session.completed: could not resolve Supabase user', {
      sessionId: session.id,
    })
    return
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  await syncSubscription(subscription, userId)
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const userId = await resolveUserId({
    metadataUserId: subscription.metadata?.supabase_user_id,
    customerId: extractId(subscription.customer),
  })
  if (!userId) {
    console.error('subscription event: could not resolve Supabase user', {
      subscriptionId: subscription.id,
    })
    return
  }

  await syncSubscription(subscription, userId)
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

async function handleWebhook(request: Request): Promise<Response> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    console.error(
      'Stripe webhook missing signature header or STRIPE_WEBHOOK_SECRET'
    )
    return json({ error: 'Webhook not configured' }, 400)
  }

  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error)
    return json({ error: 'Invalid signature' }, 400)
  }

  const fields = extractTransactionFields(event.data.object)
  const userId = await resolveUserId({ customerId: fields.stripeCustomerId })

  // Log every event for auditing. The unique constraint on stripe_event_id
  // makes this idempotent: if Stripe retries a delivery, the insert fails
  // with a unique violation and we skip reprocessing below.
  const { error: insertError } = await getAdmin().from('transactions').insert({
    user_id: userId,
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_customer_id: fields.stripeCustomerId,
    stripe_subscription_id: fields.stripeSubscriptionId,
    stripe_invoice_id: fields.stripeInvoiceId,
    amount_total: fields.amountTotal,
    currency: fields.currency,
    status: fields.status,
    payload: event as unknown as Json,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      // Already processed this event id.
      return json({ received: true })
    }
    console.error('Failed to log Stripe webhook event', insertError)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpsert(event.data.object)
        break
      default:
        break
    }
  } catch (error) {
    console.error(`Failed to handle Stripe event ${event.type}`, error)
    return json({ error: 'Webhook handler failed' }, 500)
  }

  return json({ received: true })
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    return await handleWebhook(request)
  } catch (error) {
    // Missing secrets and other unexpected failures land here. Returning 500
    // tells Stripe to retry, which is what we want once the cause is fixed.
    console.error('Stripe webhook failed', error)
    return json({ error: 'Webhook handler failed' }, 500)
  }
})
