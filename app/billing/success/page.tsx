import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { isProUser } from '@/lib/subscription'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'You are on Pro',
}

export default async function BillingSuccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // The Stripe webhook is what actually grants Pro, and it can land after the
  // redirect back from Checkout, so confirm the state instead of assuming it.
  const isPro = await isProUser(supabase, user.id)

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isPro ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <Clock className="size-6" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPro ? "You're on Pro!" : 'Payment processing'}
          </CardTitle>
          <CardDescription>
            {isPro
              ? 'Your subscription is active. AI-powered blog drafts and every Serif feature are unlocked.'
              : 'Stripe is still confirming your payment. Pro features unlock as soon as it does — refresh in a moment.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
