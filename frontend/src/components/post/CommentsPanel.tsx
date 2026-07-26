import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Send, X } from 'lucide-react'

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
  commentCount: number
  onClose: () => void
  onAddComment: (body: string) => void
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function Comment({ comment }: { comment: CommentItem }) {
  return (
    <article className="border-b border-[var(--color-border)] py-6 last:border-b-0">
      <div className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-accent)] text-xs font-bold text-[var(--color-text)]"
        >
          {comment.initials}
        </div>
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{comment.author}</h3>
            <span className="text-xs font-medium text-[var(--color-muted)]">{comment.time}</span>
          </header>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">{comment.body}</p>

          {comment.replies.length > 0 ? (
            <div className="mt-5 space-y-5 border-l-2 border-[var(--color-border)] pl-4">
              {comment.replies.map((reply) => (
                <article key={reply.id} className="flex gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-card-elevated)] text-[0.6875rem] font-bold text-[var(--color-text)] ring-1 ring-[var(--color-border)]"
                  >
                    {reply.initials}
                  </div>
                  <div className="min-w-0">
                    <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h4 className="text-sm font-semibold text-[var(--color-text)]">{reply.author}</h4>
                      <span className="text-xs font-medium text-[var(--color-muted)]">{reply.time}</span>
                    </header>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">{reply.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function CommentsPanel({ comments, commentCount, onClose, onAddComment }: CommentsPanelProps) {
  const [commentBody, setCommentBody] = useState('')
  const panelRef = useRef<HTMLElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const textareaId = useId()

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => textareaRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
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
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextBody = commentBody.trim()

    if (!nextBody) {
      textareaRef.current?.focus()
      return
    }

    onAddComment(nextBody)
    setCommentBody('')
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-end sm:items-stretch">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-brand-panel)]/55 backdrop-blur-[2px]"
        onMouseDown={onClose}
      />

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-[2rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-[rgb(var(--shadow-color)/0.22)] outline-none sm:h-full sm:max-h-none sm:max-w-[28rem] sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <header className="flex items-start justify-between gap-5 border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Reading circle
            </p>
            <h2 id={titleId} className="mt-1 font-reading text-2xl font-semibold text-[var(--color-text)]">
              Join the discussion
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-[var(--color-muted)]">
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-secondary)] transition hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]"
            aria-label="Close discussion"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
          <label htmlFor={textareaId} className="text-sm font-semibold text-[var(--color-text)]">
            Add your perspective
          </label>
          <textarea
            ref={textareaRef}
            id={textareaId}
            rows={3}
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="What stayed with you?"
            className="mt-2 w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-muted)]">Keep it generous and specific.</p>
            <button
              type="submit"
              disabled={!commentBody.trim()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-[var(--color-on-brand)] transition hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Comment
              <Send size={15} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="theme-scrollbar min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          {comments.length > 0 ? (
            comments.map((comment) => <Comment key={comment.id} comment={comment} />)
          ) : (
            <div className="py-12 text-center">
              <p className="font-reading text-xl text-[var(--color-text)]">Begin the conversation.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Share the first thoughtful comment on this piece.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default CommentsPanel
