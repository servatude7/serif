import type { Metadata } from 'next'

import { createCheckoutSession } from '@/lib/actions/billing'
import { createClient } from '@/lib/supabase/server'
import { isProUser } from '@/lib/subscription'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PricingCards } from '@/components/pricing/pricing-cards'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Start for free, or upgrade to Pro to unlock AI-powered blog drafts and every Serif feature.',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPro = user ? await isProUser(supabase, user.id) : false

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Start writing for free. Upgrade to Pro whenever you want AI to
              help draft your next post.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <PricingCards
              isLoggedIn={!!user}
              isPro={isPro}
              checkoutAction={createCheckoutSession}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
