import {
  useId,
  useMemo,
  useState,
} from 'react'
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react'
import type {
  CommentContent,
  CommentPoll,
  PostComment,
} from '../../types/comment'
import CommentComposer from './CommentComposer'

type CommentsPanelProps = {
  comments: PostComment[]
  commentCount: number
  onAddComment: (content: CommentContent) => void
  onAddReply: (
    parentId: string,
    content: CommentContent,
    replyToId?: string | null,
  ) => void
}

type CommentThread = PostComment & {
  replies: PostComment[]
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatCommentTime(createdAt: string) {
  const createdTime = new Date(createdAt).getTime()
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000))

  if (elapsedSeconds < 60) {
    return 'Just now'
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)

  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`
  }

  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function groupReplyBranches(rootId: string, replies: PostComment[]) {
  const replyIds = new Set(replies.map((reply) => reply.id))
  const repliesByTarget = new Map<string, PostComment[]>()
  const directReplies: PostComment[] = []

  replies.forEach((reply) => {
    const replyToId = reply.replyToId

    if (!replyToId || replyToId === rootId || !replyIds.has(replyToId)) {
      directReplies.push(reply)
      return
    }

    const targetedReplies = repliesByTarget.get(replyToId) ?? []
    targetedReplies.push(reply)
    repliesByTarget.set(replyToId, targetedReplies)
  })

  const visitedReplyIds = new Set<string>()
  const replyBranches: PostComment[][] = []

  function appendReply(reply: PostComment, branch: PostComment[]) {
    if (visitedReplyIds.has(reply.id)) {
      return
    }

    visitedReplyIds.add(reply.id)
    branch.push(reply)
    repliesByTarget
      .get(reply.id)
      ?.sort(
        (firstReply, secondReply) =>
          new Date(secondReply.createdAt).getTime() -
          new Date(firstReply.createdAt).getTime(),
      )
      .forEach((childReply) => appendReply(childReply, branch))
  }

  directReplies.forEach((directReply) => {
    const branch: PostComment[] = []
    appendReply(directReply, branch)

    if (branch.length) {
      replyBranches.push(branch)
    }
  })

  replies.forEach((reply) => {
    if (visitedReplyIds.has(reply.id)) {
      return
    }

    const branch: PostComment[] = []
    appendReply(reply, branch)

    if (branch.length) {
      replyBranches.push(branch)
    }
  })

  return replyBranches.sort((firstBranch, secondBranch) => {
    const firstActivity = Math.max(
      ...firstBranch.map((reply) => new Date(reply.createdAt).getTime()),
    )
    const secondActivity = Math.max(
      ...secondBranch.map((reply) => new Date(reply.createdAt).getTime()),
    )

    return secondActivity - firstActivity
  })
}

function getReplyPreview(replyBranches: PostComment[][], visibleReplyLimit: number) {
  const previewBranches: PostComment[][] = []
  let remainingReplies = visibleReplyLimit

  for (const branch of replyBranches) {
    if (remainingReplies <= 0) {
      break
    }

    const visibleBranch = branch.slice(0, remainingReplies)

    if (visibleBranch.length) {
      previewBranches.push(visibleBranch)
      remainingReplies -= visibleBranch.length
    }
  }

  return previewBranches
}

function AuthorAvatar({
  name,
  profileImage,
  size = 'large',
}: {
  name: string
  profileImage: string
  size?: 'large' | 'small'
}) {
  const sizeClasses = size === 'large' ? 'h-10 w-10 text-xs' : 'h-8 w-8 text-[0.6875rem]'

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt=""
        className={`${sizeClasses} shrink-0 rounded-full object-cover ring-1 ring-[var(--color-border)]`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-accent)] font-bold text-[var(--color-text)] ring-1 ring-[var(--color-border)]`}
    >
      {getInitials(name)}
    </div>
  )
}

