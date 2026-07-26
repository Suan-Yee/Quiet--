import { ArrowUpRight, Bookmark, FileText } from 'lucide-react'
import { NavLink } from 'react-router'
import type { MockPost } from '../../types/post'
import { getPostInteraction } from '../../utils/localInteractions'
import { formatPostDate, formatReadTime, getPostPath, getPrimaryTopic } from '../../utils/postDisplay'

type ProfileStoryRowProps = {
  post: MockPost
}

function ProfileStoryRow({ post }: ProfileStoryRowProps) {
  const isDraft = post.status === 'draft'
  const interaction = getPostInteraction(post.id)
  const isSaved = interaction.isBookmarked ?? post.isBookmarked
  const destination = isDraft ? '/create' : getPostPath(post)

  return (
    <article className="group border-t border-[var(--color-border)] py-7 first:border-t-0 first:pt-0 sm:py-9">
      <div className={post.coverImage ? 'grid gap-6 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center' : ''}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <span className={isDraft ? 'text-[var(--color-secondary)]' : 'text-[var(--color-accent)]'}>
              {isDraft ? 'Working draft' : getPrimaryTopic(post.topics)}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
            {!isDraft ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatReadTime(post.readTime)}</span>
              </>
            ) : null}
          </div>

          <NavLink
            to={destination}
            className="mt-3 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)]"
          >
            <h3 className="font-reading text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text)] transition group-hover:text-[var(--color-accent)] sm:text-3xl">
              {post.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-secondary)] sm:text-base">
              {post.excerpt}
            </p>
          </NavLink>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-muted)]">
            <span>{post.reactionCount} loves</span>
            <span>{post.commentCount} comments</span>
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-[var(--color-accent)]">
                <Bookmark size={14} className="fill-[var(--color-accent)]" aria-hidden="true" />
                Saved
              </span>
            ) : null}
            <NavLink
              to={destination}
              className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-bold text-[var(--color-text)] transition hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {isDraft ? (
                <>
                  Continue draft
                  <FileText size={15} aria-hidden="true" />
                </>
              ) : (
                <>
                  Read
                  <ArrowUpRight size={15} aria-hidden="true" />
                </>
              )}
            </NavLink>
          </div>
        </div>

        {post.coverImage ? (
          <NavLink
            to={destination}
            tabIndex={-1}
            aria-hidden="true"
            className="order-first block overflow-hidden rounded-2xl bg-[var(--color-card-elevated)] sm:order-none"
          >
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="aspect-[16/9] h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.03] sm:aspect-[4/3]"
            />
          </NavLink>
        ) : null}
      </div>
    </article>
  )
}

export default ProfileStoryRow
