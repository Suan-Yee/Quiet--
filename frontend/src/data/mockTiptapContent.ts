import type { JSONContent } from '@tiptap/react'

const baseArticleContent: JSONContent[] = [
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Creative work rarely depends on one dramatic moment of discipline. More often, it grows inside a set of quiet systems: a saved place for stray notes, a recurring hour for revision, a trusted reader, and enough margin to notice what a draft is trying to become.',
      },
    ],
  },
  {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Make the path back easy' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'The point of a system is not to make writing mechanical. It is to reduce the number of decisions that stand between an idea and the page. When the ritual is small enough to repeat, attention has somewhere familiar to land.',
      },
    ],
  },
  {
    type: 'blockquote',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'The best creative systems do not make the work louder. They make the return quieter.',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'A useful system should ', marks: [{ type: 'highlight' }] },
      { type: 'text', text: 'lower the cost of beginning', marks: [{ type: 'highlight' }] },
      {
        type: 'text',
        text: ", preserve attention while you are inside the work, and make tomorrow's return feel obvious.",
        marks: [{ type: 'highlight' }],
      },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'bulletList',
    content: [
      {
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Keep one trusted place for unfinished ideas.' }] }],
      },
      {
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create a repeatable opening ritual before drafting.' }] }],
      },
      {
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Stop with a note about where to begin next time.' }] }],
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'A calm workflow also protects the emotional weather around the work. Writers do not need more pressure dressed up as ambition. They need a structure that makes it easier to begin, easier to return, and easier to stop before the work turns brittle.',
      },
    ],
  },
]

const workspaceImage: JSONContent = {
  type: 'image',
  attrs: {
    src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85',
    alt: 'An open notebook beside a laptop and coffee on a writing desk',
    title: 'A prepared workspace lowers the effort required to begin.',
  },
}

const collaborationImage: JSONContent = {
  type: 'image',
  attrs: {
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85',
    alt: 'A small group sharing ideas around laptops at a wooden table',
    title: 'A trusted reader can become part of a sustainable creative system.',
  },
}

export const mockTiptapContent: JSONContent = {
  type: 'doc',
  content: baseArticleContent,
}

export const mockTiptapContentWithImages: JSONContent = {
  type: 'doc',
  content: [
    baseArticleContent[0],
    workspaceImage,
    ...baseArticleContent.slice(1, 7),
    collaborationImage,
    ...baseArticleContent.slice(7),
  ],
}

export const emptyEditorContent: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}
