import { useEffect, useState } from 'react'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import { NavLink, useParams } from 'react-router'
import { buttonStyles } from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ArticleContent from '../components/post/ArticleContent'
import CommentsPanel, { type CommentItem } from '../components/post/CommentsPanel'
import TiptapContentRenderer from '../components/post/TiptapContentRenderer'
import { mockArticleBlocks } from '../data/mockArticleDetails'
import { mockPosts } from '../data/mockPosts'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../utils/localInteractions'
import { getLocalPosts } from '../utils/localPosts'
import { getAuthorProfilePath } from '../utils/profileLinks'

const mockComments: CommentItem[] = [
  {
    id: 'comment-1',
    author: 'Nora Vale',
    initials: 'NV',
    body: 'This lands gently. The distinction between discipline and repeatable attention feels especially useful.',
    time: '2 hours ago',
    replies: [
      {
        id: 'comment-1-reply-1',
        author: 'Maya Chen',
        initials: 'MC',
        body: 'Exactly. I keep coming back to systems that make the next sentence less dramatic.',
        time: '1 hour ago',
      },
    ],
  },
  {
    id: 'comment-2',
    author: 'Theo Grant',
    initials: 'TG',
    body: 'The idea of protecting the emotional weather around the work is one I want to borrow.',
    time: '45 minutes ago',
    replies: [],
  },
]

function PostDetailPage() {
  const { postId } = useParams()
  const post = [...getLocalPosts(), ...mockPosts].find((item) => item.id === postId)
  const interaction = post ? getPostInteraction(post.id) : {}
  const [isLiked, setIsLiked] = useState(interaction.isReacted ?? post?.isReacted ?? false)
  const [isBookmarked, setIsBookmarked] = useState(interaction.isBookmarked ?? post?.isBookmarked ?? false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  useEffect(() => {
    if (!post) {
      return
    }

    const nextInteraction = getPostInteraction(post.id)
    setIsLiked(nextInteraction.isReacted ?? post.isReacted)
    setIsBookmarked(nextInteraction.isBookmarked ?? post.isBookmarked)
  }, [post?.id])

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          eyebrow="Post not found"
          title="This post is not available"
          description="The article may have moved, or the link may be incorrect. Return to the feed to keep reading."
          action={
            <NavLink to="/" className={buttonStyles('primary')}>
              Back to feed
            </NavLink>
          }
        />
      </div>
    )
  }

  const reactionCount =
    post.reactions + (isLiked && !post.isReacted ? 1 : 0) - (!isLiked && post.isReacted ? 1 : 0)
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const desktopGridColumns = isCommentsOpen
    ? 'xl:grid-cols-[200px_minmax(0,820px)_380px]'
    : 'xl:grid-cols-[200px_820px_72px]'

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className={`grid justify-center gap-8 transition-all duration-300 ${desktopGridColumns} 2xl:gap-10`}>
        <aside className="hidden xl:block">
          <div className="sticky top-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/80 p-4 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Reading
            </p>
            <div className="mt-4 flex items-center gap-3">
              <NavLink to={authorProfilePath} aria-label={`View ${post.author.name}'s profile`}>
                <img
                  src={post.author.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)]"
                />
              </NavLink>
              <div className="min-w-0">
                <NavLink
                  to={authorProfilePath}
                  className="block truncate text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
                >
                  {post.author.name}
                </NavLink>
                <p className="text-xs font-medium text-[var(--color-muted)]">{post.readTime}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-xs font-medium text-[var(--color-secondary)]">
              <p>{post.date}</p>
              <p>{reactionCount} reactions</p>
              <p>{post.comments} responses</p>
            </div>
            <NavLink
              to={authorProfilePath}
              className={buttonStyles('secondary', 'mt-5 w-full px-3 text-xs')}
            >
              View profile
            </NavLink>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {post.category}
            </p>
            <h1 className="mt-4 font-reading text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--color-secondary)]">{post.preview}</p>

            <div className="mt-7 grid gap-5 border-t border-[var(--color-border)] pt-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
              <div className="flex items-center gap-3">
                <NavLink to={authorProfilePath} aria-label={`View ${post.author.name}'s profile`}>
                  <img
                    src={post.author.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)]"
                  />
                </NavLink>
                <div>
                  <NavLink
                    to={authorProfilePath}
                    className="text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
                  >
                    {post.author.name}
                  </NavLink>
                  <p className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
                    {post.date} - {post.readTime}
                  </p>
                </div>
              </div>

              {post.image ? (
                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] sm:h-28 sm:w-[180px]">
                  <img
                    src={post.image}
                    alt=""
                    className="h-40 w-full object-cover sm:h-full sm:w-full"
                  />
                </div>
              ) : null}
            </div>
          </header>

          <div className="rounded-b-3xl border-x border-b border-[var(--color-border)] bg-[var(--color-card)] px-6 pb-2 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10 sm:px-8">
            {post.content ? (
              <TiptapContentRenderer content={post.content} />
            ) : (
              <ArticleContent blocks={mockArticleBlocks} />
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm font-medium text-[var(--color-secondary)] shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLiked((currentValue) => {
                  const nextValue = !currentValue
                  savePostReaction(post.id, nextValue)
                  return nextValue
                })}
                className={`inline-flex h-9 items-center gap-2 rounded-full px-3 transition hover:bg-[#FFF1E8] ${
                  isLiked ? 'text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
                }`}
                aria-pressed={isLiked}
                aria-label={isLiked ? `Unlike ${post.title}` : `Like ${post.title}`}
              >
                <Heart
                  size={17}
                  aria-hidden="true"
                  className={isLiked ? 'fill-[#FF6719]' : ''}
                />
                <span>{reactionCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-full px-3 transition hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]"
                aria-label="Open comments"
              >
                <MessageCircle size={17} aria-hidden="true" />
                {post.comments}
              </button>

              <button
                type="button"
                onClick={() => setIsBookmarked((currentValue) => {
                  const nextValue = !currentValue
                  savePostBookmark(post.id, nextValue)
                  return nextValue
                })}
                className={`inline-flex h-9 items-center justify-center rounded-full px-3 transition hover:bg-[#FFF1E8] ${
                  isBookmarked ? 'text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
                }`}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? `Remove bookmark for ${post.title}` : `Bookmark ${post.title}`}
              >
                <Bookmark
                  size={17}
                  aria-hidden="true"
                  className={isBookmarked ? 'fill-[#FF6719]' : ''}
                />
              </button>
            </div>

            {!isCommentsOpen ? (
              <span className="hidden text-xs font-medium text-[var(--color-muted)] xl:inline">
                Comments hidden
              </span>
            ) : null}
          </div>

          <section className="mt-8 xl:hidden">
            <CommentsPanel comments={mockComments} responseCount={post.comments} />
          </section>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-28">
            {isCommentsOpen ? (
              <CommentsPanel
                comments={mockComments}
                responseCount={post.comments}
                isCloseable
                onClose={() => setIsCommentsOpen(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-card)] text-[var(--color-accent)] shadow-lg shadow-[#1F2933]/10 transition duration-200 hover:-translate-y-1 hover:bg-[var(--color-soft-accent)] hover:shadow-xl hover:shadow-[#FF6719]/20 dark:shadow-black/20"
                aria-label={`Open comments, ${post.comments} responses`}
              >
                <MessageCircle size={22} aria-hidden="true" />
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PostDetailPage
