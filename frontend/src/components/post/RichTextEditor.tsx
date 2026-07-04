import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import EditorToolbar from './EditorToolbar'

type RichTextEditorProps = {
  content: JSONContent
  onChange: (content: JSONContent) => void
}

function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Begin writing your article...',
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Image,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-[520px] px-6 py-7 font-reading text-lg leading-9 text-[var(--color-text)] outline-none sm:px-8',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
