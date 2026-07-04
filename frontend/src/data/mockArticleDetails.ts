export type ArticleBlock =
  | {
      type: 'paragraph'
      text: string
      lead?: boolean
    }
  | {
      type: 'heading'
      text: string
    }
  | {
      type: 'quote'
      text: string
    }
  | {
      type: 'note'
      text: string
    }
  | {
      type: 'divider'
    }
  | {
      type: 'list'
      items: string[]
    }

export const mockArticleBlocks: ArticleBlock[] = [
  {
    type: 'paragraph',
    lead: true,
    text: 'Creative work rarely depends on one dramatic moment of discipline. More often, it grows inside a set of quiet systems: a saved place for stray notes, a recurring hour for revision, a trusted reader, and enough margin to notice what a draft is trying to become.',
  },
  {
    type: 'heading',
    text: 'Make the path back easy',
  },
  {
    type: 'paragraph',
    text: 'The point of a system is not to make writing mechanical. It is to reduce the number of decisions that stand between an idea and the page. When the ritual is small enough to repeat, attention has somewhere familiar to land.',
  },
  {
    type: 'quote',
    text: 'The best creative systems do not make the work louder. They make the return quieter.',
  },
  {
    type: 'note',
    text: "A useful system should lower the cost of beginning, preserve attention while you are inside the work, and make tomorrow's return feel obvious.",
  },
  {
    type: 'divider',
  },
  {
    type: 'list',
    items: [
      'Keep one trusted place for unfinished ideas.',
      'Create a repeatable opening ritual before drafting.',
      'Stop with a note about where to begin next time.',
    ],
  },
  {
    type: 'paragraph',
    text: 'A calm workflow also protects the emotional weather around the work. Writers do not need more pressure dressed up as ambition. They need a structure that makes it easier to begin, easier to return, and easier to stop before the work turns brittle.',
  },
]
