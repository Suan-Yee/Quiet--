import { X } from 'lucide-react'
import Card from '../common/Card'

export type CommentReply = {
  id: string
  author: string
  initials: string
  body: string
  time: string
}

export type CommentItem = CommentReply & {
  replies: CommentReply[]
}

type CommentsPanelProps = {
  comments: CommentItem[]
  responseCount: number
  isCloseable?: boolean
  onClose?: () => void
}

function Comment({ comment }: { comment: CommentItem }) {
  return (
    <div className="border-b border-[var(--color-border)] py-5 last:border-b-0">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-accent)] text-xs font-bold text-[var(--color-text)]">
          {comment.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-[var(--color-text)]">{comment.author}</p>
            <p className="text-xs font-medium text-[var(--color-muted)]">{comment.time}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">{comment.body}</p>

          {comment.replies.length > 0 ? (
            <div className="mt-4 space-y-4 border-l border-[var(--color-border)] pl-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-card-elevated)] text-xs font-bold text-[var(--color-text)] ring-1 ring-[var(--color-border)]">
                    {reply.initials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{reply.author}</p>
                      <p className="text-xs font-medium text-[var(--color-muted)]">{reply.time}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function CommentsPanel({ comments, responseCount, isCloseable = false, onClose }: CommentsPanelProps) {
  return (
    <Card className="overflow-hidden xl:flex xl:h-[calc(100vh-7rem)] xl:flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Discussion
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">{responseCount} responses</p>
        </div>
        {isCloseable ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-secondary)] transition hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]"
            aria-label="Close comments"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-[var(--color-border)] px-5 py-3">
        <textarea
          id="comment"
          rows={2}
          placeholder="Share a thoughtful response..."
          className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-[#FF6719]/20 transition hover:bg-[var(--color-accent-hover)]"
          >
            Comment
          </button>
        </div>
      </div>

      <div className="theme-scrollbar max-h-[56vh] overflow-y-auto px-5 xl:min-h-0 xl:flex-1 xl:max-h-none">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </Card>
  )
}

export default CommentsPanel
