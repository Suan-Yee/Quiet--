const FEED_RETURN_KEY = 'quiet-pages-feed-return'

export type FeedReturnState = {
  path: string
  scrollY: number
}

export function saveFeedReturnState(state: FeedReturnState) {
  try {
    window.sessionStorage.setItem(FEED_RETURN_KEY, JSON.stringify(state))
  } catch {
    // Navigation still works when session storage is unavailable.
  }
}

export function getFeedReturnState(): FeedReturnState | null {
  try {
    const storedState = window.sessionStorage.getItem(FEED_RETURN_KEY)

    if (!storedState) {
      return null
    }

    const parsedState = JSON.parse(storedState) as Partial<FeedReturnState>

    if (
      typeof parsedState.path !== 'string'
      || typeof parsedState.scrollY !== 'number'
      || !Number.isFinite(parsedState.scrollY)
    ) {
      return null
    }

    return {
      path: parsedState.path,
      scrollY: Math.max(0, parsedState.scrollY),
    }
  } catch {
    return null
  }
}

export function clearFeedReturnState() {
  try {
    window.sessionStorage.removeItem(FEED_RETURN_KEY)
  } catch {
    // Nothing to clear when session storage is unavailable.
  }
}
