import { useState } from 'react'
import { ArrowUpRight, Bookmark, Heart } from 'lucide-react'
import { NavLink } from 'react-router'
import type { MockPost } from '../../types/post'
import { getPostInteraction, savePostBookmark, savePostReaction } from '../../utils/localInteractions'
import { formatPostDate, formatReadTime, getPostPath, getPrimaryTopic } from '../../utils/postDisplay'
import { getAuthorProfilePath } from '../../utils/profileLinks'

type PostCardProps = {
  post: MockPost
  variant?: 'row' | 'compact'
}

type StoryArtworkProps = {
  post: MockPost
  className?: string
  imageClassName?: string
}

function StoryArtwork({ post, className = '', imageClassName = '' }: StoryArtworkProps) {
  const primaryTopic = getPrimaryTopic(post.topics)

  if (post.coverImage) {
    return (
      <div
        className={`overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] ${className}`}
      >
        <img
          src={post.coverImage}
          alt=""
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] ${imageClassName}`}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative flex overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-highlight)] p-5 text-[var(--color-brand-panel)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-12 h-28 w-28 rounded-full border border-[var(--color-brand-panel)]/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 right-8 h-24 w-24 rotate-12 border border-[var(--color-brand-panel)]/15"
      />
      <div className="relative mt-auto">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em]">{primaryTopic}</p>
        <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6">
          {post.quotePreview || post.title}
        </p>
      </div>
    </div>
  )
}

type PostBylineProps = {
  post: MockPost
  authorProfilePath: string
}

function PostByline({ post, authorProfilePath }: PostBylineProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <NavLink to={authorProfilePath} aria-label={`View ${post.author.name}'s profile`}>
        <img
          src={post.author.profileImage}
          alt=""
          className="h-10 w-10 rounded-[10px] object-cover ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)]"
        />
      </NavLink>
      <div className="min-w-0">
        <p className="truncate text-sm text-[var(--color-secondary)]">
          <NavLink
            to={authorProfilePath}
            className="font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
          >
            {post.author.name}
          </NavLink>
          <span className="hidden sm:inline"> · {post.author.authorDescription}</span>
        </p>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
          {formatPostDate(post.createdAt)} · {formatReadTime(post.readTime)}
        </p>
      </div>
    </div>
  )
}

type PostActionsProps = {
  post: MockPost
  postPath: string
  isLiked: boolean
  isBookmarked: boolean
  reactionCount: number
  onReactionToggle: () => void
  onBookmarkToggle: () => void
}

function PostActions({
  post,
  postPath,
  isLiked,
  isBookmarked,
  reactionCount,
  onReactionToggle,
  onBookmarkToggle,
}: PostActionsProps) {
  return (
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 text-xs font-medium text-[var(--color-secondary)]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReactionToggle}
          className={`inline-flex h-10 items-center gap-1.5 rounded-[8px] px-2.5 transition hover:bg-[var(--color-highlight)] ${
            isLiked
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
          }`}
          aria-pressed={isLiked}
          aria-label={isLiked ? `Remove love from ${post.title}` : `Love ${post.title}`}
        >
          <Heart
            size={15}
            aria-hidden="true"
            className={isLiked ? 'fill-[var(--color-accent)]' : ''}
          />
          <span>{reactionCount}</span>
        </button>

        <span className="px-2">{post.commentCount} comments</span>

        <button
          type="button"
          onClick={onBookmarkToggle}
          className={`inline-flex h-10 items-center gap-1.5 rounded-[8px] px-2.5 transition hover:bg-[var(--color-highlight)] ${
            isBookmarked
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
          }`}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? `Remove bookmark for ${post.title}` : `Save ${post.title}`}
        >
          <Bookmark
            size={15}
            aria-hidden="true"
            className={isBookmarked ? 'fill-[var(--color-accent)]' : ''}
          />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      <NavLink
        to={postPath}
        className="inline-flex h-10 items-center gap-1 border-b border-[var(--color-text)] text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Read story
        <ArrowUpRight size={15} aria-hidden="true" />
      </NavLink>
    </footer>
  )
}

function PostCard({ post, variant = 'row' }: PostCardProps) {
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

  const actions = (
    <PostActions
      post={post}
      postPath={postPath}
      isLiked={isLiked}
      isBookmarked={isBookmarked}
      reactionCount={reactionCount}
      onReactionToggle={handleReactionToggle}
      onBookmarkToggle={handleBookmarkToggle}
    />
  )

  if (variant === 'compact') {
    return (
      <article className="group flex h-full flex-col rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition duration-200 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] sm:p-4">
        <NavLink to={postPath} aria-label={`Read ${post.title}`}>
          <StoryArtwork post={post} className="aspect-[16/9] w-full" />
        </NavLink>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-muted)]">
            <span>{primaryTopic}</span>
            {post.isFeatured ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--color-accent)]">Editor&apos;s pick</span>
              </>
            ) : null}
          </div>

          <NavLink to={postPath} className="mt-3 block">
            <h2 className="type-story-title">
              {post.title}
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-secondary)]">
              {post.excerpt}
            </p>
          </NavLink>

          <div className="mt-5">
            <PostByline post={post} authorProfilePath={authorProfilePath} />
          </div>

          <div className="mt-auto">{actions}</div>
        </div>
      </article>
    )
  }

  return (
    <article className="group rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition duration-200 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch">
        <div className="min-w-0">
          <PostByline post={post} authorProfilePath={authorProfilePath} />

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-muted)]">
            <span>{primaryTopic}</span>
            {post.isFeatured ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--color-accent)]">Editor&apos;s pick</span>
              </>
            ) : null}
          </div>

          <NavLink to={postPath} className="mt-2 block">
            <h2 className="type-story-title">
              {post.title}
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-secondary)] sm:text-[0.95rem]">
              {post.excerpt}
            </p>
          </NavLink>

          {actions}
        </div>

        <NavLink to={postPath} className="block min-h-44" aria-label={`Read ${post.title}`}>
          <StoryArtwork post={post} className="h-full min-h-44 w-full" />
        </NavLink>
      </div>
    </article>
  )
}

export default PostCard
