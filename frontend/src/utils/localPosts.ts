import type { MockPost, PostDraft } from '../types/post'

export const LOCAL_POSTS_KEY = 'quiet-pages-local-posts'
export const LOCAL_POSTS_CHANGED_EVENT = 'quiet-pages:local-posts-changed'
const LOCAL_DRAFT_KEY = 'quiet-pages-local-draft'

export function getLocalPosts(): MockPost[] {
  const storedPosts = window.localStorage.getItem(LOCAL_POSTS_KEY)

  if (!storedPosts) {
    return []
  }

  try {
    return JSON.parse(storedPosts) as MockPost[]
  } catch {
    return []
  }
}

export function saveLocalPost(post: MockPost) {
  const existingPosts = getLocalPosts().filter((item) => item.id !== post.id)
  window.localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify([post, ...existingPosts]))
  window.dispatchEvent(new Event(LOCAL_POSTS_CHANGED_EVENT))
}

export function saveLocalDraft(draft: PostDraft) {
  window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft))
}

export function getLocalDraft(): PostDraft | null {
  const storedDraft = window.localStorage.getItem(LOCAL_DRAFT_KEY)

  if (!storedDraft) {
    return null
  }

  try {
    return JSON.parse(storedDraft) as PostDraft
  } catch {
    return null
  }
}
