import type { PostComment } from '../types/comment'

const readers = {
  nora: {
    id: 101,
    name: 'Nora Vale',
    username: 'nora-vale',
    profileImage:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
  },
  theo: {
    id: 102,
    name: 'Theo Grant',
    username: 'theo-grant',
    profileImage:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  maya: {
    id: 1,
    name: 'Maya Chen',
    username: 'maya-chen',
    profileImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
}

function buildComments(postId: number): PostComment[] {
  const firstCommentId = `mock-${postId}-comment-1`

  return [
    {
      id: firstCommentId,
      postId,
      authorId: readers.nora.id,
      author: readers.nora,
      body: 'This lands gently. The distinction between discipline and repeatable attention feels especially useful.',
      parentId: null,
      createdAt: '2026-07-29T07:30:00.000Z',
      updatedAt: '2026-07-29T07:30:00.000Z',
    },
    {
      id: `mock-${postId}-reply-1`,
      postId,
      authorId: readers.maya.id,
      author: readers.maya,
      body: 'Exactly. I keep coming back to systems that make the next sentence less dramatic.',
      parentId: firstCommentId,
      createdAt: '2026-07-29T08:30:00.000Z',
      updatedAt: '2026-07-29T08:30:00.000Z',
    },
    {
      id: `mock-${postId}-comment-2`,
      postId,
      authorId: readers.theo.id,
      author: readers.theo,
      body: 'The idea of protecting the emotional weather around the work is one I want to borrow.',
      parentId: null,
      createdAt: '2026-07-29T08:45:00.000Z',
      updatedAt: '2026-07-29T08:45:00.000Z',
    },
  ]
}

const mockCommentsByPost = new Map(
  [1, 2, 3, 4, 5].map((postId) => [postId, buildComments(postId)]),
)

export function getMockComments(postId: number) {
  return mockCommentsByPost.get(postId) ?? []
}
