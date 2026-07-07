'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Pilcrow,
  Unlink,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface TiptapEditorProps {
  content?: JSONContent | null
  onChange?: (json: JSONContent) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing your post…',
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        },
      }),
    ],
    content: content ?? undefined,
    editorProps: {
      attributes: {
        class: 'min-h-[320px] px-4 py-3',
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (!editor) return

      if (editor.isActive('heading', { level })) {
        const { empty, $from } = editor.state.selection
        const isAtEnd =
          empty &&
          $from.parentOffset === $from.parent.content.size &&
          $from.parent.content.size > 0

        if (isAtEnd) {
          editor.chain().focus().splitBlock().setParagraph().run()
        } else {
          editor.chain().focus().toggleHeading({ level }).run()
        }
      } else {
        editor.chain().focus().toggleHeading({ level }).run()
      }
    },
    [editor],
  )

  const setParagraph = useCallback(() => {
    if (!editor) return

    if (!editor.isActive('paragraph')) {
      const { empty, $from } = editor.state.selection
      const isAtEnd =
        empty &&
        $from.parentOffset === $from.parent.content.size &&
        $from.parent.content.size > 0

      if (isAtEnd && editor.isActive('heading')) {
        editor.chain().focus().splitBlock().setParagraph().run()
      } else {
        editor.chain().focus().setParagraph().run()
      }
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const isP =
    editor
      ? !editor.isActive('heading') &&
        !editor.isActive('bulletList') &&
        !editor.isActive('orderedList')
      : false

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      {/* Static toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          onClick={setParagraph}
          active={isP}
          title="Paragraph"
        >
          <Pilcrow className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          onClick={() => toggleHeading(1)}
          active={editor?.isActive('heading', { level: 1 }) ?? false}
          title="Heading 1"
        >
          <Heading1 className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => toggleHeading(2)}
          active={editor?.isActive('heading', { level: 2 }) ?? false}
          title="Heading 2"
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => toggleHeading(3)}
          active={editor?.isActive('heading', { level: 3 }) ?? false}
          title="Heading 3"
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold') ?? false}
          title="Bold"
        >
          <Bold className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic') ?? false}
          title="Italic"
        >
          <Italic className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList') ?? false}
          title="Bullet list"
        >
          <List className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList') ?? false}
          title="Ordered list"
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {editor?.isActive('link') ? (
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
            }
            active={false}
            title="Remove link"
          >
            <Unlink className="size-3.5" />
          </ToolbarButton>
        ) : (
          <ToolbarButton onClick={setLink} active={false} title="Add link">
            <LinkIcon className="size-3.5" />
          </ToolbarButton>
        )}
      </div>

      {/* Bubble menu — appears on text selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md"
        >
          <ToolbarButton
            onClick={setParagraph}
            active={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Pilcrow className="size-3.5" />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => toggleHeading(1)}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(2)}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(3)}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-3.5" />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-border" />
          {editor.isActive('link') ? (
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              }
              active={false}
              title="Remove link"
            >
              <Unlink className="size-3.5" />
            </ToolbarButton>
          ) : (
            <ToolbarButton onClick={setLink} active={false} title="Add link">
              <LinkIcon className="size-3.5" />
            </ToolbarButton>
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title: string
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className="size-7"
      // Prevent the button from stealing focus from the editor.
      // Without this, clicking a toolbar button collapses the editor selection
      // before the command runs, causing the wrong block to be affected.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  )
}
