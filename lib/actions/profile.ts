'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

function getStoragePath(url: string, bucket: string): string | null {
  const match = url.match(new RegExp(`/object/public/${bucket}/(.+)`))
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function revalidateProfilePaths() {
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/blogs')
  revalidatePath('/blogs')
}

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const firstName = (formData.get('first_name') as string)?.trim() || null
  const avatarUrl = (formData.get('avatar_url') as string) || null

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      avatar_url: avatarUrl,
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidateProfilePaths()
}

export async function uploadAvatar(formData: FormData): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')
  if (!file.type.startsWith('image/')) throw new Error('File must be an image')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5 MB')

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.avatar_url) {
    const oldPath = getStoragePath(profile.avatar_url, 'avatars')
    if (oldPath) {
      await supabase.storage.from('avatars').remove([oldPath])
    }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', user.id)

  if (updateError) throw new Error(updateError.message)

  revalidateProfilePaths()

  return data.publicUrl
}
