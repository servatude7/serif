import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckoutButton } from '@/components/pricing/checkout-button'
import { cn } from '@/lib/utils'

const freeFeatures = [
  'Manual blog creation with the full editor',
  'Publish posts to your public blog',
  'Cover images and rich text formatting',
]

const proFeatures = [
  'Everything in Free',
  'AI-powered blog drafts from a short brief',
  'Unlocks all current and future Serif features',
]

interface PricingCardsProps {
  isLoggedIn: boolean
  isPro: boolean
  checkoutAction: () => Promise<void>
}

export function PricingCards({
  isLoggedIn,
  isPro,
  checkoutAction,
}: PricingCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {/* Free plan */}
      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-xl">Free</CardTitle>
          <CardDescription>
            Everything you need to start writing and publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="mb-6 text-3xl font-bold tracking-tight">
            $0
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / month
            </span>
          </p>
          <ul className="space-y-3">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent p-4">
          {isLoggedIn ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Pro plan */}
      <Card
        className={cn(
          'p-2 ring-2 ring-primary',
          isPro && 'ring-primary/60'
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Pro</CardTitle>
            <Badge className="gap-1">
              <Sparkles className="size-3" />
              Most popular
            </Badge>
          </div>
          <CardDescription>
            Unlock AI-powered writing and every feature Serif offers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="mb-6 text-3xl font-bold tracking-tight">
            $20
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / month
            </span>
          </p>
          <ul className="space-y-3">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent p-4">
          {isPro ? (
            <Button className="w-full" disabled>
              Current plan
            </Button>
          ) : (
            <CheckoutButton action={checkoutAction} />
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
