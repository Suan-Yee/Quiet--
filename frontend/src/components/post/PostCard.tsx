import { useState } from 'react'
import { ArrowRight, Bookmark, Heart } from 'lucide-react'
import { NavLink } from 'react-router'
import Card from '../common/Card'
import type { MockPost } from '../../types/post'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../../utils/localInteractions'
import { formatPostDate, formatReadTime, getPostPath, getPrimaryTopic } from '../../utils/postDisplay'
import { getAuthorProfilePath } from '../../utils/profileLinks'

type PostCardProps = {
  post: MockPost
}

function PostCard({ post }: PostCardProps) {
  const interaction = getPostInteraction(post.id)
  const [isLiked, setIsLiked] = useState(interaction.isReacted ?? post.isReacted)
  const [isBookmarked, setIsBookmarked] = useState(interaction.isBookmarked ?? post.isBookmarked)
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const primaryTopic = getPrimaryTopic(post.topics)
  const postPath = getPostPath(post)

  const reactionCount =
    post.reactionCount + (isLiked && !post.isReacted ? 1 : 0) - (!isLiked && post.isReacted ? 1 : 0)

  function handleReactionToggle() {
    setIsLiked((currentValue) => {
      const nextValue = !currentValue
      savePostReaction(post.id, nextValue)
      return nextValue
    })
  }

  function handleBookmarkToggle() {
    setIsBookmarked((currentValue) => {
      const nextValue = !currentValue
      savePostBookmark(post.id, nextValue)
      return nextValue
    })
  }

  return (
    <Card className="group overflow-hidden p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] hover:shadow-md hover:shadow-[#1F2933]/8 dark:hover:shadow-black/20 sm:p-7">
      <article>
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <NavLink to={authorProfilePath} aria-label={`View ${post.author.name}'s profile`}>
              <img
                src={post.author.profileImage}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)]"
              />
            </NavLink>
            <div className="min-w-0">
              <NavLink
                to={authorProfilePath}
                className="block truncate text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
              >
                {post.author.name}
              </NavLink>
              <NavLink
                to={authorProfilePath}
                className="mt-0.5 block truncate text-xs font-medium text-[var(--color-secondary)] transition hover:text-[var(--color-text)]"
              >
                {post.author.authorDescription}
              </NavLink>
              <p className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
                {formatPostDate(post.createdAt)} - {formatReadTime(post.readTime)}
              </p>
            </div>
          </div>

          {post.isFeatured ? (
            <span className="shrink-0 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
              Editor&apos;s pick
            </span>
          ) : null}
        </header>

        <div
          className={`mt-5 ${
            post.coverImage
              ? 'grid gap-5 md:grid-cols-[minmax(0,1fr)_188px] md:items-start'
              : ''
          }`}
        >
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3 py-1 text-xs font-semibold text-[var(--color-secondary)]">
                {primaryTopic}
              </span>
            </div>

            <NavLink to={postPath} className="block">
              <h2 className="font-reading text-[1.6rem] font-bold leading-snug text-[var(--color-text)] transition group-hover:text-[var(--color-text)]">
                {post.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-[0.98rem] leading-8 text-[var(--color-secondary)]">
                {post.excerpt}
              </p>
            </NavLink>

            {post.quotePreview ? (
              <blockquote className="mt-5 border-l-4 border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] px-4 py-3">
                <p className="font-reading text-sm italic leading-6 text-[var(--color-text)]">
                  "{post.quotePreview}"
                </p>
              </blockquote>
            ) : null}
          </div>

          {post.coverImage ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] md:h-40 md:w-[188px]">
              <img
                src={post.coverImage}
                alt=""
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-full md:w-full"
              />
            </div>
          ) : null}
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-[var(--color-border)] pt-4 text-xs font-medium text-[var(--color-secondary)]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={handleReactionToggle}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 transition hover:bg-[#FFF1E8] ${
                isLiked ? 'text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
              }`}
              aria-pressed={isLiked}
              aria-label={isLiked ? `Unlike ${post.title}` : `Like ${post.title}`}
            >
              <Heart
                size={16}
                aria-hidden="true"
                className={isLiked ? 'fill-[var(--color-accent)]' : ''}
              />
              <span>{reactionCount}</span>
            </button>

            <span className="inline-flex h-8 items-center">{post.commentCount} responses</span>

            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 transition hover:bg-[#FFF1E8] ${
                isBookmarked ? 'text-[var(--color-accent)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
              }`}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? `Remove bookmark for ${post.title}` : `Save ${post.title}`}
            >
              <Bookmark
                size={16}
                aria-hidden="true"
                className={isBookmarked ? 'fill-[var(--color-accent)]' : ''}
              />
              <span>Save</span>
            </button>
          </div>

          <NavLink
            to={postPath}
            className="inline-flex h-8 items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] transition hover:translate-x-0.5 hover:text-[var(--color-accent)]"
          >
            Read more
            <ArrowRight size={15} aria-hidden="true" />
          </NavLink>
        </footer>
      </article>
    </Card>
  )
}

export default PostCard
