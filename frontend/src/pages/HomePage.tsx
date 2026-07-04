import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import Button from '../components/common/Button'
import Container from '../components/common/Container'
import EmptyState from '../components/common/EmptyState'
import FeedTabs, { type FeedTab } from '../components/home/FeedTabs'
import HeroSection from '../components/home/HeroSection'
import NewsletterCard from '../components/home/NewsletterCard'
import SuggestedAuthors from '../components/home/SuggestedAuthors'
import TopicsCard from '../components/home/TopicsCard'
import PostCard from '../components/post/PostCard'
import { mockPosts } from '../data/mockPosts'
import { getLocalPosts } from '../utils/localPosts'

const followingAuthors = ['Jon Bell', 'Priya Raman', 'Maya Chen']

function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('Latest')
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const posts = useMemo(() => {
    const allPosts = [...getLocalPosts(), ...mockPosts]
    const tabPosts = {
      Latest: allPosts,
      Following: allPosts.filter((post) => followingAuthors.includes(post.author.name)),
      Popular: [...allPosts].sort((firstPost, secondPost) => secondPost.reactionCount - firstPost.reactionCount),
    }[activeTab]

    if (!query) {
      return tabPosts
    }

    const normalizedQuery = query.toLowerCase()

    return tabPosts.filter((post) => {
      return [
        post.title,
        post.preview,
        post.category,
        post.author.name,
        post.authorDescription,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [activeTab, query])

  function clearSearch() {
    setSearchParams({})
  }

  return (
    <Container>
      <HeroSection />

      <section id="feed" className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-11">
        <div>
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-reading text-3xl font-bold text-[var(--color-text)]">
                Latest essays
              </h2>
              {query ? (
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-secondary)]">
                  <Search aria-hidden="true" size={15} />
                  Results for "{query}"
                </p>
              ) : null}
            </div>
            <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.slice(0, 7).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="No essays found"
              title="Nothing matched this view"
              description="Try a different search term or switch feed tabs to keep reading."
              action={query ? (
                <Button type="button" variant="secondary" onClick={clearSearch}>
                  Clear search
                </Button>
              ) : undefined}
            />
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <SuggestedAuthors />
            <TopicsCard />
            <NewsletterCard />
          </div>
        </aside>
      </section>
    </Container>
  )
}

export default HomePage
