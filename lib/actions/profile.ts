'use server'

import { revalidatePath } from 'next/cache'

import {
  getStoragePath,
  IMAGE_TYPE_EXTENSIONS,
  isSupabasePublicUrl,
  isSupportedImageType,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_LABEL,
} from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'

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

  // The avatar is submitted as a plain URL field, so only URLs inside this
  // project's `avatars` bucket are accepted.
  const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null
  if (avatarUrl && !isSupabasePublicUrl(avatarUrl, 'avatars')) {
    throw new Error('Avatar must be an uploaded image')
  }

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

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('No file provided')
  }
  if (!isSupportedImageType(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF image')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller`)
  }

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

  const path = `${user.id}/${crypto.randomUUID()}.${IMAGE_TYPE_EXTENSIONS[file.type]}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: false })

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
