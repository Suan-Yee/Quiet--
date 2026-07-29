import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, Heart, MessageCircle } from 'lucide-react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router'
import { buttonStyles } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import ArticleContent from '../components/post/ArticleContent'
import CommentsPanel from '../components/post/CommentsPanel'
import NormalPost from '../components/post/NormalPost'
import TiptapContentRenderer from '../components/post/TiptapContentRenderer'
import { mockArticleBlocks } from '../data/mockArticleDetails'
import { getMockComments } from '../data/mockComments'
import { mockPosts } from '../data/mockPosts'
import type { MockPost } from '../types/post'
import { scrollToCommentsSection } from '../utils/commentNavigation'
import { getLocalComments, saveLocalComment } from '../utils/localComments'
import type { CommentContent } from '../types/comment'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../utils/localInteractions'
import { getLocalPosts } from '../utils/localPosts'
import { getPostType } from '../utils/normalPost'
import { formatPostDate, formatReadTime, getPrimaryTopic } from '../utils/postDisplay'
import { getAuthorProfilePath } from '../utils/profileLinks'
import { transitionToRoute } from '../utils/routeTransition'

const actionButtonStyles =
  'inline-flex h-11 min-w-11 items-center gap-2 rounded-xl font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]'

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
          ? 'flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-1.5 shadow-xl shadow-[rgb(var(--shadow-color)/0.16)] backdrop-blur'
          : 'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2 shadow-[0_18px_45px_-38px_rgb(var(--shadow-color)/0.45)]'
      }
      role="group"
    >
      {!mobile ? (
        <p className="px-2 pb-2 pt-1 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Reader actions
        </p>
      ) : null}
      <div className={mobile ? 'flex items-center gap-1' : 'space-y-1'}>
      <button
        type="button"
        onClick={onToggleLike}
        className={`${actionButtonStyles} ${mobile ? 'px-2 text-xs' : 'w-full justify-start px-3 text-sm'} ${
          isLiked ? 'text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
        }`}
        aria-pressed={isLiked}
        aria-label={isLiked ? `Remove love from ${postTitle}` : `Love ${postTitle}`}
      >
        <Heart
          size={18}
          aria-hidden="true"
          className={isLiked ? 'fill-[var(--color-accent)]' : ''}
        />
        <span>Love</span>
        <span className={mobile ? 'text-xs tabular-nums' : 'ml-auto text-xs tabular-nums'} aria-live="polite">
          {reactionCount}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenDiscussion}
        className={`${actionButtonStyles} ${mobile ? 'px-2 text-xs' : 'w-full justify-start px-3 text-sm'} text-[var(--color-secondary)] hover:text-[var(--color-text)]`}
        aria-label={`Go to comments, ${commentCount} comments`}
        aria-controls="comments"
      >
        <MessageCircle size={18} aria-hidden="true" />
        <span>Comments</span>
        <span className={mobile ? 'text-xs tabular-nums' : 'ml-auto text-xs tabular-nums'}>
          {commentCount}
        </span>
      </button>

      <button
        type="button"
        onClick={onToggleBookmark}
        className={`${actionButtonStyles} ${mobile ? 'px-2 text-xs' : 'w-full justify-start px-3 text-sm'} ${
          isBookmarked ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
        }`}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? `Remove bookmark for ${postTitle}` : `Bookmark ${postTitle}`}
      >
        <Bookmark
          size={18}
          aria-hidden="true"
          className={isBookmarked ? 'fill-[var(--color-accent)]' : ''}
        />
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>
      </div>
    </div>
  )
}

type PostReaderProps = {
  post: MockPost
  onBackToFeed: () => void
}

