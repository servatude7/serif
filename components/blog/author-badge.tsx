import { getDisplayName, getInitialsFromName } from '@/lib/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AuthorBadgeProps {
  firstName: string | null | undefined
  avatarUrl: string | null | undefined
}

export function AuthorBadge({ firstName, avatarUrl }: AuthorBadgeProps) {
  const name = getDisplayName(firstName)
  const initials = getInitialsFromName(firstName)

  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      by
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </span>
  )
}
