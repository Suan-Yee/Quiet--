import { mockTiptapContent, mockTiptapContentWithImages } from './mockTiptapContent'
import type { MockPost, Topic, User } from '../types/post'

const now = '2026-07-01T00:00:00.000Z'

function createUser(
  id: number,
  name: string,
  username: string,
  profileImage: string,
  authorDescription: string,
): User {
  return {
    id,
    name,
    username,
    email: `${username}@example.com`,
    profileImage,
    coverImage: '',
    bio: `${authorDescription}. ${name} writes calm essays for readers who like useful ideas, careful details, and a little room to think.`,
    authorDescription,
    role: 'user',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

function createTopic(id: number, name: string, postCount = 1): Topic {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    postCount,
    createdAt: now,
    updatedAt: now,
  }
}

export const topics: Topic[] = [
  createTopic(1, 'Writing', 2),
  createTopic(2, 'Technology', 1),
  createTopic(3, 'Culture', 1),
  createTopic(4, 'Design', 1),
  createTopic(5, 'Books', 1),
  createTopic(6, 'Startups', 1),
]

const authors = {
  maya: createUser(
    1,
    'Maya Chen',
    'maya-chen',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    'Essayist on creative routines',
  ),
  jon: createUser(
    2,
    'Jon Bell',
    'jon-bell',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    'Personal notes on place and attention',
  ),
  elena: createUser(
    3,
    'Elena Torres',
    'elena-torres',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'Writing about creative process',
  ),
  priya: createUser(
    4,
    'Priya Raman',
    'priya-raman',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    'Notes on essays, books, and trust',
  ),
  samira: createUser(
    5,
    'Samira Cole',
    'samira-cole',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'Product thinking for independent writers',
  ),
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
    id: 1,
    authorId: authors.maya.id,
    author: authors.maya,
    title: 'The quiet systems that make creative work possible',
    excerpt:
      'A practical look at small routines, gentle constraints, and repeatable spaces that help independent writers keep showing up.',
    contentText: 'A practical look at small routines, gentle constraints, and repeatable spaces.',
    contentJson: mockTiptapContentWithImages,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    coverImagePublicId: '',
    status: 'published',
    visibility: 'public',
    readTime: 6,
    reactionCount: 128,
    commentCount: 18,
    bookmarkCount: 31,
    topics: [topics[0]],
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    isFeatured: true,
    quotePreview: 'A system is useful when it makes the next return feel obvious.',
    isReacted: false,
    isBookmarked: false,
  },
  {
    id: 2,
    authorId: authors.jon.id,
    author: authors.jon,
    title: 'Notes from a city that refuses to hurry',
    excerpt:
      'What morning walks, old bookstores, and one excellent cup of tea can teach us about paying attention.',
    contentText: 'What morning walks, old bookstores, and one excellent cup of tea can teach us about paying attention.',
    contentJson: mockTiptapContent,
    coverImage: '',
    coverImagePublicId: '',
    status: 'published',
    visibility: 'public',
    readTime: 4,
    reactionCount: 84,
    commentCount: 9,
    bookmarkCount: 14,
    topics: [topics[2]],
    createdAt: '2026-06-29T00:00:00.000Z',
    updatedAt: '2026-06-29T00:00:00.000Z',
    isFeatured: false,
    quotePreview: '',
    isReacted: false,
    isBookmarked: true,
  },
  {
    id: 3,
    authorId: authors.elena.id,
    author: authors.elena,
    title: 'Better questions for the blank page',
    excerpt:
      'When the opening sentence will not arrive, try changing the question you ask before you begin.',
    contentText: 'When the opening sentence will not arrive, try changing the question you ask before you begin.',
    contentJson: mockTiptapContent,
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    coverImagePublicId: '',
    status: 'published',
    visibility: 'public',
    readTime: 5,
    reactionCount: 211,
    commentCount: 32,
    bookmarkCount: 55,
    topics: [topics[3]],
    createdAt: '2026-06-27T00:00:00.000Z',
    updatedAt: '2026-06-27T00:00:00.000Z',
    isFeatured: true,
    quotePreview: 'A blank page often needs a better question, not a stronger mood.',
    isReacted: true,
    isBookmarked: false,
  },
  {
    id: 4,
    authorId: authors.priya.id,
    author: authors.priya,
    title: "The slow work of earning a reader's trust",
    excerpt:
      "Trust is built through clarity, cadence, honesty, and the decision to respect the reader's time.",
    contentText: "Trust is built through clarity, cadence, honesty, and the decision to respect the reader's time.",
    contentJson: mockTiptapContent,
    coverImage: '',
    coverImagePublicId: '',
    status: 'published',
    visibility: 'public',
    readTime: 7,
    reactionCount: 176,
    commentCount: 24,
    bookmarkCount: 42,
    topics: [topics[4]],
    createdAt: '2026-06-25T00:00:00.000Z',
    updatedAt: '2026-06-25T00:00:00.000Z',
    isFeatured: false,
    quotePreview: 'Trust starts when the writer stops trying to win every second.',
    isReacted: false,
    isBookmarked: false,
  },
  {
    id: 5,
    authorId: authors.samira.id,
    author: authors.samira,
    title: 'A newsletter is a promise, not a funnel',
    excerpt:
      'The best recurring letters feel less like campaigns and more like a room the reader is glad to enter again.',
    contentText: 'The best recurring letters feel less like campaigns and more like a room the reader is glad to enter again.',
    contentJson: mockTiptapContent,
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
    coverImagePublicId: '',
    status: 'published',
    visibility: 'public',
    readTime: 8,
    reactionCount: 243,
    commentCount: 41,
    bookmarkCount: 68,
    topics: [topics[5]],
    createdAt: '2026-06-22T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
    isFeatured: false,
    quotePreview: '',
    isReacted: false,
    isBookmarked: true,
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
