type PostInteraction = {
  isReacted?: boolean
  isBookmarked?: boolean
}

const LOCAL_INTERACTIONS_KEY = 'quiet-pages-post-interactions'
type PostId = number | string

function getInteractions(): Record<string, PostInteraction> {
  const storedInteractions = window.localStorage.getItem(LOCAL_INTERACTIONS_KEY)

  if (!storedInteractions) {
    return {}
  }

  try {
    return JSON.parse(storedInteractions) as Record<string, PostInteraction>
  } catch {
    return {}
  }
}

function saveInteractions(interactions: Record<string, PostInteraction>) {
  window.localStorage.setItem(LOCAL_INTERACTIONS_KEY, JSON.stringify(interactions))
}

export function getPostInteraction(postId: PostId): PostInteraction {
  return getInteractions()[String(postId)] ?? {}
}

export function savePostReaction(postId: PostId, isReacted: boolean) {
  const interactions = getInteractions()
  const id = String(postId)
  interactions[id] = {
    ...interactions[id],
    isReacted,
  }
  saveInteractions(interactions)
}

export function savePostBookmark(postId: PostId, isBookmarked: boolean) {
  const interactions = getInteractions()
  const id = String(postId)
  interactions[id] = {
    ...interactions[id],
    isBookmarked,
  }
  saveInteractions(interactions)
}
