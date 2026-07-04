import { useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router'
import {
  ArrowRight,
  CalendarDays,
  Mail,
  PenLine,
  Users,
} from 'lucide-react'
import { buttonStyles } from '../components/common/Button'
import Container from '../components/common/Container'
import EmptyState from '../components/common/EmptyState'
import PostCard from '../components/post/PostCard'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { mockPosts, type MockPost } from '../data/mockPosts'
import { getPostInteraction } from '../utils/localInteractions'
import { getLocalDraft, getLocalPosts } from '../utils/localPosts'
import { getAuthorSlug } from '../utils/profileLinks'

type ProfileTab = 'posts' | 'featured' | 'drafts' | 'bookmarks'

type ProfileUser = {
  name: string
  avatar: string
  description: string
  bio: string
  topics: string[]
  subscribers: string
  following: number
  cadence: string
  joined: string
}

const currentUserProfile: ProfileUser = {
  ...mockCurrentUser,
  bio: 'I write about the quiet systems, humane constraints, and daily rituals that help independent writers keep returning to the page.',
  topics: ['Writing', 'Creative practice', 'Essays', 'Routines'],
  subscribers: '12.8K',
  following: 48,
  cadence: 'Weekly essays',
  joined: 'Joined 2024',
}

const fallbackDrafts: MockPost[] = [
  {
    id: 'draft-notes-on-cadence',
    title: 'Notes on cadence before the first sentence',
    preview:
      'A working draft about rhythm, hesitation, and the small decisions that shape a generous opening.',
    category: 'Writing',
    authorDescription: mockCurrentUser.description,
    author: mockCurrentUser,
    date: 'Draft',
    readTime: '3 min read',
    isFeatured: false,
    quotePreview: 'Sometimes the beginning is not an idea. It is a tempo.',
    reactionCount: 0,
    commentCount: 0,
    isReacted: false,
    isBookmarked: false,
    reactions: 0,
    comments: 0,
  },
]

function buildAuthorProfile(post: MockPost, index: number): ProfileUser {
  return {
    name: post.author.name,
    avatar: post.author.avatar,
    description: post.authorDescription,
    bio: `${post.authorDescription}. ${post.author.name} writes calm essays for readers who like useful ideas, careful details, and a little room to think.`,
    topics: [post.category, 'Essays', 'Notes'],
    subscribers: `${(4.8 + index * 1.7).toFixed(1)}K`,
    following: 18 + index * 7,
    cadence: index % 2 === 0 ? 'Weekly essays' : 'Monthly notes',
    joined: `Joined ${2022 + (index % 3)}`,
  }
}

function draftToPost(draft: ReturnType<typeof getLocalDraft>): MockPost | null {
  if (!draft || draft.status !== 'Draft') {
    return null
  }

  return {
    id: draft.id,
    title: draft.title || 'Untitled draft',
    preview: draft.excerpt || 'No excerpt yet.',
    category: draft.category,
    authorDescription: draft.author.description,
    author: {
      name: draft.author.name,
      avatar: draft.author.avatar,
    },
    date: 'Draft',
    readTime: draft.readTime,
    image: draft.coverImage || undefined,
    isFeatured: draft.isFeatured,
    quotePreview: draft.quotePreview || undefined,
    reactionCount: draft.reactionCount,
    commentCount: draft.commentCount,
    isReacted: draft.isReacted,
    isBookmarked: draft.isBookmarked,
    content: draft.content,
    reactions: draft.reactionCount,
    comments: draft.commentCount,
  }
}

function ProfilePage() {
  const { authorSlug } = useParams()
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')

  const { profileUser, isOwnProfile, publishedPosts, draftPosts, bookmarkedPosts } = useMemo(() => {
    const localPosts = getLocalPosts()
    const allPosts = [...localPosts, ...mockPosts]
    const profileMap = new Map<string, ProfileUser>([
      [getAuthorSlug(currentUserProfile.name), currentUserProfile],
    ])

    allPosts.forEach((post, index) => {
      const slug = getAuthorSlug(post.author.name)

      if (!profileMap.has(slug)) {
        profileMap.set(slug, buildAuthorProfile(post, index))
      }
    })

    const selectedProfile = profileMap.get(authorSlug ?? getAuthorSlug(currentUserProfile.name))
    const viewingOwnProfile = selectedProfile?.name === currentUserProfile.name
    const userPosts = selectedProfile
      ? allPosts.filter((post) => post.author.name === selectedProfile.name)
      : []
    const localDraft = draftToPost(getLocalDraft())

    return {
      profileUser: selectedProfile,
      isOwnProfile: viewingOwnProfile,
      publishedPosts: userPosts,
      draftPosts: viewingOwnProfile ? (localDraft ? [localDraft, ...fallbackDrafts] : fallbackDrafts) : [],
      bookmarkedPosts: viewingOwnProfile
        ? allPosts.filter((post) => getPostInteraction(post.id).isBookmarked ?? post.isBookmarked)
        : [],
    }
  }, [authorSlug])

  if (!profileUser) {
    return (
      <Container className="py-12">
        <EmptyState
          eyebrow="Writer not found"
          title="This profile is not available"
          description="The writer may have moved, or the profile link may be incorrect. Return to the feed to discover more essays."
          action={
            <NavLink to="/" className={buttonStyles('primary')}>
              Back to feed
            </NavLink>
          }
        />
      </Container>
    )
  }

  const featuredPost = publishedPosts.find((post) => post.isFeatured) ?? publishedPosts[0]
  const tabs: Array<{ id: ProfileTab; label: string; count?: number }> = [
    { id: 'posts', label: 'Posts', count: publishedPosts.length },
    { id: 'featured', label: 'Featured', count: featuredPost ? 1 : 0 },
    ...(isOwnProfile
      ? [
          { id: 'drafts' as const, label: 'Drafts', count: draftPosts.length },
          { id: 'bookmarks' as const, label: 'Bookmarks', count: bookmarkedPosts.length },
        ]
      : []),
  ]
  const displayedTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : 'posts'
  const activePosts = {
    posts: publishedPosts,
    featured: featuredPost ? [featuredPost] : [],
    drafts: draftPosts,
    bookmarks: bookmarkedPosts,
  }[displayedTab]

  const emptyStateContent = {
    posts: {
      title: 'No published posts yet',
      description: 'Published essays from this writer will appear here.',
    },
    featured: {
      title: 'No featured essay yet',
      description: 'A start-here essay will appear once this writer marks a post as featured.',
    },
    drafts: {
      title: 'No drafts yet',
      description: 'Drafts you save locally from the writing studio will appear here.',
    },
    bookmarks: {
      title: 'No bookmarks yet',
      description: 'Saved essays and ideas will be collected here for later reading.',
    },
  }

  return (
    <Container className="py-8 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/92 p-6 shadow-sm shadow-[#1F2933]/5 backdrop-blur dark:shadow-black/10 sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#FFF1E8]/55 blur-3xl dark:bg-[#3A2116]/55" aria-hidden="true" />
        <div className="absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-[#FF6719]/[0.06] blur-3xl dark:bg-[#FF7A2F]/[0.08]" aria-hidden="true" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <img
                alt={profileUser.name}
                className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-lg shadow-[#1F2933]/12 ring-1 ring-[#E8E1D8] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:ring-[#F3C8B0] sm:h-32 sm:w-32"
                src={profileUser.avatar}
              />
              <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Writer profile
                </p>
                <h1 className="mt-2 font-reading text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-6xl">
                  {profileUser.name}
                </h1>
                <p className="mt-3 text-sm font-semibold text-[#FF6719]">
                  {profileUser.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isOwnProfile ? (
                <NavLink to="/create" className={buttonStyles('secondary', 'gap-2 px-5')}>
                  <PenLine aria-hidden="true" size={16} />
                  Edit profile
                </NavLink>
              ) : (
                <button className={buttonStyles('primary', 'px-5')} type="button">
                  Subscribe
                </button>
              )}
              <a
                className={buttonStyles('ghost', 'gap-2 px-4')}
                href={featuredPost ? `#post-${featuredPost.id}` : '#profile-posts'}
              >
                View posts
                <ArrowRight aria-hidden="true" size={15} />
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div>
              <p className="max-w-3xl text-base leading-8 text-[var(--color-secondary)] sm:text-lg">
                {profileUser.bio}
              </p>
              {/* <div className="mt-5 flex flex-wrap gap-2">
                {profileUser.topics.map((topic) => (
                  <span
                    className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/45"
                    key={topic}
                  >
                    {topic}
                  </span>
                ))}
              </div> */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-card-elevated)]/78 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)]">
                  <CalendarDays aria-hidden="true" className="text-[#FF6719]" size={18} />
                  <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{profileUser.cadence}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">Writing cadence</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-card-elevated)]/78 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)]">
                  <Users aria-hidden="true" className="text-[#FF6719]" size={18} />
                  <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{profileUser.joined}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">Publication history</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ['Essays', publishedPosts.length],
                ['Readers', profileUser.subscribers],
                ['Following', profileUser.following],
              ].map(([label, value]) => (
                <div
                  className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-card-elevated)]/78 px-4 py-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] hover:shadow-sm hover:shadow-[#1F2933]/5 dark:hover:shadow-black/10"
                  key={label}
                >
                  <p className="font-reading text-2xl font-bold text-[var(--color-text)]">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* {featuredPost ? (
        <NavLink
          id={`post-${featuredPost.id}`}
          to={`/posts/${featuredPost.id}`}
          className="group mt-8 block rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-6 shadow-sm shadow-[#1F2933]/5 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] hover:shadow-md hover:shadow-[#1F2933]/8 dark:shadow-black/10 dark:hover:shadow-black/20 sm:p-7"
        >
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6719]">
                Start here
              </p>
              <h2 className="mt-3 font-reading text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl">
                {featuredPost.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-secondary)]">
                {featuredPost.preview}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--color-secondary)]">
                <span className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-3 py-1 text-[var(--color-text)]">
                  {featuredPost.category}
                </span>
                <span>{featuredPost.readTime}</span>
                <span className="inline-flex items-center gap-1 text-[var(--color-text)] transition group-hover:text-[var(--color-accent)]">
                  Read essay
                  <ArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    size={14}
                  />
                </span>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] p-5 md:block">
              <Sparkles aria-hidden="true" className="text-[#FF6719]" size={20} />
              <p className="mt-4 font-reading text-lg italic leading-7 text-[var(--color-text)]">
                {featuredPost.quotePreview ?? 'A useful place to begin reading this writer.'}
              </p>
            </div>
          </div>
        </NavLink>
      ) : null} */}

      <section id="profile-posts" className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main>
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/82 p-2 shadow-sm shadow-[#1F2933]/5 backdrop-blur dark:shadow-black/10">
            {tabs.map((tab) => {
              const isActive = displayedTab === tab.id

              return (
                <button
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
                    isActive
                      ? 'bg-[#FF6719] text-white shadow-sm shadow-[#FF6719]/20'
                      : 'text-[var(--color-secondary)] hover:-translate-y-0.5 hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]'
                  }`}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {typeof tab.count === 'number' ? (
                    <span className={isActive ? 'ml-2 text-white/80' : 'ml-2 text-[#A8A29A]'}>
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {activePosts.length > 0 ? (
            <div className="space-y-6">
              {activePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              description={emptyStateContent[displayedTab as keyof typeof emptyStateContent]?.description}
              title={emptyStateContent[displayedTab as keyof typeof emptyStateContent]?.title ?? 'Nothing here yet'}
            />
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/86 p-5 shadow-sm shadow-[#1F2933]/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] dark:shadow-black/10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1E8] text-[#FF6719]">
                  <Mail aria-hidden="true" size={18} />
                </span>
                <div>
                  <h2 className="font-semibold text-[var(--color-text)]">Publication note</h2>
                  <p className="text-xs font-medium text-[var(--color-muted)]">{profileUser.cadence}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--color-secondary)]">
                New pieces arrive with a quiet focus on craft, attention, and sustainable writing.
              </p>
              <div className="mt-5 border-t border-[var(--color-border-soft)] pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Topics
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profileUser.topics.map((topic) => (
                    <span
                      className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/45"
                      key={topic}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </Container>
  )
}

export default ProfilePage
