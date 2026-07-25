import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/database.types'

type AdminClient = ReturnType<typeof createAdminClient>
type SubscriptionStatus = Database['public']['Enums']['subscription_status']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    stripeInvoiceId: typeof obj.id === 'string' && obj.id.startsWith('in_') ? obj.id : null,
    amountTotal: obj.amount_total ?? obj.amount_paid ?? null,
    currency: obj.currency ?? null,
    status: obj.status ?? null,
  }
}

/** Resolves the Supabase user id for a Stripe customer, preferring metadata. */
async function resolveUserId(
  admin: AdminClient,
  { metadataUserId, customerId }: { metadataUserId?: string | null; customerId?: string | null }
): Promise<string | null> {
  if (metadataUserId) return metadataUserId
  if (!customerId) return null

  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.id ?? null
}

/** Upserts the subscriptions row and syncs the denormalized profile status. */
async function syncSubscription(
  admin: AdminClient,
  subscription: Stripe.Subscription,
  userId: string
) {
  const item = subscription.items.data[0]
  const customerId = extractId(subscription.customer)
  if (!customerId) return

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
  admin: AdminClient,
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription') return

  const subscriptionId = extractId(session.subscription)
  if (!subscriptionId) return

  const userId = await resolveUserId(admin, {
    metadataUserId: session.metadata?.supabase_user_id ?? session.client_reference_id,
    customerId: extractId(session.customer),
  })
  if (!userId) {
    console.error('checkout.session.completed: could not resolve Supabase user', {
      sessionId: session.id,
    })
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await syncSubscription(admin, subscription, userId)
}

async function handleSubscriptionUpsert(
  admin: AdminClient,
  subscription: Stripe.Subscription
) {
  const userId = await resolveUserId(admin, {
    metadataUserId: subscription.metadata?.supabase_user_id,
    customerId: extractId(subscription.customer),
  })
  if (!userId) {
    console.error('subscription event: could not resolve Supabase user', {
      subscriptionId: subscription.id,
    })
    return
  }

  await syncSubscription(admin, subscription, userId)
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    console.error('Stripe webhook missing signature header or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()
  const fields = extractTransactionFields(event.data.object)
  const userId = await resolveUserId(admin, { customerId: fields.stripeCustomerId })

  // Log every event for auditing. The unique constraint on stripe_event_id
  // makes this idempotent: if Stripe retries a delivery, the insert fails
  // with a unique violation and we skip reprocessing below.
  const { error: insertError } = await admin.from('transactions').insert({
    user_id: userId,
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_customer_id: fields.stripeCustomerId,
    stripe_subscription_id: fields.stripeSubscriptionId,
    stripe_invoice_id: fields.stripeInvoiceId,
    amount_total: fields.amountTotal,
    currency: fields.currency,
    status: fields.status,
    payload: event as unknown as Database['public']['Tables']['transactions']['Insert']['payload'],
  })

  if (insertError) {
    if (insertError.code === '23505') {
      // Already processed this event id.
      return NextResponse.json({ received: true })
    }
    console.error('Failed to log Stripe webhook event', insertError)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(admin, event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpsert(admin, event.data.object)
        break
      default:
        break
    }
  } catch (error) {
    console.error(`Failed to handle Stripe event ${event.type}`, error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
