'use client'

import type { ComponentProps } from 'react'
import { LogOut } from 'lucide-react'

import { useSignOut } from '@/hooks/use-sign-out'
import { Button } from '@/components/ui/button'

export function LogoutButton({
  variant = 'outline',
  ...props
}: Omit<ComponentProps<typeof Button>, 'onClick'>) {
  const signOut = useSignOut()

  return (
    <Button variant={variant} onClick={signOut} {...props}>
      <LogOut />
      Log out
    </Button>
  )
}
