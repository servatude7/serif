'use server'

import { sendLoopsSignupEvent, upsertLoopsContact } from '@/lib/loops'
import { createClient } from '@/lib/supabase/server'

/**
 * Subscribes the signed-in user to Loops and fires the `signup` event.
 *
 * The email and first name come from the session, never from the caller, so
 * this cannot be used to add arbitrary addresses to the mailing list — which is
 * what the public `/api/loops/subscribe` route allowed. Failures are swallowed:
 * marketing sync must never break sign-up or email confirmation.
 */
export async function subscribeCurrentUserToLoops(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return

  const firstName =
    typeof user.user_metadata?.first_name === 'string'
      ? user.user_metadata.first_name.trim() || undefined
      : undefined

  try {
    await upsertLoopsContact({ email: user.email, firstName })
    await sendLoopsSignupEvent({ email: user.email, firstName })
  } catch (error) {
    console.error('Loops subscribe failed', error)
  }
}
