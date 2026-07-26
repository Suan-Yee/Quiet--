import { useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ArrowRight, BookOpen, Compass, Layers3, PenLine } from 'lucide-react'
import { NavLink, useParams } from 'react-router'
import { buttonStyles } from '../components/common/buttonStyles'
import Container from '../components/common/Container'
import EmptyState from '../components/common/EmptyState'
import ProfileStoryRow from '../components/profile/ProfileStoryRow'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { mockPosts, topics } from '../data/mockPosts'
import type { MockPost } from '../types/post'
import { getPostInteraction } from '../utils/localInteractions'
import { getLocalDraft, getLocalPosts } from '../utils/localPosts'
import { formatReadTime, getPostPath, getPrimaryTopic } from '../utils/postDisplay'
import { getAuthorSlug } from '../utils/profileLinks'

type ProfileTab = 'posts' | 'featured' | 'drafts' | 'bookmarks'

type ProfileUser = {
  name: string
  avatar: string
  description: string
  bio: string
  topics: string[]
}

type ProfileViewProps = {
  profileUser: ProfileUser
  isOwnProfile: boolean
  publishedPosts: MockPost[]
  draftPosts: MockPost[]
  bookmarkedPosts: MockPost[]
}

const currentUserProfile: ProfileUser = {
  name: mockCurrentUser.name,
  avatar: mockCurrentUser.profileImage,
  description: mockCurrentUser.authorDescription,
  bio: mockCurrentUser.bio,
  topics: ['Writing', 'Creative practice', 'Essays', 'Routines'],
}

const fallbackDrafts: MockPost[] = [
  {
    id: 9001,
    authorId: mockCurrentUser.id,
    author: mockCurrentUser,
    postType: 'article',
    title: 'Notes on cadence before the first sentence',
    excerpt:
      'A working draft about rhythm, hesitation, and the small decisions that shape a generous opening.',
    contentText: '',
    contentJson: { type: 'doc', content: [] },
    coverImage: '',
    coverImagePublicId: '',
    status: 'draft',
    visibility: 'public',
    readTime: 3,
    isFeatured: false,
    quotePreview: 'Sometimes the beginning is not an idea. It is a tempo.',
    reactionCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    topics: [topics[0]],
    createdAt: '2026-07-04T00:00:00.000Z',
    updatedAt: '2026-07-04T00:00:00.000Z',
    isReacted: false,
    isBookmarked: false,
  },
]

function buildAuthorProfile(post: MockPost): ProfileUser {
  return {
    name: post.author.name,
    avatar: post.author.profileImage,
    description: post.author.authorDescription,
    bio: post.author.bio,
    topics: Array.from(new Set([...post.topics.map((topic) => topic.name), 'Essays', 'Notes'])),
  }
}

function draftToPost(draft: ReturnType<typeof getLocalDraft>): MockPost | null {
  if (!draft || draft.status !== 'draft') {
    return null
  }

  return {
    id: draft.id,
    authorId: draft.authorId,
    author: draft.author,
    postType: draft.postType ?? 'article',
    title: draft.title || 'Untitled draft',
    excerpt: draft.excerpt || 'No excerpt yet.',
    contentText: draft.contentText,
    contentJson: draft.contentJson,
    coverImage: draft.coverImage,
    coverImagePublicId: draft.coverImagePublicId,
    status: draft.status,
    visibility: draft.visibility,
    readTime: draft.readTime,
    reactionCount: draft.reactionCount,
    commentCount: draft.commentCount,
    bookmarkCount: draft.bookmarkCount,
    topics: draft.topics,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    isFeatured: draft.isFeatured,
    quotePreview: draft.quotePreview,
    isReacted: draft.isReacted,
    isBookmarked: draft.isBookmarked,
  }
}

