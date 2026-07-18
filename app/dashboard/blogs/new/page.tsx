import Link from 'next/link'
import { ArrowRight, FilePenLine, Sparkles } from 'lucide-react'

export default function NewBlogPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create a new post</h2>
        <p className="text-muted-foreground">
          Start from a blank page or let AI prepare a complete draft.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/blogs/new/manual"
          className="group rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
            <FilePenLine className="size-5" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">Create post manually</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Write, format, and publish your post with the full editor.
          </p>
          <span className="mt-6 flex items-center gap-2 text-sm font-medium">
            Open editor
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/dashboard/blogs/new/ai"
          className="group rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">Create post with AI</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Describe your idea and get a complete, editable draft from GPT-5.1.
          </p>
          <span className="mt-6 flex items-center gap-2 text-sm font-medium">
            Generate a draft
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  )
}
