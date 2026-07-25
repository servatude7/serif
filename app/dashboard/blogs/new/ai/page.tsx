import { redirect } from 'next/navigation'

import { AiBlogForm } from '@/components/blog/ai-blog-form'
import { createClient } from '@/lib/supabase/server'
import { isProUser } from '@/lib/subscription'

export default async function NewAiBlogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The dashboard layout already redirects unauthenticated users to login,
  // but re-check here since this page can be reached by direct navigation.
  if (!user || !(await isProUser(supabase, user.id))) {
    redirect('/pricing')
  }

  return <AiBlogForm />
}
