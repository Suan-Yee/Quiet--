import { useState } from 'react'
import { ArrowUpRight, Bookmark, Heart } from 'lucide-react'
import { NavLink } from 'react-router'
import type { MockPost } from '../../types/post'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../../utils/localInteractions'
import { formatPostDate, formatReadTime, getPostPath, getPrimaryTopic } from '../../utils/postDisplay'
import { getAuthorProfilePath } from '../../utils/profileLinks'

type HeroSectionProps = {
  post: MockPost
}

function HeroSection({ post }: HeroSectionProps) {
  const interaction = getPostInteraction(post.id)
  const [isLiked, setIsLiked] = useState(interaction.isReacted ?? post.isReacted)
  const [isBookmarked, setIsBookmarked] = useState(interaction.isBookmarked ?? post.isBookmarked)
  const postPath = getPostPath(post)
  const authorProfilePath = getAuthorProfilePath(post.author.name)
  const primaryTopic = getPrimaryTopic(post.topics)
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
    <section className="relative overflow-hidden rounded-[20px] bg-[var(--color-brand-panel)] text-[var(--color-on-brand)]">
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-32 h-72 w-72 rounded-full border border-[var(--color-on-brand)]/10"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 left-1/3 h-80 w-80 rotate-12 border border-[var(--color-on-brand)]/10"
      />

      <div className="relative grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <div className="flex min-h-[360px] flex-col px-3 py-6 sm:px-6 lg:min-h-[430px] lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-on-brand-muted)]">
            <span className="text-[var(--color-highlight)]">Today&apos;s feature</span>
            <span aria-hidden="true">/</span>
            <span>{primaryTopic}</span>
          </div>

          <div className="my-auto py-7">
            <p className="max-w-lg text-sm font-semibold leading-6 text-[var(--color-on-brand-muted)]">
              A slower place for sharper ideas, selected for the time you have today.
            </p>
            <NavLink to={postPath} className="mt-4 block max-w-3xl">
              <h2 className="type-feature-title">
                {post.title}
              </h2>
              <p className="mt-5 max-w-2xl text-[0.9375rem] leading-7 text-[var(--color-on-brand-muted)] sm:text-base sm:leading-8">
                {post.excerpt}
              </p>
            </NavLink>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5 border-t border-[var(--color-on-brand)]/15 pt-5">
            <NavLink
              to={authorProfilePath}
              className="flex min-w-0 items-center gap-3"
              aria-label={`View ${post.author.name}'s profile`}
            >
              <img
                src={post.author.profileImage}
                alt=""
                className="h-11 w-11 rounded-[12px] object-cover ring-1 ring-[var(--color-on-brand)]/25"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-on-brand)]">
                  {post.author.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-on-brand-muted)]">
                  {formatPostDate(post.createdAt)} · {formatReadTime(post.readTime)}
                </p>
              </div>
            </NavLink>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReactionToggle}
                className={`inline-flex h-10 items-center gap-1.5 rounded-[9px] px-2.5 transition hover:bg-[var(--color-on-brand)]/10 ${
                  isLiked
                    ? 'text-[var(--color-highlight)]'
                    : 'text-[var(--color-on-brand-muted)] hover:text-[var(--color-on-brand)]'
                }`}
                aria-pressed={isLiked}
                aria-label={isLiked ? `Remove love from ${post.title}` : `Love ${post.title}`}
              >
                <Heart
                  size={16}
                  aria-hidden="true"
                  className={isLiked ? 'fill-[var(--color-highlight)]' : ''}
                />
                {reactionCount}
              </button>
              <span className="px-2 text-xs font-medium text-[var(--color-on-brand-muted)]">
                {post.commentCount} comments
              </span>
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className={`inline-flex h-10 items-center gap-1.5 rounded-[9px] px-2.5 transition hover:bg-[var(--color-on-brand)]/10 ${
                  isBookmarked
                    ? 'text-[var(--color-highlight)]'
                    : 'text-[var(--color-on-brand-muted)] hover:text-[var(--color-on-brand)]'
                }`}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? `Remove bookmark for ${post.title}` : `Save ${post.title}`}
              >
                <Bookmark
                  size={16}
                  aria-hidden="true"
                  className={isBookmarked ? 'fill-[var(--color-highlight)]' : ''}
                />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>

        <NavLink
          to={postPath}
          className="group relative min-h-[280px] overflow-hidden rounded-[16px] bg-[var(--color-highlight)] lg:min-h-[430px]"
          aria-label={`Read ${post.title}`}
        >
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-8 text-[var(--color-brand-panel)]">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em]">
                <span>Quiet reading</span>
                <span>01</span>
              </div>
              <p className="max-w-md text-2xl font-semibold leading-snug sm:text-3xl">
                {post.quotePreview || post.title}
              </p>
            </div>
          )}

          <span className="absolute bottom-4 right-4 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[var(--color-on-brand)] px-4 text-sm font-semibold text-[var(--color-brand-panel)] transition group-hover:-translate-y-0.5">
            Read story
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </NavLink>
      </div>
    </section>
  )
}

export default HeroSection
