import { useCallback, useState } from 'react'
import { ArrowRight, Bookmark, Heart, MessageCircle } from 'lucide-react'
import { NavLink, useParams } from 'react-router'
import { buttonStyles } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import ArticleContent from '../components/post/ArticleContent'
import CommentsPanel, { type CommentItem } from '../components/post/CommentsPanel'
import TiptapContentRenderer from '../components/post/TiptapContentRenderer'
import { mockArticleBlocks } from '../data/mockArticleDetails'
import { mockPosts } from '../data/mockPosts'
import type { MockPost } from '../types/post'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../utils/localInteractions'
import { getLocalPosts } from '../utils/localPosts'
import { formatPostDate, formatReadTime, getPrimaryTopic } from '../utils/postDisplay'
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

const actionButtonStyles =
  'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]'

type ReaderActionDockProps = {
  isLiked: boolean
  isBookmarked: boolean
  reactionCount: number
  commentCount: number
  postTitle: string
  onToggleLike: () => void
  onToggleBookmark: () => void
  onOpenDiscussion: () => void
  mobile?: boolean
}

function ReaderActionDock({
  isLiked,
  isBookmarked,
  reactionCount,
  commentCount,
  postTitle,
  onToggleLike,
  onToggleBookmark,
  onOpenDiscussion,
  mobile = false,
}: ReaderActionDockProps) {
  return (
    <div
      aria-label="Article actions"
      className={
        mobile
          ? 'flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/95 p-1.5 shadow-xl shadow-[rgb(var(--shadow-color)/0.16)] backdrop-blur'
          : 'flex flex-col items-stretch gap-2'
      }
      role="group"
    >
      <button
        type="button"
        onClick={onToggleLike}
        className={`${actionButtonStyles} ${
          mobile ? 'px-3' : 'flex-col px-2 py-2'
        } ${isLiked ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'}`}
        aria-pressed={isLiked}
        aria-label={isLiked ? `Remove love from ${postTitle}` : `Love ${postTitle}`}
      >
        <Heart
          size={18}
          aria-hidden="true"
          className={isLiked ? 'fill-[var(--color-accent)]' : ''}
        />
        <span className={mobile ? '' : 'text-[0.6875rem]'} aria-live="polite">
          {reactionCount}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenDiscussion}
        className={`${actionButtonStyles} ${
          mobile ? 'px-3' : 'flex-col px-2 py-2'
        } text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]`}
        aria-label={`Open comments, ${commentCount} comments`}
        aria-haspopup="dialog"
      >
        <MessageCircle size={18} aria-hidden="true" />
        <span className={mobile ? '' : 'text-[0.6875rem]'}>{commentCount}</span>
      </button>

      <button
        type="button"
        onClick={onToggleBookmark}
        className={`${actionButtonStyles} ${
          mobile ? 'px-3' : 'flex-col px-2 py-2'
        } ${isBookmarked ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'}`}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? `Remove bookmark for ${postTitle}` : `Bookmark ${postTitle}`}
      >
        <Bookmark
          size={18}
          aria-hidden="true"
          className={isBookmarked ? 'fill-[var(--color-accent)]' : ''}
        />
        <span className={mobile ? 'sr-only' : 'text-[0.6875rem]'}>Save</span>
      </button>
    </div>
  )
}

