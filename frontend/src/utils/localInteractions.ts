type PostInteraction = {
  isReacted?: boolean
  isBookmarked?: boolean
}

const LOCAL_INTERACTIONS_KEY = 'quiet-pages-post-interactions'

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

export function getPostInteraction(postId: string): PostInteraction {
  return getInteractions()[postId] ?? {}
}

export function savePostReaction(postId: string, isReacted: boolean) {
  const interactions = getInteractions()
  interactions[postId] = {
    ...interactions[postId],
    isReacted,
  }
  saveInteractions(interactions)
}

export function savePostBookmark(postId: string, isBookmarked: boolean) {
  const interactions = getInteractions()
  interactions[postId] = {
    ...interactions[postId],
    isBookmarked,
  }
  saveInteractions(interactions)
}
