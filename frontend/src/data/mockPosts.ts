import type { JSONContent } from '@tiptap/react'
import { mockTiptapContent } from './mockTiptapContent'

export type MockPost = {
  id: string
  title: string
  preview: string
  category: string
  authorDescription: string
  author: {
    name: string
    avatar: string
  }
  date: string
  readTime: string
  image?: string
  isFeatured: boolean
  quotePreview?: string
  reactionCount: number
  commentCount: number
  isReacted: boolean
  isBookmarked: boolean
  content?: JSONContent
  reactions: number
  comments: number
}

export type SuggestedAuthor = {
  name: string
  topic: string
  description: string
  initials: string
  avatar: string
}

export const mockPosts: MockPost[] = [
  {
    id: 'quiet-systems',
    title: 'The quiet systems that make creative work possible',
    preview:
      'A practical look at small routines, gentle constraints, and repeatable spaces that help independent writers keep showing up.',
    category: 'Writing',
    authorDescription: 'Essayist on creative routines',
    author: {
      name: 'Maya Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    },
    date: 'Jul 1',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    quotePreview: 'A system is useful when it makes the next return feel obvious.',
    reactionCount: 128,
    commentCount: 18,
    isReacted: false,
    isBookmarked: false,
    content: mockTiptapContent,
    reactions: 128,
    comments: 18,
  },
  {
    id: 'city-notebooks',
    title: 'Notes from a city that refuses to hurry',
    preview:
      'What morning walks, old bookstores, and one excellent cup of tea can teach us about paying attention. What morning walks, old bookstores, and one excellent cup of tea can teach us about paying attention.',
    category: 'Culture',
    authorDescription: 'Personal notes on place and attention',
    author: {
      name: 'Jon Bell',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    },
    date: 'Jun 29',
    readTime: '4 min read',
    isFeatured: false,
    reactionCount: 84,
    commentCount: 9,
    isReacted: false,
    isBookmarked: true,
    reactions: 84,
    comments: 9,
  },
  {
    id: 'better-questions',
    title: 'Better questions for the blank page',
    preview:
      'When the opening sentence will not arrive, try changing the question you ask before you begin.',
    category: 'Design',
    authorDescription: 'Writing about creative process',
    author: {
      name: 'Elena Torres',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    date: 'Jun 27',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    quotePreview: 'A blank page often needs a better question, not a stronger mood.',
    reactionCount: 211,
    commentCount: 32,
    isReacted: true,
    isBookmarked: false,
    reactions: 211,
    comments: 32,
  },
  {
    id: 'reader-trust',
    title: "The slow work of earning a reader's trust",
    preview:
      "Trust is built through clarity, cadence, honesty, and the decision to respect the reader's time.",
    category: 'Books',
    authorDescription: 'Notes on essays, books, and trust',
    author: {
      name: 'Priya Raman',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    },
    date: 'Jun 25',
    readTime: '7 min read',
    isFeatured: false,
    quotePreview: 'Trust starts when the writer stops trying to win every second.',
    reactionCount: 176,
    commentCount: 24,
    isReacted: false,
    isBookmarked: false,
    reactions: 176,
    comments: 24,
  },
  {
    id: 'newsletter-craft',
    title: 'A newsletter is a promise, not a funnel',
    preview:
      'The best recurring letters feel less like campaigns and more like a room the reader is glad to enter again.',
    category: 'Startups',
    authorDescription: 'Product thinking for independent writers',
    author: {
      name: 'Samira Cole',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    },
    date: 'Jun 22',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
    reactionCount: 243,
    commentCount: 41,
    isReacted: false,
    isBookmarked: true,
    reactions: 243,
    comments: 41,
  },
]

export const suggestedAuthors: SuggestedAuthor[] = [
  {
    name: 'Nora Vale',
    topic: 'Culture essays',
    description: 'Sharp weekly criticism on books, cities, and attention.',
    initials: 'NV',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
  },
  {
    name: 'Theo Grant',
    topic: 'Product thinking',
    description: 'Calm notes on craft, teams, and durable software.',
    initials: 'TG',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
  },
  {
    name: 'Ari Morgan',
    topic: 'Personal notes',
    description: 'Intimate essays on creative practice and ordinary life.',
    initials: 'AM',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80',
  },
]

export const topics: string[] = ['Writing', 'Technology', 'Culture', 'Design', 'Books', 'Startups']
