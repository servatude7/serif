import { NextResponse } from 'next/server'
import { z } from 'zod'

import { sendLoopsSignupEvent, upsertLoopsContact } from '@/lib/loops'

const bodySchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1).max(100).optional(),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or firstName' }, { status: 400 })
  }

  try {
    await upsertLoopsContact(parsed.data)
    await sendLoopsSignupEvent(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Loops subscribe error', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 502 })
  }
}