function CommentPollView({ poll }: { poll: CommentPoll }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  return (
    <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] p-3">
      <p className="text-sm font-semibold text-[var(--color-text)]">
        {poll.question}
      </p>
      <div className="mt-3 grid gap-2">
        {poll.options.map((option, optionIndex) => {
          const isSelected = selectedOption === optionIndex

          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              onClick={() => setSelectedOption(optionIndex)}
              aria-pressed={isSelected}
              className={`min-h-10 rounded-lg border px-3 text-left text-xs font-semibold transition ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-soft-accent)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-secondary)] hover:border-[var(--color-accent)]'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[0.6875rem] font-medium text-[var(--color-muted)]">
        {selectedOption === null ? 'Choose one option' : 'Vote recorded for this preview'}
      </p>
    </div>
  )
}

function CommentContentView({ comment }: { comment: PostComment }) {
  return (
    <>
      {comment.body ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
          {comment.body}
        </p>
      ) : null}

      {comment.media?.length ? (
        <div
          className={`mt-3 grid gap-2 overflow-hidden rounded-xl ${
            comment.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {comment.media.map((media) => (
            <img
              key={media.id}
              src={media.url}
              alt={media.name}
              className="max-h-72 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] object-cover"
            />
          ))}
        </div>
      ) : null}

      {comment.poll ? <CommentPollView poll={comment.poll} /> : null}
    </>
  )
}

function ReplyComposer({
  id,
  authorName,
  onCancel,
  onSubmit,
}: {
  id: string
  authorName: string
  onCancel: () => void
  onSubmit: (content: CommentContent) => void
}) {
  return (
    <CommentComposer
      id={id}
      label={`Replying to ${authorName}`}
      placeholder="Write a reply…"
      submitLabel="Reply"
      variant="reply"
      autoFocus
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}

function CommentActions({
  commentId,
  authorName,
  isCommenting,
  replyInputId,
  onComment,
}: {
  commentId: string
  authorName: string
  isCommenting: boolean
  replyInputId: string
  onComment: () => void
}) {
  const [isLoved, setIsLoved] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const actionStyles =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-card)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

  async function handleShare() {
    const shareUrl = new URL(window.location.href)
    shareUrl.hash = `comment-${commentId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Comment by ${authorName}`,
          url: shareUrl.toString(),
        })
        setShareStatus('Comment shared.')
        return
      }

      await navigator.clipboard.writeText(shareUrl.toString())
      setShareStatus('Comment link copied.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setShareStatus('Unable to share this comment.')
    }
  }

  return (
    <>
      <div className="mt-2 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setIsLoved((currentValue) => !currentValue)}
          aria-label={`${isLoved ? 'Remove love from' : 'Love'} ${authorName}'s comment`}
          aria-pressed={isLoved}
          title="Love comment"
          className={`${actionStyles} ${
            isLoved ? 'text-[var(--color-accent)]' : ''
          }`}
        >
          <Heart
            size={16}
            fill={isLoved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={onComment}
          aria-label={`Comment on ${authorName}'s comment`}
          aria-expanded={isCommenting}
          aria-controls={replyInputId}
          title="Comment"
          className={`${actionStyles} ${
            isCommenting ? 'text-[var(--color-accent)]' : ''
          }`}
        >
          <MessageCircle
            size={16}
            fill={isCommenting ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          aria-label={`Share ${authorName}'s comment`}
          title="Share comment"
          className={actionStyles}
        >
          <Share2 size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {shareStatus}
      </p>
    </>
  )
}

function ReplyItem({
  reply,
  rootCommentId,
  replyingToName,
  connectorPosition,
  onAddReply,
}: {
  reply: PostComment
  rootCommentId: string
  replyingToName?: string
  connectorPosition: 'single' | 'first' | 'middle' | 'last'
  onAddReply: CommentsPanelProps['onAddReply']
}) {
  const [isReplying, setIsReplying] = useState(false)
  const replyInputId = useId()
  const connectorVerticalClass =
    connectorPosition === 'first'
      ? 'bottom-0 top-4'
      : connectorPosition === 'middle'
        ? 'inset-y-0'
        : 'top-0 h-8'

  return (
    <article
      id={`comment-${reply.id}`}
      data-connector-position={connectorPosition}
      className="relative flex gap-3 py-4 first:pt-0 last:pb-0"
    >
      {connectorPosition !== 'single' ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-4 w-0.5 -translate-x-px rounded-full bg-[var(--color-accent)] opacity-70 ${connectorVerticalClass}`}
        />
      ) : null}
      <div className="relative z-10 shrink-0">
        <AuthorAvatar
          name={reply.author.name}
          profileImage={reply.author.profileImage}
          size="small"
        />
      </div>
      <div className="min-w-0 flex-1">
        {replyingToName ? (
          <p className="mb-1 text-[0.6875rem] font-bold text-[var(--color-accent)]">
            Replying to {replyingToName}
          </p>
        ) : null}
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h4 className="text-sm font-semibold text-[var(--color-text)]">
            {reply.author.name}
          </h4>
          <span className="text-xs font-medium text-[var(--color-muted)]">
            {formatCommentTime(reply.createdAt)}
          </span>
        </header>
        <CommentContentView comment={reply} />

        <CommentActions
          commentId={reply.id}
          authorName={reply.author.name}
          isCommenting={isReplying}
          replyInputId={replyInputId}
          onComment={() => setIsReplying((currentValue) => !currentValue)}
        />

        {isReplying ? (
          <ReplyComposer
            id={replyInputId}
            authorName={reply.author.name}
            onCancel={() => setIsReplying(false)}
            onSubmit={(content) => {
              onAddReply(rootCommentId, content, reply.id)
              setIsReplying(false)
            }}
          />
        ) : null}
      </div>
    </article>
  )
}

function Comment({
  comment,
  onAddReply,
}: {
  comment: CommentThread
  onAddReply: CommentsPanelProps['onAddReply']
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const replyInputId = useId()
  const replyBranches = useMemo(
    () => groupReplyBranches(comment.id, comment.replies),
    [comment.id, comment.replies],
  )
  const visibleReplyLimit = 2
  const visibleReplyBranches = showAllReplies
    ? replyBranches
    : getReplyPreview(replyBranches, visibleReplyLimit)
  const visibleReplyCount = visibleReplyBranches.reduce(
    (replyCount, branch) => replyCount + branch.length,
    0,
  )
  const hiddenReplyCount = comment.replies.length - visibleReplyCount
  const replyAuthors = useMemo(
    () =>
      new Map([
        [comment.id, comment.author.name],
        ...comment.replies.map((reply) => [reply.id, reply.author.name] as const),
      ]),
    [comment],
  )

  return (
    <article
      id={`comment-${comment.id}`}
      className="border-b border-[var(--color-border)] py-6 last:border-b-0"
    >
      <div className="flex gap-3">
        <AuthorAvatar
          name={comment.author.name}
          profileImage={comment.author.profileImage}
        />
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              {comment.author.name}
            </h3>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              {formatCommentTime(comment.createdAt)}
            </span>
          </header>
          <CommentContentView comment={comment} />

          <CommentActions
            commentId={comment.id}
            authorName={comment.author.name}
            isCommenting={isReplying}
            replyInputId={replyInputId}
            onComment={() => setIsReplying((currentValue) => !currentValue)}
          />

          {isReplying ? (
            <ReplyComposer
              id={replyInputId}
              authorName={comment.author.name}
              onCancel={() => setIsReplying(false)}
              onSubmit={(content) => {
                onAddReply(comment.id, content, null)
                setIsReplying(false)
              }}
            />
          ) : null}

          {replyBranches.length > 0 ? (
            <div className="mt-5">
              <div className="space-y-5">
                {visibleReplyBranches.map((branch) => (
                  <div
                    key={branch[0].id}
                    data-reply-branch
                    className="relative"
                  >
                    {branch.map((reply, replyIndex) => (
                      <ReplyItem
                        key={reply.id}
                        reply={reply}
                        rootCommentId={comment.id}
                        connectorPosition={
                          branch.length === 1
                            ? 'single'
                            : replyIndex === 0
                              ? 'first'
                              : replyIndex === branch.length - 1
                                ? 'last'
                                : 'middle'
                        }
                        replyingToName={
                          reply.replyToId
                            ? replyAuthors.get(reply.replyToId)
                            : undefined
                        }
                        onAddReply={onAddReply}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {comment.replies.length > visibleReplyLimit ? (
                <button
                  type="button"
                  onClick={() => setShowAllReplies((currentValue) => !currentValue)}
                  aria-expanded={showAllReplies}
                  className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[var(--color-accent)] transition hover:bg-[var(--color-soft-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  {showAllReplies ? (
                    <>
                      <ChevronUp size={15} aria-hidden="true" />
                      Show fewer replies
                    </>
                  ) : (
                    <>
                      <ChevronDown size={15} aria-hidden="true" />
                      View {hiddenReplyCount} more{' '}
                      {hiddenReplyCount === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function CommentsPanel({
  comments,
  commentCount,
  onAddComment,
  onAddReply,
}: CommentsPanelProps) {
  const titleId = useId()
  const textareaId = useId()
  const commentThreads = useMemo(
    () =>
      comments
        .filter((comment) => comment.parentId === null)
        .map((comment) => ({
          ...comment,
          replies: comments.filter((reply) => reply.parentId === comment.id),
        })),
    [comments],
  )

  return (
    <section
      id="comments"
      aria-labelledby={titleId}
      className="scroll-mt-28 border-t border-[var(--color-border)] pt-8 sm:pt-10"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Discussion
          </p>
          <h2
            id={titleId}
            className="mt-1 font-reading text-3xl font-semibold text-[var(--color-text)]"
          >
            Comments
          </h2>
        </div>
        <p className="pb-1 text-sm font-semibold text-[var(--color-muted)]">
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </p>
      </header>

      <CommentComposer
        id={textareaId}
        label="Add a comment"
        placeholder="Share a thoughtful comment…"
        submitLabel="Comment"
        onSubmit={onAddComment}
      />
      <div className="mt-3">
        {commentThreads.length > 0 ? (
          commentThreads.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onAddReply={onAddReply}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="font-reading text-xl text-[var(--color-text)]">
              Begin the conversation.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Share the first thoughtful comment on this piece.
            </p>
          </div>
        )}
      </div>

      {commentThreads.length > 0 ? (
        <div
          className="flex items-center gap-3 pb-2 pt-4"
          role="note"
          aria-label="End of comments"
        >
          <span className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            End of comments
          </span>
          <span className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
        </div>
      ) : null}
    </section>
  )
}

export default CommentsPanel
