'use client'

import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Redirecting…' : 'Upgrade to Pro'}
    </Button>
  )
}

interface CheckoutButtonProps {
  action: () => Promise<void>
  className?: string
}

/**
 * Posts to a server action that creates a Stripe Checkout session and
 * redirects the browser to Stripe's hosted checkout page.
 */
export function CheckoutButton({ action, className }: CheckoutButtonProps) {
  return (
    <form action={action} className={cn('w-full', className)}>
      <SubmitButton />
    </form>
  )
}
