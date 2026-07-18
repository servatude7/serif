'use client'

import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { createBlogWithAI } from '@/lib/actions/ai-blog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function AiBlogForm() {
  const router = useRouter()
  const [tone, setTone] = useState('informative')
  const [length, setLength] = useState('medium')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set('tone', tone)
    formData.set('length', length)

    startTransition(async () => {
      const result = await createBlogWithAI(formData)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success('AI draft created')
      router.push(`/dashboard/blogs/${result.id}/edit`)
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back to post creation options"
          disabled={isPending}
          onClick={() => router.push('/dashboard/blogs/new')}
        >
          <ArrowLeft />
        </Button>
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Sparkles className="size-6 text-primary" />
            Create with AI
          </h2>
          <p className="text-muted-foreground">
            Describe your idea and GPT-5.1 will create a complete draft.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post brief</CardTitle>
          <CardDescription>
            The generated post is saved as a draft so you can review and edit
            every field before publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic and instructions</Label>
              <Textarea
                id="topic"
                name="topic"
                required
                minLength={10}
                maxLength={3000}
                rows={8}
                placeholder="Explain what the post should cover, the key takeaway, and any points that must be included…"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Include enough context for an accurate, useful article.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Input
                id="audience"
                name="audience"
                maxLength={200}
                placeholder="For example: first-time founders"
                disabled={isPending}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={isPending}
                >
                  <SelectTrigger id="tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="conversational">
                      Conversational
                    </SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Target length</Label>
                <Select
                  value={length}
                  onValueChange={setLength}
                  disabled={isPending}
                >
                  <SelectTrigger id="length" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short · about 600 words</SelectItem>
                    <SelectItem value="medium">
                      Medium · about 1,000 words
                    </SelectItem>
                    <SelectItem value="long">Long · about 1,500 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.push('/dashboard/blogs/new')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {isPending ? 'Generating draft…' : 'Generate draft'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