function ArticleReader({ post, onBackToFeed }: PostReaderProps) {
  const [isLiked, setIsLiked] = useState(() => {
    const interaction = getPostInteraction(post.id)
    return interaction.isReacted ?? post.isReacted
  })
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const interaction = getPostInteraction(post.id)
    return interaction.isBookmarked ?? post.isBookmarked
  })
  const [localComments, setLocalComments] = useState(() => getLocalComments(post.id))

  const reactionCount =
    post.reactionCount + (isLiked && !post.isReacted ? 1 : 0) - (!isLiked && post.isReacted ? 1 : 0)
  const commentCount = post.commentCount + localComments.length
  const comments = [...localComments, ...getMockComments(post.id)]
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

  const handleOpenDiscussion = useCallback(() => {
    scrollToCommentsSection()
  }, [])
  const handleAddComment = useCallback((content: CommentContent) => {
    const comment = saveLocalComment(post.id, content)
    setLocalComments((currentComments) => [comment, ...currentComments])
  }, [post.id])
  const handleAddReply = useCallback((
    parentId: string,
    content: CommentContent,
    replyToId: string | null = null,
  ) => {
    const reply = saveLocalComment(post.id, {
      ...content,
      parentId,
      replyToId,
    })
    setLocalComments((currentComments) => [reply, ...currentComments])
  }, [post.id])

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
        <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]/72">
          <div className="mx-auto w-full max-w-[960px] px-4 py-11 text-center sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div>
              <div className="mb-8 flex justify-start">
                <button
                  type="button"
                  onClick={onBackToFeed}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 text-sm font-extrabold text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <ArrowLeft size={17} aria-hidden="true" />
                  Back to feed
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[var(--color-muted)]">
                <span className="text-[var(--color-accent)]">Article</span>
                <span aria-hidden="true">•</span>
                <span>{primaryTopic}</span>
              </div>
              <h1 className="mx-auto mt-5 max-w-[840px] break-words font-reading text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[1.01] tracking-[-0.035em] text-[var(--color-text)]">
                {post.title}
              </h1>
              <p className="mx-auto mt-5 max-w-[700px] text-base leading-7 text-[var(--color-secondary)] sm:text-lg sm:leading-8">
                {post.excerpt}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <NavLink
                  to={authorProfilePath}
                  className="group inline-flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <img
                    src={post.author.profileImage}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-border)] transition group-hover:ring-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block text-sm font-extrabold text-[var(--color-text)]">
                      {post.author.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                      {post.author.authorDescription}
                    </span>
                  </span>
                </NavLink>
                <span className="hidden h-8 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />
                <p className="text-xs font-semibold text-[var(--color-muted)] sm:text-sm">
                  <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
                  <span className="mx-2" aria-hidden="true">·</span>
                  {formatReadTime(post.readTime)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {post.coverImage ? (
          <figure className="mx-auto w-full max-w-[900px] px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
            <img
              src={post.coverImage}
              alt={`Cover image for ${post.title}`}
              className="aspect-video w-full rounded-2xl object-cover shadow-[0_24px_65px_-50px_rgb(var(--shadow-color)/0.7)] sm:rounded-3xl"
            />
          </figure>
        ) : null}

        <div className="mx-auto grid w-full max-w-[1160px] justify-center gap-8 px-4 sm:px-6 lg:grid-cols-[168px_minmax(0,720px)] lg:px-8 xl:grid-cols-[168px_minmax(0,720px)_120px] xl:gap-12">
          <aside className="hidden lg:block" aria-label="Article actions">
            <div className="sticky top-28 pt-14">
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

            <CommentsPanel
              comments={comments}
              commentCount={commentCount}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
            />

            <div className="flex justify-center pb-9 pt-5">
              <button
                type="button"
                onClick={onBackToFeed}
                className={buttonStyles('secondary', 'gap-2')}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to feed
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
    </div>
  )
}

function NormalPostReader({ post, onBackToFeed }: PostReaderProps) {
  const accessibleTitle = post.title.trim() || `Post by ${post.author.name}`

  return (
    <div className="px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-9">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToFeed}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3.5 text-sm font-extrabold text-[var(--color-text)] transition hover:bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to feed
          </button>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Post
          </span>
        </div>

        <h1 className="sr-only">{accessibleTitle}</h1>
        <NormalPost post={post} variant="detail" />
      </div>
    </div>
  )
}

function PostDetailPage() {
  const { postId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const post = [...getLocalPosts(), ...mockPosts].find((item) => String(item.id) === postId)
  const navigationState = location.state as {
    fromFeed?: boolean
    feedPath?: string
    scrollToComments?: boolean
  } | null

  useEffect(() => {
    if (!navigationState?.scrollToComments || !post) {
      return
    }

    let scrollDelayId = 0
    let firstFrameId = 0
    let secondFrameId = 0

    scrollDelayId = window.setTimeout(() => {
      firstFrameId = window.requestAnimationFrame(() => {
        secondFrameId = window.requestAnimationFrame(() => {
          scrollToCommentsSection()
        })
      })
    }, 320)

    return () => {
      window.clearTimeout(scrollDelayId)
      window.cancelAnimationFrame(firstFrameId)
      window.cancelAnimationFrame(secondFrameId)
    }
  }, [navigationState?.scrollToComments, post])

  function handleBackToFeed() {
    transitionToRoute(() => {
      if (navigationState?.fromFeed) {
        navigate(-1)
        return
      }

      navigate(navigationState?.feedPath || '/')
    })
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          eyebrow="Post not found"
          title="This post is not available"
          description="The post may have moved, or the link may be incorrect. Return to discover another path."
          action={
            <NavLink to="/" className={buttonStyles('primary')}>
              Back to discover
            </NavLink>
          }
        />
      </div>
    )
  }

  if (getPostType(post) === 'normal') {
    return (
      <NormalPostReader
        key={post.id}
        post={post}
        onBackToFeed={handleBackToFeed}
      />
    )
  }

  return <ArticleReader key={post.id} post={post} onBackToFeed={handleBackToFeed} />
}

export default PostDetailPage
