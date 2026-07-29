import { useEffect, useRef, useState, type DragEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  GripVertical,
  Heart,
  LayoutGrid,
  MessageCircle,
  Repeat2,
  Send,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { mockCurrentUser } from '../../data/mockCurrentUser'
import type { PostMedia, PostMediaLayout } from '../../types/post'
import { shouldCollapsePostBody } from '../../utils/normalPost'
import {
  getEffectivePostMediaLayout,
  getPostMediaGridClass,
  getPostMediaLayoutsForCount,
  getPostMediaTileClass,
  recommendPostMediaLayout,
} from '../../utils/postMediaLayout'
import Button from '../common/Button'
import PostMediaFrameImage from './PostMediaFrameImage'

type NormalPostPreviewProps = {
  text: string
  media: PostMedia[]
  labelsEnabled: boolean
  mediaLayout: PostMediaLayout
  onMediaChange: (media: PostMedia[]) => void
  onMediaLayoutChange: (layout: PostMediaLayout) => void
  onClose: () => void
  onPublish: () => void
}

const layoutOptionDefinitions: Record<PostMediaLayout, {
  value: PostMediaLayout
  label: string
  description: string
}> = {
  grid: {
    value: 'grid',
    label: '2 × 2 grid',
    description: 'Four equal tiles in a compact frame.',
  },
  'side-by-side': {
    value: 'side-by-side',
    label: 'Side by side',
    description: 'Two equal columns, ideal for portrait images.',
  },
  stacked: {
    value: 'stacked',
    label: 'Stacked',
    description: 'Two horizontal rows with the first image emphasized.',
  },
  'portrait-strip': {
    value: 'portrait-strip',
    label: 'Portrait row',
    description: 'Three portrait images in equal vertical columns.',
  },
  'featured-left': {
    value: 'featured-left',
    label: 'Feature left',
    description: 'One large tile beside smaller supporting images.',
  },
  'featured-top': {
    value: 'featured-top',
    label: 'Feature top',
    description: 'One wide tile above smaller supporting images.',
  },
}

function DraftMediaGrid({
  compact = false,
  media,
  layout,
  labelsEnabled,
}: Pick<NormalPostPreviewProps, 'media' | 'labelsEnabled'> & {
  compact?: boolean
  layout: PostMediaLayout
}) {
  if (media.length === 0) {
    return null
  }

  if (media.length === 1) {
    const item = media[0]

    return (
      <figure className={`relative mr-auto aspect-video w-full max-w-[640px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] ${compact ? 'mt-4' : 'mt-5'}`}>
        <PostMediaFrameImage
          src={item.url}
          alt={item.alt}
        />
        {labelsEnabled && item.label?.trim() ? (
          <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-black/50 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
            {item.label}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  const visibleMedia = media.slice(0, 4)
  const hiddenMediaCount = Math.max(0, media.length - visibleMedia.length)
  const effectiveLayout = getEffectivePostMediaLayout(layout, media.length)

  return (
    <ul
      className={`mr-auto grid aspect-video w-full max-w-[640px] ${getPostMediaGridClass(effectiveLayout, visibleMedia.length)} gap-1.5 overflow-hidden rounded-2xl bg-[var(--color-border)] p-1.5 ${compact ? 'mt-4' : 'mt-5'}`}
      aria-label={`${media.length} image preview`}
    >
      {visibleMedia.map((item, index) => {
        const isRevealTile = hiddenMediaCount > 0 && index === 3

        return (
          <li
            key={item.id}
            className={`relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-xl bg-[var(--color-card-elevated)] ${getPostMediaTileClass(
              effectiveLayout,
              visibleMedia.length,
              index,
            )}`}
          >
            <PostMediaFrameImage
              src={item.url}
              alt={item.alt}
            />
            {isRevealTile ? (
              <span className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-brand-panel)]/68 text-2xl font-extrabold text-[var(--color-on-brand)] backdrop-blur-[2px]">
                +{hiddenMediaCount}
              </span>
            ) : null}
            {!isRevealTile && labelsEnabled && item.label?.trim() ? (
              <span className="absolute inset-x-0 bottom-0 z-10 bg-black/50 px-3 py-2 text-left text-xs font-semibold leading-4 text-white backdrop-blur-sm">
                {item.label}
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function NormalPostPreview({
  text,
  media,
  labelsEnabled,
  mediaLayout,
  onMediaChange,
  onMediaLayoutChange,
  onClose,
  onPublish,
}: NormalPostPreviewProps) {
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [reorderStatus, setReorderStatus] = useState('')
  const [isTextExpanded, setIsTextExpanded] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (draggedMediaId) {
          setDraggedMediaId(null)
          setDropTargetId(null)
          return
        }

        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [draggedMediaId, onClose])

  function moveMedia(sourceId: string, targetId: string) {
    const sourceIndex = media.findIndex((item) => item.id === sourceId)
    const targetIndex = media.findIndex((item) => item.id === targetId)

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return
    }

    const nextMedia = [...media]
    const [movedItem] = nextMedia.splice(sourceIndex, 1)
    nextMedia.splice(targetIndex, 0, movedItem)
    onMediaChange(nextMedia)
    setReorderStatus(`Image moved to position ${targetIndex + 1} of ${nextMedia.length}.`)
  }

  function moveByOffset(mediaId: string, offset: number) {
    const currentIndex = media.findIndex((item) => item.id === mediaId)
    const targetIndex = currentIndex + offset

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= media.length) {
      return
    }

    moveMedia(mediaId, media[targetIndex].id)
  }

  function handleDragStart(event: DragEvent<HTMLElement>, mediaId: string) {
    setDraggedMediaId(mediaId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', mediaId)
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, mediaId: string) {
    if (!draggedMediaId || draggedMediaId === mediaId) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetId(mediaId)
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedMediaId

    if (sourceId) {
      moveMedia(sourceId, targetId)
    }

    setDraggedMediaId(null)
    setDropTargetId(null)
  }

  function updateLabel(mediaId: string, label: string) {
    onMediaChange(
      media.map((item) => (item.id === mediaId ? { ...item, label } : item)),
    )
  }

  function removeMedia(mediaId: string) {
    const nextMedia = media.filter((item) => item.id !== mediaId)
    onMediaChange(nextMedia)
    setReorderStatus(
      nextMedia.length > 0
        ? `Image removed. ${nextMedia.length} ${nextMedia.length === 1 ? 'image' : 'images'} remain.`
        : 'Image removed. No images remain.',
    )
  }

  const canPublish = Boolean(text.trim() || media.length > 0)
  const isMixedPost = Boolean(text.trim()) && media.length > 0
  const canCollapseText = shouldCollapsePostBody(text, isMixedPost)
  const layoutOptions = getPostMediaLayoutsForCount(media.length).map(
    (layout) => layoutOptionDefinitions[layout],
  )
  const hasLayoutChoices = layoutOptions.length > 1
  const effectiveLayout = getEffectivePostMediaLayout(mediaLayout, media.length)
  const hasFeaturedSlot =
    effectiveLayout === 'stacked'
    || effectiveLayout === 'featured-left'
    || effectiveLayout === 'featured-top'
  const layoutRecommendation = recommendPostMediaLayout(media)
  const recommendedLayoutLabel =
    layoutOptionDefinitions[layoutRecommendation.layout].label
  const recommendedMediaIndex = layoutRecommendation.featuredMediaId
    ? media.findIndex((item) => item.id === layoutRecommendation.featuredMediaId)
    : -1
  const isRecommendationApplied =
    effectiveLayout === layoutRecommendation.layout
    && (recommendedMediaIndex <= 0 || media[0]?.id === layoutRecommendation.featuredMediaId)

  function applyLayoutRecommendation() {
    onMediaLayoutChange(layoutRecommendation.layout)

    if (recommendedMediaIndex > 0) {
      const featuredMedia = media[recommendedMediaIndex]
      onMediaChange([
        featuredMedia,
        ...media.filter((item) => item.id !== featuredMedia.id),
      ])
      setReorderStatus(
        `${recommendedLayoutLabel} layout applied. Image ${recommendedMediaIndex + 1} moved to the featured position.`,
      )
      return
    }

    setReorderStatus(`${recommendedLayoutLabel} layout applied.`)
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="normal-post-preview-title"
      className="fixed inset-0 z-[90] flex flex-col bg-[var(--color-bg)]"
    >
      <header className="flex min-h-[72px] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)]/94 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3 text-sm font-bold text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:px-4"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          <span>Back to editor</span>
        </button>

        <div className="min-w-0">
          <p className="type-kicker text-[var(--color-accent)]">Preview & arrange</p>
          <h2
            id="normal-post-preview-title"
            className="mt-1 truncate text-sm font-extrabold text-[var(--color-text)] sm:text-base"
          >
            Normal post
          </h2>
        </div>
      </header>

      <div className="theme-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(360px,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-8 lg:px-8">
          <aside className="space-y-5">
            {hasLayoutChoices ? (
              <fieldset className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                <legend className="px-1 text-sm font-extrabold text-[var(--color-text)]">
                  Media layout
                </legend>
                <p className="mt-1 text-xs leading-5 text-[var(--color-secondary)]">
                  The outer frame always stays a compact 16:9. Choose how images are arranged inside it.
                </p>
                <div className="mt-4 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-soft-accent)] p-3">
                  <div className="flex gap-3">
                    <Sparkles
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-[var(--color-text)]">
                        Recommended: {recommendedLayoutLabel}
                      </p>
                      <p className="mt-1 text-[0.7rem] leading-4 text-[var(--color-secondary)]">
                        {layoutRecommendation.reason}
                        {recommendedMediaIndex > 0
                          ? ` Image ${recommendedMediaIndex + 1} is the best fit for the featured slot.`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full gap-2 px-3"
                    onClick={applyLayoutRecommendation}
                    disabled={isRecommendationApplied}
                  >
                    <Sparkles aria-hidden="true" size={15} />
                    {isRecommendationApplied ? 'Recommendation applied' : 'Apply recommendation'}
                  </Button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {layoutOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-[var(--color-accent)] ${
                        effectiveLayout === option.value
                          ? 'border-[var(--color-accent)] bg-[var(--color-soft-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-soft)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="normal-post-media-layout"
                        value={option.value}
                        checked={effectiveLayout === option.value}
                        onChange={() => onMediaLayoutChange(option.value)}
                        className="sr-only"
                      />
                      <span className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-[var(--color-text)]">
                        <LayoutGrid aria-hidden="true" size={15} />
                        {option.label}
                        {option.value === layoutRecommendation.layout ? (
                          <span className="rounded-full bg-[var(--color-card)] px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                            Recommended
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-[0.7rem] leading-4 text-[var(--color-secondary)]">
                        {option.description}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {media.length > 0 ? (
              <section
                aria-labelledby="arrange-images-title"
                className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 id="arrange-images-title" className="text-sm font-extrabold text-[var(--color-text)]">
                      Arrange images
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-secondary)]">
                      Drag on desktop, or use the arrow buttons on touch and keyboard.
                    </p>
                  </div>
                  <span className="rounded-lg bg-[var(--color-card-elevated)] px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                    {media.length}/10
                  </span>
                </div>

                <ol className="mt-4 space-y-3">
                  {media.map((item, index) => (
                    <li
                      key={item.id}
                      onDragOver={(event) => handleDragOver(event, item.id)}
                      onDragLeave={() => setDropTargetId(null)}
                      onDrop={(event) => handleDrop(event, item.id)}
                      onDragEnd={() => {
                        setDraggedMediaId(null)
                        setDropTargetId(null)
                      }}
                      className={`rounded-xl border bg-[var(--color-bg)] p-3 transition ${
                        dropTargetId === item.id
                          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-soft-accent)]'
                          : 'border-[var(--color-border)]'
                      } ${draggedMediaId === item.id ? 'opacity-55' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          draggable
                          onDragStart={(event) => handleDragStart(event, item.id)}
                          className="inline-flex h-11 w-8 shrink-0 cursor-grab items-center justify-center text-[var(--color-muted)] active:cursor-grabbing"
                          aria-hidden="true"
                        >
                          <GripVertical size={18} />
                        </span>
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-card-elevated)]">
                          <img
                            src={item.url}
                            alt=""
                            draggable={false}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[0.62rem] font-bold text-white">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-[var(--color-text)]">
                            Image {index + 1} of {media.length}
                          </p>
                          {index === 0 && hasFeaturedSlot ? (
                            <p className="mt-1 text-[0.68rem] font-bold text-[var(--color-accent)]">
                              Featured layout slot
                            </p>
                          ) : (
                            <p className="mt-1 text-[0.68rem] text-[var(--color-muted)]">
                              Drag to swap position
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveByOffset(item.id, -1)}
                            disabled={index === 0}
                            aria-label={`Move image ${index + 1} earlier`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-secondary)] transition hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-30"
                          >
                            <ArrowLeft aria-hidden="true" size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveByOffset(item.id, 1)}
                            disabled={index === media.length - 1}
                            aria-label={`Move image ${index + 1} later`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-secondary)] transition hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-30"
                          >
                            <ArrowRight aria-hidden="true" size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMedia(item.id)}
                            aria-label={`Remove image ${index + 1}`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-secondary)] transition hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]"
                          >
                            <Trash2 aria-hidden="true" size={17} />
                          </button>
                        </div>
                      </div>

                      {labelsEnabled ? (
                        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                          <label
                            htmlFor={`preview-label-${item.id}`}
                            className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[var(--color-muted)]"
                          >
                            Image label
                          </label>
                          <input
                            id={`preview-label-${item.id}`}
                            value={item.label ?? ''}
                            onChange={(event) => updateLabel(item.id, event.target.value)}
                            maxLength={120}
                            placeholder="Optional caption shown on the image"
                            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-soft-accent)]"
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </aside>

          <main className="lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="type-kicker">Feed preview</p>
                <p className="mt-1 text-xs text-[var(--color-secondary)]">
                  This is how the post will appear on the Dashboard.
                </p>
              </div>
            </div>

            <article className="mr-auto w-full max-w-[680px] rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
              <header className="flex items-center gap-3">
                <img
                  src={mockCurrentUser.profileImage}
                  alt=""
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-border)]"
                />
                <div>
                  <p className="text-sm font-extrabold text-[var(--color-text)]">
                    @{mockCurrentUser.username}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
                    Now
                  </p>
                </div>
              </header>

              {text.trim() ? (
                <div className="mt-4">
                  <p
                    className={`whitespace-pre-wrap text-[0.95rem] leading-6 text-[var(--color-text)] ${
                      canCollapseText && !isTextExpanded ? 'line-clamp-3' : ''
                    }`}
                  >
                    {text}
                  </p>
                  {canCollapseText ? (
                    <button
                      type="button"
                      onClick={() => setIsTextExpanded((currentValue) => !currentValue)}
                      aria-expanded={isTextExpanded}
                      className="mt-1 text-sm font-bold text-[var(--color-accent)] transition hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      {isTextExpanded ? 'Show less' : 'Show more'}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <DraftMediaGrid
                media={media}
                layout={mediaLayout}
                labelsEnabled={labelsEnabled}
                compact={isMixedPost}
              />

              <footer
                className={`${isMixedPost ? 'mt-4' : 'mt-5'} border-t border-[var(--color-border)] pt-2`}
              >
                <div className="flex flex-wrap items-center justify-start gap-1 text-[var(--color-secondary)] sm:gap-2">
                  {[
                    { Icon: Heart, label: 'Love', count: 0 },
                    { Icon: MessageCircle, label: 'Comment', count: 0 },
                    { Icon: Bookmark, label: 'Save' },
                    { Icon: Repeat2, label: 'Repost', count: 0 },
                    { Icon: Share2, label: 'Share' },
                  ].map(({ Icon, label, count }) => (
                    <span
                      key={label}
                      aria-label={label}
                      className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2"
                    >
                      <Icon aria-hidden="true" size={19} />
                      {typeof count === 'number' ? (
                        <span className="text-xs font-bold tabular-nums">{count}</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </footer>
            </article>
          </main>
        </div>
      </div>

      <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)]/94 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 px-3 sm:px-4"
            onClick={onClose}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Back to editor
          </Button>
          <Button
            type="button"
            className="ml-auto gap-2 px-4 sm:min-w-40"
            onClick={onPublish}
            disabled={!canPublish}
          >
            <Send aria-hidden="true" size={17} />
            Publish post
          </Button>
        </div>
      </footer>

      <p className="sr-only" aria-live="polite">
        {reorderStatus}
      </p>
    </section>
  )
}

export default NormalPostPreview
