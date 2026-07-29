import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { ArrowDown, Sparkles } from 'lucide-react'
import { useLocation, useSearchParams } from 'react-router'
import Container from '../components/common/Container'
import EmptyState from '../components/common/EmptyState'
import NormalPost from '../components/post/NormalPost'
import { mockPosts } from '../data/mockPosts'
import type { MockPost } from '../types/post'
import { clearFeedReturnState, getFeedReturnState } from '../utils/feedReturn'
import {
  getLocalPosts,
  LOCAL_POSTS_CHANGED_EVENT,
  LOCAL_POSTS_KEY,
} from '../utils/localPosts'

let activeFeedSnapshot: MockPost[] | null = null

function getPublishedPosts() {
  return [...getLocalPosts(), ...mockPosts]
    .filter((post) => post.status === 'published')
    .sort(
      (firstPost, secondPost) =>
        new Date(secondPost.createdAt).getTime() - new Date(firstPost.createdAt).getTime(),
    )
}

function getFeedSnapshot() {
  if (!activeFeedSnapshot) {
    activeFeedSnapshot = getPublishedPosts()
  }

  return activeFeedSnapshot
}

function getNewPostCount(snapshot: MockPost[]) {
  const snapshotIds = new Set(snapshot.map((post) => post.id))

  return getPublishedPosts().filter((post) => !snapshotIds.has(post.id)).length
}

function HomePage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [feedPosts, setFeedPosts] = useState(getFeedSnapshot)
  const [newPostCount, setNewPostCount] = useState(() => getNewPostCount(feedPosts))
  const query = searchParams.get('q')?.trim() ?? ''
  const feedPath = `${location.pathname}${location.search}`

  const posts = useMemo(() => {
    if (!query) {
      return feedPosts
    }

    const normalizedQuery = query.toLowerCase()

    return feedPosts.filter((post) => {
      return [
        post.title,
        post.excerpt,
        post.contentText,
        post.author.name,
        post.author.username,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [feedPosts, query])

  useEffect(() => {
    function checkForNewPosts() {
      setNewPostCount(getNewPostCount(feedPosts))
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === LOCAL_POSTS_KEY) {
        checkForNewPosts()
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkForNewPosts()
      }
    }

    window.addEventListener(LOCAL_POSTS_CHANGED_EVENT, checkForNewPosts)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', checkForNewPosts)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener(LOCAL_POSTS_CHANGED_EVENT, checkForNewPosts)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', checkForNewPosts)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [feedPosts])

  useLayoutEffect(() => {
    const returnState = getFeedReturnState()

    if (!returnState) {
      window.history.scrollRestoration = 'auto'
      return
    }

    if (returnState.path !== feedPath) {
      clearFeedReturnState()
      window.history.scrollRestoration = 'auto'
      return
    }

    let isCancelled = false
    let firstFrameId = 0
    let secondFrameId = 0

    void document.fonts.ready.then(() => {
      if (isCancelled) {
        return
      }

      firstFrameId = window.requestAnimationFrame(() => {
        secondFrameId = window.requestAnimationFrame(() => {
          window.scrollTo({
            top: returnState.scrollY,
            behavior: 'auto',
          })
          clearFeedReturnState()
          window.history.scrollRestoration = 'auto'
        })
      })
    })

    return () => {
      isCancelled = true
      window.cancelAnimationFrame(firstFrameId)
      window.cancelAnimationFrame(secondFrameId)
    }
  }, [feedPath, posts.length])

  function handleShowNewPosts() {
    const nextFeed = getPublishedPosts()
    activeFeedSnapshot = nextFeed
    setFeedPosts(nextFeed)
    setNewPostCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container className="pb-16 pt-5 sm:pb-20 sm:pt-7">
      {newPostCount > 0 ? (
        <div
          className="fixed left-1/2 top-[5.5rem] z-40 -translate-x-1/2 px-4"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={handleShowNewPosts}
            className="inline-flex min-h-11 whitespace-nowrap items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-brand-panel)] px-4 text-sm font-extrabold text-[var(--color-on-brand)] shadow-xl shadow-[rgb(var(--shadow-color)/0.18)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            <Sparkles size={15} aria-hidden="true" className="text-[var(--color-highlight)]" />
            {newPostCount} new {newPostCount === 1 ? 'post' : 'posts'}
            <ArrowDown size={15} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <section aria-label="Posts" className="mx-auto max-w-[680px] space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => <NormalPost key={post.id} post={post} />)
        ) : (
          <EmptyState
            eyebrow="No posts found"
            title="Nothing matched this search"
            description="Try another phrase or return to the full post feed."
            action={
              query ? (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="min-h-11 rounded-xl bg-[var(--color-brand-panel)] px-4 text-sm font-bold text-[var(--color-on-brand)] transition hover:opacity-90"
                >
                  Clear search
                </button>
              ) : null
            }
          />
        )}
      </section>
    </Container>
  )
}

export default HomePage
