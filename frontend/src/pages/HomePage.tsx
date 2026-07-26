import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import Container from '../components/common/Container'
import EmptyState from '../components/common/EmptyState'
import NormalPost from '../components/post/NormalPost'
import { mockPosts } from '../data/mockPosts'
import { getLocalPosts } from '../utils/localPosts'

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const posts = useMemo(() => {
    const publishedPosts = [...getLocalPosts(), ...mockPosts]
      .filter((post) => post.status === 'published')
      .sort(
        (firstPost, secondPost) =>
          new Date(secondPost.createdAt).getTime() - new Date(firstPost.createdAt).getTime(),
      )

    if (!query) {
      return publishedPosts
    }

    const normalizedQuery = query.toLowerCase()

    return publishedPosts.filter((post) => {
      return [
        post.title,
        post.excerpt,
        post.contentText,
        post.author.name,
        post.author.username,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [query])

  return (
    <Container className="pb-16 pt-5 sm:pb-20 sm:pt-7">
      <section aria-label="Posts" className="mx-auto max-w-[760px] space-y-4">
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
