import type { JSONContent } from '@tiptap/react'

export const mockTiptapContent: JSONContent = {
  type: 'doc',
  content: [
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
  ],
}

export const emptyEditorContent: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}
