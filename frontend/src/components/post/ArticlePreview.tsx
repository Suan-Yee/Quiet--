import { ArrowRight, Bookmark, Heart, MessageCircle } from 'lucide-react'
import Card from '../common/Card'
import TiptapContentRenderer from './TiptapContentRenderer'
import EmptyPreviewState from './EmptyPreviewState'
import type { PreviewMode } from './PreviewModeSwitch'
import type { PostDraft } from '../../types/post'

type ArticlePreviewProps = {
  draft: PostDraft
  mode: PreviewMode
}

function hasBodyContent(draft: PostDraft) {
  return draft.content.content?.some((node) => {
    if (node.type === 'paragraph') {
      return Boolean(node.content?.length)
    }

    return true
  })
}

function ArticlePreview({ draft, mode }: ArticlePreviewProps) {
  const hasCardPreview = Boolean(draft.title || draft.excerpt || draft.coverImage)
  const hasDetailPreview = Boolean(draft.title || draft.excerpt || draft.coverImage || hasBodyContent(draft))

  if (mode === 'card' && !hasCardPreview) {
    return (
      <EmptyPreviewState message="No post preview yet. Add a title, excerpt, or cover image to see how your post card will look." />
    )
  }

  if (mode === 'detail' && !hasDetailPreview) {
    return (
      <EmptyPreviewState message="No article preview yet. Start writing your article content to preview the full post." />
    )
  }

  if (mode === 'card') {
    const reactionTextColor = draft.isReacted ? 'text-[#FF6719]' : 'text-[#6B7280]'
    const bookmarkTextColor = draft.isBookmarked ? 'text-[#FF6719]' : 'text-[#6B7280]'

    return (
      <Card className="group overflow-hidden p-6 sm:p-7">
        <article>
          <header className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <img
                src={draft.author.avatar}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-1 ring-[#E8DED2]"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1F2933]">{draft.author.name}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-[#6B7280]">
                  {draft.author.description}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
                  {draft.createdAt} - {draft.readTime}
                </p>
              </div>
            </div>
            {draft.isFeatured ? (
              <span className="shrink-0 rounded-full border border-[#EBCAB8] bg-[#FFF1E8] px-3 py-1 text-xs font-semibold text-[#1F2933]">
                Editor&apos;s pick
              </span>
            ) : null}
          </header>

          <div
            className={`mt-5 ${
              draft.coverImage
                ? 'grid gap-5 md:grid-cols-[minmax(0,1fr)_188px] md:items-start'
                : ''
            }`}
          >
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#E8DED2] bg-[#FFFDF9] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                  {draft.category}
                </span>
              </div>
              <h2 className="font-reading text-[1.6rem] font-bold leading-snug text-[#1F2933]">
                {draft.title || 'Untitled draft'}
              </h2>
              <p className="mt-4 line-clamp-3 text-[0.98rem] leading-8 text-[#6B7280]">
                {draft.excerpt || 'Your excerpt will appear here.'}
              </p>
              {draft.quotePreview ? (
                <blockquote className="mt-5 border-l-4 border-[#EBCAB8] bg-[#FFFDF9] px-4 py-3">
                  <p className="font-reading text-sm italic leading-6 text-[#1F2933]">
                    "{draft.quotePreview}"
                  </p>
                </blockquote>
              ) : null}
            </div>

            {draft.coverImage ? (
              <div className="overflow-hidden rounded-2xl border border-[#E8DED2] bg-[#FAF7F0] md:h-40 md:w-[188px]">
                <img src={draft.coverImage} alt="" className="h-44 w-full object-cover md:h-full" />
              </div>
            ) : null}
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-[#E8DED2] pt-4 text-xs font-medium text-[#6B7280]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 ${reactionTextColor}`}>
                <Heart
                  size={16}
                  aria-hidden="true"
                  className={draft.isReacted ? 'fill-[#FF6719]' : ''}
                />
                {draft.reactionCount}
              </span>
              <span className="inline-flex h-8 items-center">{draft.commentCount} responses</span>
              <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 ${bookmarkTextColor}`}>
                <Bookmark
                  size={16}
                  aria-hidden="true"
                  className={draft.isBookmarked ? 'fill-[#FF6719]' : ''}
                />
                Save
              </span>
            </div>
            <span className="inline-flex h-8 items-center gap-1.5 text-sm font-semibold text-[#1F2933]">
              Read more
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </footer>
        </article>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[140px_minmax(0,1fr)_56px]">
      <aside className="hidden xl:block">
        <div className="sticky top-28 rounded-2xl border border-[#E8E1D8] bg-white/70 p-4 shadow-sm shadow-[#1F2933]/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Reading
          </p>
          <div className="mt-4 flex items-center gap-3">
            <img
              src={draft.author.avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-1 ring-[#E8E1D8]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1F2933]">{draft.author.name}</p>
              <p className="text-xs font-medium text-[#6B7280]">{draft.readTime}</p>
            </div>
          </div>
        </div>
      </aside>

      <article className="min-w-0">
      <header className="rounded-3xl border border-[#E8E1D8] bg-white p-6 shadow-sm shadow-[#1F2933]/5 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#E8E1D8] bg-[#FFFDF9] px-3 py-1 text-xs font-semibold text-[#6B7280]">
            {draft.category}
          </span>
        </div>
        <h1 className="mt-4 font-reading text-3xl font-bold leading-tight text-[#1F2933] sm:text-5xl">
          {draft.title || 'Untitled draft'}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#6B7280]">
          {draft.excerpt || 'Your subtitle or excerpt will appear here.'}
        </p>

        <div className="mt-7 grid gap-5 border-t border-[#E8E1D8] pt-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
          <div className="flex items-center gap-3">
            <img
              src={draft.author.avatar}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-1 ring-[#E8E1D8]"
            />
            <div>
              <p className="text-sm font-semibold text-[#1F2933]">{draft.author.name}</p>
              <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
                {draft.createdAt} - {draft.readTime}
              </p>
            </div>
          </div>

          {draft.coverImage ? (
            <div className="overflow-hidden rounded-2xl border border-[#E8E1D8] bg-[#FAF7F0] sm:h-28 sm:w-[180px]">
              <img src={draft.coverImage} alt="" className="h-40 w-full object-cover sm:h-full" />
            </div>
          ) : null}
        </div>
      </header>

      <div className="rounded-b-3xl border-x border-b border-[#E8E1D8] bg-white px-6 pb-2 shadow-sm shadow-[#1F2933]/5 sm:px-8">
        <TiptapContentRenderer content={draft.content} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#6B7280] shadow-sm shadow-[#1F2933]/5">
        <span className="inline-flex h-9 items-center gap-2 rounded-full px-3">
          <Heart size={17} aria-hidden="true" />
          {draft.reactionCount}
        </span>
        <span className="inline-flex h-9 items-center gap-2 rounded-full px-3">
          <MessageCircle size={17} aria-hidden="true" />
          {draft.commentCount}
        </span>
        <span className="inline-flex h-9 items-center justify-center rounded-full px-3">
          <Bookmark size={17} aria-hidden="true" />
        </span>
      </div>
      </article>

      <aside className="hidden xl:block">
        <button
          type="button"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#FF6719] bg-white text-[#FF6719] shadow-lg shadow-[#1F2933]/10"
          aria-label="Comments preview"
        >
          <MessageCircle size={19} aria-hidden="true" />
        </button>
      </aside>
    </div>
  )
}

export default ArticlePreview