function PostReader({ post }: { post: MockPost }) {
  const [isLiked, setIsLiked] = useState(() => {
    const interaction = getPostInteraction(post.id)
    return interaction.isReacted ?? post.isReacted
  })
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const interaction = getPostInteraction(post.id)
    return interaction.isBookmarked ?? post.isBookmarked
  })
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>(mockComments)

  const reactionCount =
    post.reactionCount + (isLiked && !post.isReacted ? 1 : 0) - (!isLiked && post.isReacted ? 1 : 0)
  const localCommentCount = comments.length - mockComments.length
  const commentCount = post.commentCount + localCommentCount
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const primaryTopic = getPrimaryTopic(post.topics)
  const hasRichContent = Boolean(post.contentJson?.content?.length)

  const handleToggleLike = useCallback(() => {
    setIsLiked((currentValue) => {
      const nextValue = !currentValue
      savePostReaction(post.id, nextValue)
      return nextValue
    })
  }, [post.id])

  const handleToggleBookmark = useCallback(() => {
    setIsBookmarked((currentValue) => {
      const nextValue = !currentValue
      savePostBookmark(post.id, nextValue)
      return nextValue
    })
  }, [post.id])

  const handleOpenDiscussion = useCallback(() => setIsCommentsOpen(true), [])
  const handleCloseDiscussion = useCallback(() => setIsCommentsOpen(false), [])
  const handleAddComment = useCallback((body: string) => {
    setComments((currentComments) => [
      {
        id: `local-comment-${Date.now()}`,
        author: 'You',
        initials: 'YO',
        body,
        time: 'Just now',
        replies: [],
      },
      ...currentComments,
    ])
  }, [])

  const actionDockProps = {
    isLiked,
    isBookmarked,
    reactionCount,
    commentCount,
    postTitle: post.title,
    onToggleLike: handleToggleLike,
    onToggleBookmark: handleToggleBookmark,
    onOpenDiscussion: handleOpenDiscussion,
  }

  return (
    <div className="pb-28 lg:pb-20">
      <article>
        <header className="relative overflow-hidden border-b border-[var(--color-border-soft)] bg-[var(--color-brand-panel)] text-[var(--color-on-brand)]">
          <div
            className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full bg-[var(--color-highlight)]/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-48 left-[8%] h-96 w-96 rounded-full bg-[var(--color-on-brand)]/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
            <div className="max-w-[930px]">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-on-brand-muted)]">
                <span className="text-[var(--color-highlight)]">Essay</span>
                <span aria-hidden="true">•</span>
                <span>{primaryTopic}</span>
              </div>
              <h1 className="mt-6 max-w-[900px] break-words font-reading text-[clamp(2.75rem,7vw,6.25rem)] font-medium leading-[0.98] tracking-[-0.04em]">
                {post.title}
              </h1>
              <p className="mt-7 max-w-[760px] text-lg leading-8 text-[var(--color-on-brand-muted)] sm:text-xl sm:leading-9">
                {post.excerpt}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[var(--color-on-brand)]/15 pt-6">
                <NavLink
                  to={authorProfilePath}
                  className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-brand-panel)]"
                >
                  <img
                    src={post.author.profileImage}
                    alt=""
                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[var(--color-on-brand)]/25 transition group-hover:ring-[var(--color-highlight)]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-[var(--color-on-brand)]">
                      {post.author.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-on-brand-muted)]">
                      {post.author.authorDescription}
                    </span>
                  </span>
                </NavLink>
                <span className="hidden h-8 w-px bg-[var(--color-on-brand)]/15 sm:block" aria-hidden="true" />
                <p className="text-sm text-[var(--color-on-brand-muted)]">
                  <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
                  <span className="mx-2" aria-hidden="true">·</span>
                  {formatReadTime(post.readTime)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {post.coverImage ? (
          <figure className="mx-auto -mt-px w-full max-w-[1280px] px-0 sm:px-6 lg:px-8">
            <img
              src={post.coverImage}
              alt={`Cover image for ${post.title}`}
              className="aspect-[16/8] max-h-[620px] w-full bg-[var(--color-card-elevated)] object-cover sm:rounded-b-[2rem]"
            />
          </figure>
        ) : null}

        <div className="mx-auto grid w-full max-w-[1100px] justify-center gap-8 px-4 sm:px-6 lg:grid-cols-[120px_minmax(0,720px)] lg:px-8 xl:grid-cols-[120px_minmax(0,720px)_120px] xl:gap-12">
          <aside className="hidden lg:block" aria-label="Article actions">
            <div className="sticky top-28 pt-14">
              <p className="mb-4 text-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Keep close
              </p>
              <ReaderActionDock {...actionDockProps} />
            </div>
          </aside>

          <div className="min-w-0">
            <section aria-label="Article content">
              {hasRichContent ? (
                <TiptapContentRenderer content={post.contentJson} />
              ) : (
                <ArticleContent blocks={mockArticleBlocks} />
              )}
            </section>

            <footer className="border-y border-[var(--color-border)] py-9 sm:py-11">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={post.author.profileImage}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-[var(--color-border)]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Written by
                    </p>
                    <h2 className="mt-1 truncate font-reading text-2xl font-semibold text-[var(--color-text)]">
                      {post.author.name}
                    </h2>
                  </div>
                </div>
                <NavLink to={authorProfilePath} className={buttonStyles('secondary', 'shrink-0 gap-2')}>
                  Visit their desk
                  <ArrowRight size={16} aria-hidden="true" />
                </NavLink>
              </div>
              <p className="mt-5 max-w-[620px] text-sm leading-7 text-[var(--color-secondary)]">
                {post.author.bio || post.author.authorDescription}
              </p>
            </footer>

            <div className="py-10 text-center">
              <p className="font-reading text-2xl font-semibold text-[var(--color-text)]">
                What stayed with you?
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-secondary)]">
                Continue the piece in a thoughtful conversation with other readers.
              </p>
              <button
                type="button"
                onClick={handleOpenDiscussion}
                className={buttonStyles('primary', 'mt-5 gap-2')}
                aria-haspopup="dialog"
              >
                Open the reading circle
                <MessageCircle size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="hidden xl:block" aria-label="Article topics">
            <div className="sticky top-28 pt-14">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Along this path
              </p>
              <ul className="mt-4 space-y-3 border-l border-[var(--color-border)] pl-4 text-xs font-semibold leading-5 text-[var(--color-secondary)]">
                {post.topics.map((topic) => (
                  <li key={topic.id}>{topic.name}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <ReaderActionDock {...actionDockProps} mobile />
      </div>

      {isCommentsOpen ? (
        <CommentsPanel
          comments={comments}
          commentCount={commentCount}
          onClose={handleCloseDiscussion}
          onAddComment={handleAddComment}
        />
      ) : null}
    </div>
  )
}

function PostDetailPage() {
  const { postId } = useParams()
  const post = [...getLocalPosts(), ...mockPosts].find((item) => String(item.id) === postId)

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          eyebrow="Post not found"
          title="This post is not available"
          description="The article may have moved, or the link may be incorrect. Return to discover another path."
          action={
            <NavLink to="/" className={buttonStyles('primary')}>
              Back to discover
            </NavLink>
          }
        />
      </div>
    )
  }

  return <PostReader key={post.id} post={post} />
}

export default PostDetailPage
