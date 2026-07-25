import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

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

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-2xl">You&apos;re on Pro!</CardTitle>
          <CardDescription>
            Your subscription is active. AI-powered blog drafts and every
            Serif feature are unlocked.
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