function ProfileView({
  profileUser,
  isOwnProfile,
  publishedPosts,
  draftPosts,
  bookmarkedPosts,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const featuredPost = publishedPosts.find((post) => post.isFeatured)
  const spotlightPost = featuredPost ?? publishedPosts[0]
  const tabs: Array<{ id: ProfileTab; label: string; count: number }> = [
    { id: 'posts', label: 'Essays', count: publishedPosts.length },
    { id: 'featured', label: 'Pinned', count: featuredPost ? 1 : 0 },
    ...(isOwnProfile
      ? [
          { id: 'drafts' as const, label: 'Drafts', count: draftPosts.length },
          { id: 'bookmarks' as const, label: 'Saved', count: bookmarkedPosts.length },
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
      title: 'No published work yet',
      description: 'Finished essays from this writer will gather here.',
    },
    featured: {
      title: 'Nothing pinned yet',
      description: 'A starting-point essay will appear when this writer pins one.',
    },
    drafts: {
      title: 'No drafts yet',
      description: 'Drafts saved from the writing studio will appear here.',
    },
    bookmarks: {
      title: 'Your shelf is empty',
      description: 'Pieces you save for later will gather here.',
    },
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    }

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <Container className="py-8 sm:py-12">
      <section
        aria-labelledby="profile-heading"
        className="relative overflow-hidden rounded-[2rem] bg-[var(--color-brand-panel)] px-6 py-7 text-[var(--color-on-brand)] sm:px-9 sm:py-10 lg:px-12 lg:py-12"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--color-highlight)]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-highlight)]">
              {isOwnProfile ? 'Your creative desk' : 'Writer’s desk'}
            </p>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                alt={profileUser.name}
                className="h-24 w-24 shrink-0 rounded-[1.75rem] object-cover ring-1 ring-[var(--color-on-brand)]/30 sm:h-28 sm:w-28"
                src={profileUser.avatar}
              />
              <div className="min-w-0">
                <h1
                  id="profile-heading"
                  className="break-words font-reading text-5xl font-medium leading-none tracking-[-0.035em] sm:text-6xl"
                >
                  {profileUser.name}
                </h1>
                <p className="mt-3 text-sm font-bold text-[var(--color-on-brand-muted)] sm:text-base">
                  {profileUser.description}
                </p>
              </div>
            </div>
            <p className="mt-7 max-w-[700px] text-base leading-8 text-[var(--color-on-brand-muted)] sm:text-lg">
              {profileUser.bio}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {isOwnProfile ? (
                <NavLink
                  to="/create"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-highlight)] px-5 py-2.5 text-sm font-bold text-[var(--color-brand-panel)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-panel)]"
                >
                  <PenLine size={16} aria-hidden="true" />
                  Open studio
                </NavLink>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFollowing((currentValue) => !currentValue)}
                  aria-pressed={isFollowing}
                  className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-highlight)] px-5 py-2.5 text-sm font-bold text-[var(--color-brand-panel)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-panel)]"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <a
                href="#profile-posts"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-on-brand)]/25 px-5 py-2.5 text-sm font-bold text-[var(--color-on-brand)] transition hover:bg-[var(--color-on-brand)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]"
              >
                Browse work
                <ArrowRight aria-hidden="true" size={15} />
              </a>
            </div>
          </div>

          <aside className="border-t border-[var(--color-on-brand)]/15 pt-7 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <div className="flex items-center gap-3">
              <Compass size={19} className="text-[var(--color-highlight)]" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-on-brand-muted)]">
                Areas of attention
              </h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {profileUser.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-[var(--color-on-brand)]/20 bg-[var(--color-on-brand)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-on-brand)]"
                >
                  {topic}
                </span>
              ))}
            </div>
            <div className="mt-7 grid grid-cols-2 gap-5 border-t border-[var(--color-on-brand)]/15 pt-6">
              <div>
                <p className="font-reading text-3xl font-semibold">{publishedPosts.length}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-on-brand-muted)]">Finished pieces</p>
              </div>
              <div>
                <p className="font-reading text-3xl font-semibold">{profileUser.topics.length}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-on-brand-muted)]">Paths explored</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {spotlightPost ? (
        <section
          aria-labelledby="spotlight-heading"
          className="border-b border-[var(--color-border)] py-10 sm:py-12"
        >
          <NavLink
            to={getPostPath(spotlightPost)}
            className="group grid gap-7 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)] md:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] md:items-center"
          >
            <div>
              <div className="flex items-center gap-3">
                <BookOpen size={17} className="text-[var(--color-accent)]" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  {featuredPost ? 'Pinned to the desk' : 'Latest from the desk'}
                </p>
              </div>
              <h2
                id="spotlight-heading"
                className="mt-4 max-w-[700px] font-reading text-3xl font-semibold leading-tight tracking-[-0.025em] text-[var(--color-text)] transition group-hover:text-[var(--color-accent)] sm:text-4xl"
              >
                {spotlightPost.title}
              </h2>
              <p className="mt-4 max-w-[680px] text-sm leading-7 text-[var(--color-secondary)] sm:text-base">
                {spotlightPost.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--color-muted)]">
                <span>{getPrimaryTopic(spotlightPost.topics)}</span>
                <span aria-hidden="true">·</span>
                <span>{formatReadTime(spotlightPost.readTime)}</span>
                <span className="ml-1 inline-flex items-center gap-1.5 font-bold text-[var(--color-text)]">
                  Enter the essay
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </div>
            {spotlightPost.coverImage ? (
              <img
                src={spotlightPost.coverImage}
                alt=""
                className="aspect-[16/10] h-full max-h-72 w-full rounded-3xl bg-[var(--color-card-elevated)] object-cover"
              />
            ) : (
              <blockquote className="border-l-2 border-[var(--color-accent)] py-3 pl-6 font-reading text-2xl italic leading-9 text-[var(--color-secondary)]">
                “{spotlightPost.quotePreview || 'A thoughtful place to begin.'}”
              </blockquote>
            )}
          </NavLink>
        </section>
      ) : null}

      <section id="profile-posts" className="scroll-mt-24 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          <div className="min-w-0">
            <div className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Work and waypoints
                </p>
                <h2 className="mt-2 font-reading text-3xl font-semibold text-[var(--color-text)]">
                  Explore this desk
                </h2>
              </div>
              <div
                role="tablist"
                aria-label="Profile sections"
                className="theme-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1"
              >
                {tabs.map((tab, index) => {
                  const isActive = displayedTab === tab.id

                  return (
                    <button
                      ref={(element) => {
                        tabRefs.current[index] = element
                      }}
                      id={`profile-tab-${tab.id}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="profile-panel"
                      tabIndex={isActive ? 0 : -1}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                        isActive
                          ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]'
                          : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
                      }`}
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      {tab.label}
                      <span className={isActive ? 'text-[var(--color-accent)]/70' : 'text-[var(--color-muted)]'}>
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              id="profile-panel"
              role="tabpanel"
              aria-labelledby={`profile-tab-${displayedTab}`}
              tabIndex={0}
              className="mt-7 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)]"
            >
              {activePosts.length > 0 ? (
                <div>
                  {activePosts.map((post) => (
                    <ProfileStoryRow key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  description={emptyStateContent[displayedTab].description}
                  title={emptyStateContent[displayedTab].title}
                />
              )}
            </div>
          </div>

          <aside className="border-t border-[var(--color-border)] pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1">
            <div className="sticky top-24">
              <Layers3 size={19} className="text-[var(--color-accent)]" aria-hidden="true" />
              <h2 className="mt-4 font-reading text-2xl font-semibold text-[var(--color-text)]">
                A note from this desk
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-secondary)]">
                Ideas here are collected as paths rather than a feed—places to begin, return to, and connect.
              </p>
              {isOwnProfile ? (
                <p className="mt-5 border-t border-[var(--color-border)] pt-5 text-xs leading-6 text-[var(--color-muted)]">
                  Drafts and saved pieces are part of your private workspace.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </Container>
  )
}

function ProfilePage() {
  const { authorSlug } = useParams()

  const profileData = useMemo(() => {
    const localPosts = getLocalPosts()
    const allPosts = [...localPosts, ...mockPosts]
    const profileMap = new Map<string, ProfileUser>([
      [getAuthorSlug(currentUserProfile.name), currentUserProfile],
    ])

    allPosts.forEach((post) => {
      const slug = getAuthorSlug(post.author.name)

      if (!profileMap.has(slug)) {
        profileMap.set(slug, buildAuthorProfile(post))
      }
    })

    const selectedProfile = profileMap.get(authorSlug ?? getAuthorSlug(currentUserProfile.name))
    const viewingOwnProfile = selectedProfile?.name === currentUserProfile.name
    const userPosts = selectedProfile
      ? allPosts.filter(
          (post) => post.author.name === selectedProfile.name && post.status === 'published',
        )
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

  if (!profileData.profileUser) {
    return (
      <Container className="py-12">
        <EmptyState
          eyebrow="Writer not found"
          title="This profile is not available"
          description="The writer may have moved, or the profile link may be incorrect. Return to discover more work."
          action={
            <NavLink to="/" className={buttonStyles('primary')}>
              Back to discover
            </NavLink>
          }
        />
      </Container>
    )
  }

  return (
    <ProfileView
      key={profileData.profileUser.name}
      profileUser={profileData.profileUser}
      isOwnProfile={profileData.isOwnProfile}
      publishedPosts={profileData.publishedPosts}
      draftPosts={profileData.draftPosts}
      bookmarkedPosts={profileData.bookmarkedPosts}
    />
  )
}

export default ProfilePage
