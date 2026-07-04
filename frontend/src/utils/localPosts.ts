import type { MockPost } from '../data/mockPosts'
import type { PostDraft } from '../types/post'

const LOCAL_POSTS_KEY = 'quiet-pages-local-posts'
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
