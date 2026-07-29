import { mockCurrentUser } from '../data/mockCurrentUser'
import type { NewPostComment, PostComment } from '../types/comment'
import { getCurrentMockUser } from './localAuth'

const LOCAL_COMMENTS_KEY = 'quiet-pages-local-comments'

type StoredComments = Record<string, PostComment[]>

function getStoredComments(): StoredComments {
  const storedComments = window.localStorage.getItem(LOCAL_COMMENTS_KEY)

  if (!storedComments) {
    return {}
  }

  try {
    return JSON.parse(storedComments) as StoredComments
  } catch {
    return {}
  }
}

function createCommentId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getLocalComments(postId: number) {
  return getStoredComments()[String(postId)] ?? []
}

export function saveLocalComment(
  postId: number,
  input: NewPostComment,
) {
  const storedComments = getStoredComments()
  const currentUser = getCurrentMockUser()
  const createdAt = new Date().toISOString()
  const comment: PostComment = {
    id: createCommentId(),
    postId,
    authorId: mockCurrentUser.id,
    author: {
      id: mockCurrentUser.id,
      name: currentUser.name,
      username: currentUser.username ?? mockCurrentUser.username,
      profileImage: currentUser.profileImage ?? mockCurrentUser.profileImage,
    },
    body: input.body.trim(),
    parentId: input.parentId ?? null,
    replyToId: input.replyToId ?? null,
    media: input.media?.length ? input.media : undefined,
    poll: input.poll ?? undefined,
    createdAt,
    updatedAt: createdAt,
  }

  storedComments[String(postId)] = [
    comment,
    ...(storedComments[String(postId)] ?? []),
  ]
  window.localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(storedComments))

  return comment
}
