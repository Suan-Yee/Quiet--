import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import {
  ArrowUpRight,
  BookOpenText,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { getMockComments } from '../../data/mockComments'
import type { MockPost, PostMedia, PostMediaLayout } from '../../types/post'
import { scrollToCommentsSection } from '../../utils/commentNavigation'
import { getLocalComments, saveLocalComment } from '../../utils/localComments'
import type { CommentContent } from '../../types/comment'
import {
  getPostInteraction,
  savePostBookmark,
  savePostReaction,
  savePostRepost,
} from '../../utils/localInteractions'
import {
  getPostBody,
  getPostMedia,
  getPostType,
  isPostEdited,
  shouldCollapsePostBody,
} from '../../utils/normalPost'
import {
  getEffectivePostMediaLayout,
  getPostMediaGridClass,
  getPostMediaTileClass,
} from '../../utils/postMediaLayout'
import {
  formatPostDate,
  formatReadTime,
  getPostPath,
  getPrimaryTopic,
} from '../../utils/postDisplay'
import { saveFeedReturnState } from '../../utils/feedReturn'
import { getAuthorProfilePath } from '../../utils/profileLinks'
import { transitionToRoute } from '../../utils/routeTransition'
import CommentsPanel from './CommentsPanel'
import PostMediaFrameImage from './PostMediaFrameImage'

type NormalPostProps = {
  post: MockPost
  variant?: 'feed' | 'detail'
}

const actionStyles =
  'inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 transition hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

type MediaLightboxProps = {
  media: PostMedia[]
  initialIndex: number
  onClose: () => void
}

function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const activeItem = media[activeIndex]
  const hasMultipleImages = media.length > 1

  const showPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + media.length) % media.length)
  }, [media.length])

  const showNext = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % media.length)
  }, [media.length])

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (hasMultipleImages && event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
        return
      }

      if (hasMultipleImages && event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        dialogRef.current.focus()
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [hasMultipleImages, onClose, showNext, showPrevious])

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 text-[var(--color-on-brand)] backdrop-blur-md">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onMouseDown={onClose}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post image viewer"
        tabIndex={-1}
        className="relative flex h-full w-full flex-col outline-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="relative z-10 flex min-h-[72px] items-center justify-end px-4 sm:px-6">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-on-brand)]/10 transition hover:bg-[var(--color-on-brand)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-5 sm:px-20 sm:pb-8">
          {hasMultipleImages ? (
            <button
              type="button"
              onClick={showPrevious}
              aria-label={`Show previous image, ${activeIndex === 0 ? media.length : activeIndex} of ${media.length}`}
              className="absolute left-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-on-brand)]/10 transition hover:bg-[var(--color-on-brand)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] sm:left-6"
            >
              <ChevronLeft aria-hidden="true" size={28} />
            </button>
          ) : null}

          <figure className="flex h-full w-full flex-col items-center justify-center gap-5">
            <div className="relative inline-flex max-h-[68dvh] max-w-[calc(100vw-6rem)] overflow-hidden rounded-xl shadow-2xl shadow-black/25 sm:max-w-[min(76vw,980px)]">
              <img
                key={activeItem.id}
                src={activeItem.url}
                alt={activeItem.alt}
                className="max-h-[68dvh] max-w-full object-contain"
              />
              {activeItem.label?.trim() ? (
                <span className="absolute inset-x-0 bottom-0 bg-black/50 px-4 py-3 text-left text-sm font-semibold leading-5 text-white backdrop-blur-sm sm:text-base">
                  {activeItem.label}
                </span>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <div
                role="tablist"
                aria-label="Choose an image"
                className="flex max-w-full items-center justify-center gap-2 overflow-x-auto px-2 py-2"
              >
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show image ${index + 1} of ${media.length}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 shrink-0 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                      index === activeIndex
                        ? 'w-9 bg-[var(--color-on-brand)]'
                        : 'w-5 bg-[var(--color-on-brand)]/35 hover:bg-[var(--color-on-brand)]/60'
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </figure>

          {hasMultipleImages ? (
            <button
              type="button"
              onClick={showNext}
              aria-label={`Show next image, ${(activeIndex + 2) > media.length ? 1 : activeIndex + 2} of ${media.length}`}
              className="absolute right-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-on-brand)]/10 transition hover:bg-[var(--color-on-brand)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] sm:right-6"
            >
              <ChevronRight aria-hidden="true" size={28} />
            </button>
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  )
}

type PostMediaGridProps = {
  media: PostMedia[]
  layout?: PostMediaLayout
  compact?: boolean
}

function PostMediaGrid({
  compact = false,
  media,
  layout = 'grid',
}: PostMediaGridProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setActiveMediaIndex(null), [])

  if (media.length === 0) {
    return null
  }

  if (media.length === 1) {
    const [item] = media

    return (
      <>
        <button
          type="button"
          onClick={() => setActiveMediaIndex(0)}
          aria-label="Open post image"
          className={`group relative mr-auto block aspect-video w-full max-w-[640px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${compact ? 'mt-4' : 'mt-5'}`}
        >
          <PostMediaFrameImage
            src={item.url}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            interactive
          />
          {item.label?.trim() ? (
            <span className="absolute inset-x-0 bottom-0 z-10 bg-black/50 px-3 py-2.5 text-left text-xs font-semibold leading-5 text-white backdrop-blur-sm sm:px-4 sm:py-3 sm:text-sm">
              {item.label}
            </span>
          ) : null}
        </button>

        {activeMediaIndex !== null ? (
          <MediaLightbox
            media={media}
            initialIndex={activeMediaIndex}
            onClose={closeLightbox}
          />
        ) : null}
      </>
    )
  }

  const compactMediaLimit = 4
  const hasHiddenMedia = media.length > compactMediaLimit
  const visibleMedia = media.slice(0, compactMediaLimit)
  const hiddenMediaCount = media.length - compactMediaLimit
  const effectiveLayout = getEffectivePostMediaLayout(layout, media.length)

  return (
    <>
      <ul
        className={`mr-auto grid aspect-video w-full max-w-[640px] ${getPostMediaGridClass(effectiveLayout, visibleMedia.length)} gap-1.5 overflow-hidden rounded-2xl bg-[var(--color-border)] p-1.5 ${compact ? 'mt-4' : 'mt-5'}`}
        aria-label={`${media.length} attached images`}
      >
        {visibleMedia.map((item, index) => {
          const isRevealTile =
            hasHiddenMedia && index === compactMediaLimit - 1
          const slotClass = getPostMediaTileClass(
            effectiveLayout,
            visibleMedia.length,
            index,
          )

          return (
            <li
              key={item.id}
              className={`relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-xl bg-[var(--color-card-elevated)] ${slotClass}`}
            >
              <button
                type="button"
                onClick={() => setActiveMediaIndex(index)}
                aria-label={
                  isRevealTile
                    ? `Open image ${index + 1} of ${media.length}; ${hiddenMediaCount} more images`
                    : `Open image ${index + 1} of ${media.length}`
                }
                className="group relative block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-highlight)]"
              >
                <PostMediaFrameImage
                  src={item.url}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  interactive
                />
                {isRevealTile ? (
                  <span className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-brand-panel)]/68 text-2xl font-extrabold text-[var(--color-on-brand)] backdrop-blur-[2px] transition group-hover:bg-[var(--color-brand-panel)]/76">
                    +{hiddenMediaCount}
                  </span>
                ) : null}
                {!isRevealTile && item.label?.trim() ? (
                  <span className="absolute inset-x-0 bottom-0 z-10 bg-black/50 px-3 py-2 text-left text-xs font-semibold leading-4 text-white backdrop-blur-sm">
                    {item.label}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      {activeMediaIndex !== null ? (
        <MediaLightbox
          media={media}
          initialIndex={activeMediaIndex}
          onClose={closeLightbox}
        />
      ) : null}
    </>
  )
}

function NormalPost({ post, variant = 'feed' }: NormalPostProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const interaction = getPostInteraction(post.id)
  const [isLoved, setIsLoved] = useState(interaction.isReacted ?? post.isReacted)
  const [isSaved, setIsSaved] = useState(interaction.isBookmarked ?? post.isBookmarked)
  const [isReposted, setIsReposted] = useState(
    interaction.isReposted ?? post.isReposted ?? false,
  )
  const [localComments, setLocalComments] = useState(() => getLocalComments(post.id))
  const [shareStatus, setShareStatus] = useState('')
  const [isBodyExpanded, setIsBodyExpanded] = useState(false)

  const postType = getPostType(post)
  const isArticle = postType === 'article'
  const body = getPostBody(post)
  const media = isArticle ? [] : getPostMedia(post)
  const isMixedNormalPost =
    postType === 'normal' && Boolean(body) && media.length > 0
  const canCollapseBody =
    variant === 'feed' && shouldCollapsePostBody(body, isMixedNormalPost)
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const postPath = getPostPath(post)
  const primaryTopic = getPrimaryTopic(post.topics)
  const feedPath = `${location.pathname}${location.search}`
  const isOpenedFromFeed = location.pathname === '/'
  const interactionName = post.title.trim() || `${post.author.name}'s post`
  const loveCount =
    post.reactionCount
    + (isLoved && !post.isReacted ? 1 : 0)
    - (!isLoved && post.isReacted ? 1 : 0)
  const commentCount = post.commentCount + localComments.length
  const originalRepostState = post.isReposted ?? false
  const repostCount =
    (post.repostCount ?? 0)
    + (isReposted && !originalRepostState ? 1 : 0)
    - (!isReposted && originalRepostState ? 1 : 0)

  function handleLoveToggle() {
    setIsLoved((currentValue) => {
      const nextValue = !currentValue
      savePostReaction(post.id, nextValue)
      return nextValue
    })
  }

  function handleSaveToggle() {
    setIsSaved((currentValue) => {
      const nextValue = !currentValue
      savePostBookmark(post.id, nextValue)
      return nextValue
    })
  }

  function handleRepostToggle() {
    setIsReposted((currentValue) => {
      const nextValue = !currentValue
      savePostRepost(post.id, nextValue)
      return nextValue
    })
  }

  function handleAddComment(content: CommentContent) {
    const comment = saveLocalComment(post.id, content)
    setLocalComments((currentComments) => [comment, ...currentComments])
  }

  function handleAddReply(
    parentId: string,
    content: CommentContent,
    replyToId: string | null = null,
  ) {
    const reply = saveLocalComment(post.id, {
      ...content,
      parentId,
      replyToId,
    })
    setLocalComments((currentComments) => [reply, ...currentComments])
  }

  async function handleShare() {
    const shareUrl = new URL(postPath, window.location.origin).toString()
    const shareData = {
      title: interactionName,
      text: body,
      url: shareUrl,
    }

    setShareStatus('')

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareStatus('Post shared.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('Post link copied.')
    } catch {
      setShareStatus('Sharing is unavailable in this browser.')
    }
  }

  function handlePostOpen() {
    if (!isOpenedFromFeed) {
      return
    }

    window.history.scrollRestoration = 'manual'
    saveFeedReturnState({
      path: feedPath,
      scrollY: window.scrollY,
    })
  }

  function openPost(scrollToComments = false) {
    handlePostOpen()
    transitionToRoute(() => {
      navigate(postPath, {
        state: isOpenedFromFeed
          ? { fromFeed: true, feedPath, scrollToComments }
          : location.state,
      })
    })
  }

  function handlePostLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return
    }

    event.preventDefault()
    openPost()
  }

  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (variant !== 'feed' || isArticle) {
      return
    }

    const target = event.target

    if (
      target instanceof Element
      && target.closest('a, button, input, textarea, select, [role="dialog"]')
    ) {
      return
    }

    openPost()
  }

  function handleCommentClick() {
    if (variant === 'feed') {
      openPost(true)
      return
    }

    scrollToCommentsSection()
  }

  return (
    <article
      onClick={handleCardClick}
      className={`w-full overflow-hidden border bg-[var(--color-card)] ${
        isArticle
          ? 'mx-auto max-w-[680px] rounded-[18px] border-[var(--color-border-soft)] shadow-[0_22px_55px_-48px_rgb(var(--shadow-color)/0.55)]'
          : variant === 'detail'
            ? 'max-w-[720px] rounded-[24px] border-[var(--color-border)] p-5 shadow-[0_28px_70px_-58px_rgb(var(--shadow-color)/0.55)] sm:p-6'
            : 'max-w-[680px] cursor-pointer rounded-[18px] border-[var(--color-border)] p-4 sm:p-5'
      }`}
    >
      <header className={`flex items-center gap-3 ${isArticle ? 'px-4 pb-4 pt-4 sm:px-5 sm:pt-5' : ''}`}>
        <NavLink
          to={authorProfilePath}
          aria-label={`View ${post.author.name}'s profile`}
          className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <img
            src={post.author.profileImage}
            alt=""
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-border)]"
          />
        </NavLink>

        <div className="min-w-0 flex-1">
          <NavLink
            to={authorProfilePath}
            className="block truncate text-sm font-extrabold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
          >
            @{post.author.username}
          </NavLink>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-[var(--color-muted)]">
            {!isArticle && variant === 'feed' ? (
              <NavLink
                to={postPath}
                state={isOpenedFromFeed ? { fromFeed: true, feedPath } : undefined}
                onClick={handlePostLinkClick}
                aria-label={`Open post by ${post.author.name}`}
                className="rounded transition hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
              </NavLink>
            ) : (
              <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
            )}
            {isPostEdited(post) ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Edited</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      {isArticle ? (
        <NavLink
          to={postPath}
          state={isOpenedFromFeed ? { fromFeed: true, feedPath } : undefined}
          onClick={handlePostLinkClick}
          className="group/article block border-y border-[var(--color-border)] bg-[var(--color-bg)]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
          aria-label={`Read article: ${interactionName}`}
        >
          {post.coverImage ? (
            <div className="relative min-h-[360px] overflow-hidden sm:aspect-[16/9] sm:min-h-0">
              <img
                src={post.coverImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover/article:scale-[1.02]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/48 to-black/10"
                aria-hidden="true"
              />

              <div className="relative flex min-h-[360px] items-end p-4 sm:absolute sm:inset-0 sm:min-h-0 sm:p-5">
                <div className="mx-auto w-full max-w-[590px] rounded-2xl border border-white/15 bg-black/28 p-4 text-white shadow-lg shadow-black/15 backdrop-blur-[3px] sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-white/78">
                    <span className="inline-flex items-center gap-1.5 text-[var(--color-highlight)]">
                      <BookOpenText aria-hidden="true" size={14} />
                      Article
                    </span>
                    <span aria-hidden="true">/</span>
                    <span>{primaryTopic}</span>
                    <span aria-hidden="true">/</span>
                    <span className="normal-case tracking-normal">
                      {formatReadTime(post.readTime)}
                    </span>
                  </div>

                  <h2 className="mt-3 font-reading text-[1.85rem] font-semibold leading-[1.03] tracking-[-0.025em] text-white transition group-hover/article:text-[var(--color-highlight)] sm:text-[2.25rem]">
                    {post.title.trim() || 'Untitled article'}
                  </h2>
                  {body ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/82 sm:text-[0.95rem]">
                      {body}
                    </p>
                  ) : null}

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-white">
                    Read article
                    <ArrowUpRight
                      aria-hidden="true"
                      size={16}
                      className="transition-transform group-hover/article:-translate-y-0.5 group-hover/article:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:px-5 sm:py-6">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenText aria-hidden="true" size={14} />
                    Article
                  </span>
                  <span aria-hidden="true" className="text-[var(--color-border-soft)]">/</span>
                  <span className="text-[var(--color-muted)]">{primaryTopic}</span>
                  <span aria-hidden="true" className="text-[var(--color-border-soft)]">/</span>
                  <span className="normal-case tracking-normal text-[var(--color-muted)]">
                    {formatReadTime(post.readTime)}
                  </span>
                </div>

                <h2 className="mt-3 max-w-[590px] font-reading text-[1.85rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--color-text)] transition group-hover/article:text-[var(--color-accent)] sm:text-[2.25rem]">
                  {post.title.trim() || 'Untitled article'}
                </h2>
                {body ? (
                  <p className="mt-3 max-w-[590px] text-sm leading-6 text-[var(--color-secondary)] sm:text-[0.95rem] sm:leading-7">
                    {body}
                  </p>
                ) : null}

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--color-text)]">
                  Read article
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform group-hover/article:-translate-y-0.5 group-hover/article:translate-x-0.5"
                  />
                </span>
              </div>

              {post.quotePreview.trim() ? (
                <blockquote className="mx-4 mb-4 border-l-2 border-[var(--color-accent)] bg-[var(--color-soft-accent)] px-4 py-3 font-reading text-lg font-medium leading-7 text-[var(--color-text)] sm:mx-5 sm:mb-5">
                  “{post.quotePreview}”
                </blockquote>
              ) : null}
            </>
          )}
        </NavLink>
      ) : (
        <>
          <div className={isMixedNormalPost ? 'mt-4' : 'mt-5'}>
            {body ? (
              <p
                className={`whitespace-pre-wrap text-[0.95rem] text-[var(--color-text)] ${
                  isMixedNormalPost ? 'leading-6' : 'leading-7 sm:text-base'
                } ${canCollapseBody && !isBodyExpanded ? 'line-clamp-3' : ''}`}
              >
                {body}
              </p>
            ) : null}
            {canCollapseBody ? (
              <button
                type="button"
                onClick={() => setIsBodyExpanded((currentValue) => !currentValue)}
                aria-expanded={isBodyExpanded}
                className="mt-1 text-sm font-bold text-[var(--color-accent)] transition hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                {isBodyExpanded ? 'Show less' : 'Show more'}
              </button>
            ) : null}
          </div>

          <PostMediaGrid
            media={media}
            layout={post.mediaLayout}
            compact={isMixedNormalPost && variant === 'feed'}
          />
        </>
      )}

      <footer
        className={`${
          isArticle
            ? 'px-4 pb-3 pt-2 sm:px-5'
            : `${isMixedNormalPost ? 'mt-4' : 'mt-5'} border-t border-[var(--color-border)] pt-2`
        }`}
      >
        <div
          className="flex flex-wrap items-center justify-start gap-1 sm:gap-2"
          role="group"
          aria-label={isArticle ? 'Article actions' : 'Post actions'}
        >
          <button
            type="button"
            onClick={handleLoveToggle}
            className={`${actionStyles} ${
              isLoved
                ? 'text-[var(--color-accent)] hover:text-[var(--color-accent)]'
                : 'text-[var(--color-secondary)]'
            }`}
            aria-pressed={isLoved}
            aria-label={isLoved ? `Remove love from ${interactionName}` : `Love ${interactionName}`}
          >
            <Heart aria-hidden="true" size={19} className={isLoved ? 'fill-current' : ''} />
            <span className="text-xs font-bold tabular-nums">{loveCount}</span>
          </button>

          <button
            type="button"
            onClick={handleCommentClick}
            className={`${actionStyles} text-[var(--color-secondary)]`}
            aria-controls={variant === 'detail' ? 'comments' : undefined}
            aria-label={`Comment on ${interactionName}, ${commentCount} comments`}
          >
            <MessageCircle
              aria-hidden="true"
              size={19}
            />
            <span className="text-xs font-bold tabular-nums">{commentCount}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`${actionStyles} ${
              isSaved
                ? 'text-[var(--color-accent)] hover:text-[var(--color-accent)]'
                : 'text-[var(--color-secondary)]'
            }`}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${interactionName} from saved posts` : `Save ${interactionName}`}
          >
            <Bookmark aria-hidden="true" size={19} className={isSaved ? 'fill-current' : ''} />
          </button>

          <button
            type="button"
            onClick={handleRepostToggle}
            className={`${actionStyles} ${
              isReposted
                ? 'text-[var(--color-accent)] hover:text-[var(--color-accent)]'
                : 'text-[var(--color-secondary)]'
            }`}
            aria-pressed={isReposted}
            aria-label={isReposted ? `Undo repost of ${interactionName}` : `Repost ${interactionName}`}
          >
            <Repeat2
              aria-hidden="true"
              size={19}
              className={isReposted ? 'fill-current stroke-[2.75]' : ''}
            />
            <span className="text-xs font-bold tabular-nums">{repostCount}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`${actionStyles} text-[var(--color-secondary)]`}
            aria-label={`Share ${interactionName}`}
          >
            <Share2 aria-hidden="true" size={19} />
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {shareStatus}
        </p>
      </footer>

      {variant === 'detail' ? (
        <CommentsPanel
          comments={[...localComments, ...getMockComments(post.id)]}
          commentCount={commentCount}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
        />
      ) : null}
    </article>
  )
}

export default NormalPost
