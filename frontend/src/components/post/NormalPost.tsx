import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
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
import { NavLink } from 'react-router'
import type { MockPost, PostMedia } from '../../types/post'
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
} from '../../utils/normalPost'
import { formatPostDate, getPostPath } from '../../utils/postDisplay'
import { getAuthorProfilePath } from '../../utils/profileLinks'

type NormalPostProps = {
  post: MockPost
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
            <img
              key={activeItem.id}
              src={activeItem.url}
              alt={activeItem.alt}
              className="max-h-[68dvh] max-w-[calc(100vw-6rem)] rounded-xl object-contain shadow-2xl shadow-black/25 sm:max-w-[min(76vw,980px)]"
            />

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

function PostMediaGrid({ media }: { media: PostMedia[] }) {
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
          className="group mt-5 block w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <img
            src={item.url}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="max-h-[680px] w-full object-cover transition duration-300 group-hover:scale-[1.015]"
          />
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

  return (
    <>
      <ul
        className="mt-5 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl bg-[var(--color-border)] p-1.5"
        aria-label={`${media.length} attached images`}
      >
        {visibleMedia.map((item, index) => {
          const isRevealTile =
            hasHiddenMedia && index === compactMediaLimit - 1

          return (
            <li
              key={item.id}
              className={`relative overflow-hidden rounded-xl ${
                visibleMedia.length === 3 && index === 2 ? 'col-span-2' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveMediaIndex(index)}
                aria-label={
                  isRevealTile
                    ? `Open image ${index + 1} of ${media.length}; ${hiddenMediaCount} more images`
                    : `Open image ${index + 1} of ${media.length}`
                }
                className="group relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-highlight)]"
              >
                <img
                  src={item.url}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-full bg-[var(--color-card-elevated)] object-cover transition duration-300 group-hover:scale-[1.025] sm:h-52"
                />
                {isRevealTile ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-brand-panel)]/68 text-2xl font-extrabold text-[var(--color-on-brand)] backdrop-blur-[2px] transition group-hover:bg-[var(--color-brand-panel)]/76">
                    +{hiddenMediaCount}
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

function NormalPost({ post }: NormalPostProps) {
  const interaction = getPostInteraction(post.id)
  const [isLoved, setIsLoved] = useState(interaction.isReacted ?? post.isReacted)
  const [isSaved, setIsSaved] = useState(interaction.isBookmarked ?? post.isBookmarked)
  const [isReposted, setIsReposted] = useState(
    interaction.isReposted ?? post.isReposted ?? false,
  )
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [localCommentCount, setLocalCommentCount] = useState(0)
  const [shareStatus, setShareStatus] = useState('')

  const postType = getPostType(post)
  const body = getPostBody(post)
  const media = getPostMedia(post)
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const postPath = getPostPath(post)
  const commentFormId = `comment-form-${post.id}`
  const interactionName = post.title.trim() || `${post.author.name}'s post`
  const loveCount =
    post.reactionCount
    + (isLoved && !post.isReacted ? 1 : 0)
    - (!isLoved && post.isReacted ? 1 : 0)
  const commentCount = post.commentCount + localCommentCount
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

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!commentDraft.trim()) {
      return
    }

    setLocalCommentCount((currentValue) => currentValue + 1)
    setCommentDraft('')
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

  return (
    <article className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
      <header className="flex items-center gap-3">
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

        <div className="min-w-0">
          <NavLink
            to={authorProfilePath}
            className="block truncate text-sm font-extrabold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
          >
            @{post.author.username}
          </NavLink>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-[var(--color-muted)]">
            <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
            {isPostEdited(post) ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Edited</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="mt-5">
        {postType === 'article' && post.title.trim() ? (
          <h2 className="text-xl font-extrabold leading-tight tracking-[-0.025em] text-[var(--color-text)] sm:text-2xl">
            {post.title}
          </h2>
        ) : null}
        {body ? (
          <p
            className={`whitespace-pre-wrap text-[0.95rem] leading-7 text-[var(--color-text)] sm:text-base ${
              postType === 'article' && post.title.trim() ? 'mt-3 text-[var(--color-secondary)]' : ''
            }`}
          >
            {body}
          </p>
        ) : null}
      </div>

      <PostMediaGrid media={media} />

      <footer className="mt-5 border-t border-[var(--color-border)] pt-2">
        <div
          className="flex flex-wrap items-center justify-start gap-1 sm:gap-2"
          role="group"
          aria-label="Post actions"
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
            onClick={() => setIsCommenting((currentValue) => !currentValue)}
            className={`${actionStyles} ${
              isCommenting
                ? 'text-[var(--color-accent)] hover:text-[var(--color-accent)]'
                : 'text-[var(--color-secondary)]'
            }`}
            aria-expanded={isCommenting}
            aria-controls={commentFormId}
            aria-label={`Comment on ${interactionName}, ${commentCount} comments`}
          >
            <MessageCircle
              aria-hidden="true"
              size={19}
              className={isCommenting ? 'fill-current' : ''}
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

        {isCommenting ? (
          <form
            id={commentFormId}
            onSubmit={handleCommentSubmit}
            className="mt-2 flex flex-col gap-2 rounded-xl bg-[var(--color-card-elevated)] p-3 sm:flex-row"
          >
            <label htmlFor={`comment-${post.id}`} className="sr-only">
              Write a comment
            </label>
            <textarea
              id={`comment-${post.id}`}
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              rows={2}
              autoFocus
              placeholder="Write a comment…"
              className="min-h-11 flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-soft-accent)]"
            />
            <button
              type="submit"
              disabled={!commentDraft.trim()}
              className="min-h-11 rounded-xl bg-[var(--color-brand-panel)] px-4 text-sm font-bold text-[var(--color-on-brand)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Comment
            </button>
          </form>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {shareStatus}
        </p>
      </footer>
    </article>
  )
}

export default NormalPost
