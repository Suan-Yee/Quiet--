import { ArrowUpRight, Bookmark, Heart, MessageCircle } from 'lucide-react'
import type { PostDraft } from '../../types/post'
import { formatPostDate, formatReadTime, getPrimaryTopic } from '../../utils/postDisplay'
import EmptyPreviewState from './EmptyPreviewState'
import type { PreviewMode } from './PreviewModeSwitch'
import TiptapContentRenderer from './TiptapContentRenderer'

type ArticlePreviewProps = {
  draft: PostDraft
  mode: PreviewMode
}

function hasBodyContent(draft: PostDraft) {
  return draft.contentJson.content?.some((node) => {
    if (node.type === 'paragraph') {
      return Boolean(node.content?.length)
    }

    return true
  })
}

function PreviewArtwork({ draft }: { draft: PostDraft }) {
  if (draft.coverImage) {
    return (
      <div className="min-h-52 overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-card-elevated)]">
        <img
          src={draft.coverImage}
          alt=""
          className="h-full min-h-52 w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-52 overflow-hidden rounded-[14px] bg-[var(--color-highlight)] p-6 text-[var(--color-brand-panel)]">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[var(--color-brand-panel)]/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-12 right-10 h-28 w-28 rotate-12 border border-[var(--color-brand-panel)]/15"
      />
      <p className="relative mt-auto max-w-xs text-lg font-bold leading-7">
        {draft.quotePreview || draft.title || 'A quiet place for your next idea.'}
      </p>
    </div>
  )
}

function PreviewMetrics({ draft }: { draft: PostDraft }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-[var(--color-secondary)]">
      <span
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 ${
          draft.isReacted ? 'text-[var(--color-accent)]' : ''
        }`}
      >
        <Heart
          size={16}
          aria-hidden="true"
          className={draft.isReacted ? 'fill-[var(--color-accent)]' : ''}
        />
        {draft.reactionCount}
      </span>
      <span className="inline-flex min-h-10 items-center px-2.5">
        {draft.commentCount} comments
      </span>
      <span
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 ${
          draft.isBookmarked ? 'text-[var(--color-accent)]' : ''
        }`}
      >
        <Bookmark
          size={16}
          aria-hidden="true"
          className={draft.isBookmarked ? 'fill-[var(--color-accent)]' : ''}
        />
        Save
      </span>
    </div>
  )
}

function ArticlePreview({ draft, mode }: ArticlePreviewProps) {
  const hasCardPreview = Boolean(draft.title || draft.excerpt || draft.coverImage)
  const hasDetailPreview = Boolean(
    draft.title || draft.excerpt || draft.coverImage || hasBodyContent(draft),
  )
  const primaryTopic = getPrimaryTopic(draft.topics)

  if (mode === 'card' && !hasCardPreview) {
    return (
      <EmptyPreviewState message="No story preview yet. Add a title, excerpt, or cover image to see how your work will appear in discovery." />
    )
  }

  if (mode === 'detail' && !hasDetailPreview) {
    return (
      <EmptyPreviewState message="No article preview yet. Start writing to see the complete reader experience." />
    )
  }

  if (mode === 'card') {
    return (
      <article className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[0_24px_70px_-48px_rgb(var(--shadow-color)/0.55)] sm:p-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px] md:items-stretch">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={draft.author.profileImage}
                alt=""
                className="h-10 w-10 rounded-[10px] object-cover ring-1 ring-[var(--color-border)]"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">
                  {draft.author.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                  {formatPostDate(draft.createdAt)} · {formatReadTime(draft.readTime)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
              <span>{primaryTopic}</span>
              {draft.isFeatured ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--color-accent)]">Editor&apos;s pick</span>
                </>
              ) : null}
            </div>

            <h2 className="type-story-title mt-2">
              {draft.title || 'Untitled draft'}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--color-secondary)]">
              {draft.excerpt || 'Your excerpt will appear here.'}
            </p>

            <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
              <PreviewMetrics draft={draft} />
              <span className="inline-flex min-h-10 items-center gap-1 border-b border-[var(--color-text)] text-sm font-bold text-[var(--color-text)]">
                Read story
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </footer>
          </div>

          <PreviewArtwork draft={draft} />
        </div>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_30px_90px_-55px_rgb(var(--shadow-color)/0.6)]">
      <header className="relative overflow-hidden bg-[var(--color-brand-panel)] px-5 py-10 text-[var(--color-on-brand)] sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-highlight)]/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-[820px]">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            Essay · {primaryTopic}
          </p>
          <h1 className="mt-5 font-reading text-4xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            {draft.title || 'Untitled draft'}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-on-brand-muted)] sm:text-lg">
            {draft.excerpt || 'Your subtitle or excerpt will appear here.'}
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-[var(--color-on-brand)]/15 pt-5">
            <img
              src={draft.author.profileImage}
              alt=""
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-on-brand)]/25"
            />
            <div>
              <p className="text-sm font-bold">{draft.author.name}</p>
              <p className="mt-0.5 text-xs text-[var(--color-on-brand-muted)]">
                {formatPostDate(draft.createdAt)} · {formatReadTime(draft.readTime)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {draft.coverImage ? (
        <img
          src={draft.coverImage}
          alt={`Cover preview for ${draft.title || 'untitled draft'}`}
          className="aspect-[16/8] max-h-[520px] w-full bg-[var(--color-card-elevated)] object-cover"
        />
      ) : null}

      <div className="mx-auto max-w-[780px] px-5 sm:px-8">
        <TiptapContentRenderer content={draft.contentJson} />
        <footer className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--color-border)] py-5">
          <PreviewMetrics draft={draft} />
          <span className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-accent)]">
            <MessageCircle size={17} aria-hidden="true" />
            Open reading circle
          </span>
        </footer>
      </div>
    </article>
  )
}

export default ArticlePreview
