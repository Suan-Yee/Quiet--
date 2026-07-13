import {
  Bold,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import InlineImagePanel, { MAX_INLINE_IMAGES } from './InlineImagePanel'

type EditorToolbarProps = {
  editor: Editor | null
}

type ToolbarButtonProps = {
  label: string
  isActive?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, isActive = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-semibold transition ${
        disabled
          ? 'cursor-not-allowed text-[var(--color-muted)] opacity-50'
          : isActive
          ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]'
          : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false)

  if (!editor) {
    return null
  }

  let imageCount = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'image') {
      imageCount += 1
    }
  })

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="theme-scrollbar flex gap-2 overflow-x-auto px-3 py-2">
        <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1">
          <ToolbarButton
            label="Bold"
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Highlight"
            isActive={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter size={17} aria-hidden="true" />
          </ToolbarButton>
        </div>

      <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1">
        <ToolbarButton
          label="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={17} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1">
        <ToolbarButton
          label="Bullet list"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={17} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1">
        <ToolbarButton
          label={`Insert inline image (${imageCount} of ${MAX_INLINE_IMAGES})`}
          isActive={isImagePanelOpen}
          onClick={() => setIsImagePanelOpen((currentValue) => !currentValue)}
        >
          <ImageIcon size={17} aria-hidden="true" />
          <span className="ml-1 text-xs">{imageCount}/{MAX_INLINE_IMAGES}</span>
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={17} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1">
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={17} aria-hidden="true" />
        </ToolbarButton>
      </div>
      </div>

      {isImagePanelOpen ? (
        <InlineImagePanel
          editor={editor}
          imageCount={imageCount}
          onClose={() => setIsImagePanelOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default EditorToolbar
