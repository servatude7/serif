'use server'

import { redirect } from 'next/navigation'

import { absoluteUrl } from '@/lib/site'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isProUser } from '@/lib/subscription'

function getProPriceId() {
  const priceId = process.env.STRIPE_PRICE_ID_PRO
  if (!priceId) throw new Error('STRIPE_PRICE_ID_PRO is not set')
  return priceId
}

/**
 * Creates a Stripe Checkout session for the Pro plan and redirects the
 * browser to Stripe's hosted checkout page. Intended to be used directly as
 * a `<form action={createCheckoutSession}>` server action from the pricing
 * page.
 */
export async function createCheckoutSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Already Pro: no need to check out again.
  if (await isProUser(supabase, user.id)) {
    redirect('/dashboard')
  }

  // `stripe_customer_id` is not granted to `authenticated` (see
  // 20260728134500_restrict_profile_reads.sql), so both the read and the write
  // go through the service-role client, after `getUser()` established who the
  // caller is.
  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)

  let customerId = profile?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    const { error: updateError } = await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)

    if (updateError) throw new Error(updateError.message)
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: getProPriceId(), quantity: 1 }],
    success_url: absoluteUrl('/billing/success'),
    cancel_url: absoluteUrl('/pricing'),
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  })

  if (!checkoutSession.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  redirect(checkoutSession.url)
}
