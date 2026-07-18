'use server'

import { revalidatePath } from 'next/cache'
import { NoObjectGeneratedError } from 'ai'

import {
  blogGenerationInputSchema,
  generateBlogPost,
  generatedBlogToTipTap,
} from '@/lib/ai/blog-generation'
import { createBlogRecord } from '@/lib/blog-mutations'
import { createClient } from '@/lib/supabase/server'

export type CreateAiBlogResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createBlogWithAI(
  formData: FormData,
): Promise<CreateAiBlogResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to generate a post.' }
  }

  const parsed = blogGenerationInputSchema.safeParse({
    topic: formData.get('topic'),
    audience: formData.get('audience') ?? '',
    tone: formData.get('tone'),
    length: formData.get('length'),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Check your post details.',
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('AI blog generation is missing OPENAI_API_KEY')
    return {
      success: false,
      error: 'AI generation is not configured. Please try again later.',
    }
  }

  try {
    const generated = await generateBlogPost(parsed.data)
    const body = generatedBlogToTipTap(generated)
    const { id } = await createBlogRecord(supabase, user.id, {
      title: generated.title,
      summary: generated.summary,
      body,
      image: null,
      status: 'draft',
    })

    revalidatePath('/dashboard/blogs')

    return { success: true, id }
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error('GPT-5.1 returned an invalid blog object', {
        cause: error.cause,
        response: error.response,
        usage: error.usage,
      })
    } else {
      console.error('AI blog generation failed', error)
    }

    return {
      success: false,
      error: 'We could not generate your draft. Please try again.',
    }
  }
}
