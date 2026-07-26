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
      Image.configure({
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'mx-auto min-h-[620px] w-full max-w-[820px] px-5 py-9 font-reading text-[1.08rem] leading-9 text-[var(--color-text)] outline-none sm:px-10 sm:py-12',
        'aria-label': 'Article body',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
