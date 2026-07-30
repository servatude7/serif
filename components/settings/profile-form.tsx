'use client'

import { useRef, useState, useTransition } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { updateProfile, uploadAvatar } from '@/lib/actions/profile'
import { getDisplayName, getInitialsFromName } from '@/lib/profile'
import {
  isSupportedImageType,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_LABEL,
} from '@/lib/storage'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  firstName: string | null
  avatarUrl: string | null
}

export function ProfileForm({ firstName, avatarUrl }: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(firstName ?? '')
  const [avatar, setAvatar] = useState(avatarUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, startSaving] = useTransition()

  const displayName = getDisplayName(name)
  const initials = getInitialsFromName(name)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isSupportedImageType(file.type)) {
      toast.error('Choose a JPEG, PNG, WebP, or GIF image')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller`)
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadAvatar(fd)
      setAvatar(url)
      toast.success('Avatar updated')
    } catch {
      toast.error('Avatar upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleSave() {
    startSaving(async () => {
      try {
        const fd = new FormData()
        fd.append('first_name', name)
        fd.append('avatar_url', avatar)
        await updateProfile(fd)
        toast.success('Profile saved')
      } catch {
        toast.error('Failed to save profile')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {avatar ? <AvatarImage src={avatar} alt={displayName} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {uploading ? 'Uploading…' : 'Upload avatar'}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or GIF up to 5 MB. Shown to readers on your published posts.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input
          id="display-name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving || uploading}>
        {saving ? (
          <>
            <Loader2 className="animate-spin" />
            Saving…
          </>
        ) : (
          'Save profile'
        )}
      </Button>
    </div>
  )
}
