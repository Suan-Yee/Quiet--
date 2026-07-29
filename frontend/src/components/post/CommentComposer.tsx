import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  BarChart3,
  CornerDownRight,
  Image as ImageIcon,
  Plus,
  Send,
  Smile,
  X,
} from 'lucide-react'
import type { CommentContent, CommentMedia } from '../../types/comment'

type CommentComposerProps = {
  id: string
  label: string
  placeholder: string
  submitLabel: string
  onSubmit: (content: CommentContent) => void
  onCancel?: () => void
  variant?: 'comment' | 'reply'
  autoFocus?: boolean
}

const commentEmojis = ['🌿', '💭', '✨', '👏', '❤️', '📚']
const maxCommentMedia = 4
const maxCommentMediaBytes = 3 * 1024 * 1024

function createMediaId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `comment-media-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function resizeCommentTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  textarea.style.overflowY = textarea.scrollHeight > 120 ? 'auto' : 'hidden'
}

function ToolbarButton({
  label,
  isActive = false,
  onClick,
  children,
}: {
  label: string
  isActive?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[0.6875rem] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
        isActive
          ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]'
          : 'text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-accent)]'
      }`}
    >
      {children}
    </button>
  )
}

function CommentComposer({
  id,
  label,
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  variant = 'comment',
  autoFocus = false,
}: CommentComposerProps) {
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<CommentMedia[]>([])
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isPollOpen, setIsPollOpen] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [composerStatus, setComposerStatus] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const gifInputRef = useRef<HTMLInputElement>(null)
  const isReply = variant === 'reply'
  const hasValidPoll =
    isPollOpen &&
    Boolean(pollQuestion.trim()) &&
    pollOptions.every((option) => Boolean(option.trim()))
  const hasContent = Boolean(body.trim()) || media.length > 0 || hasValidPoll
  const canSubmit = hasContent && (!isPollOpen || hasValidPoll)

  async function handleMediaSelection(
    event: ChangeEvent<HTMLInputElement>,
    type: CommentMedia['type'],
  ) {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!selectedFiles.length) {
      return
    }

    const availableSlots = maxCommentMedia - media.length

    if (availableSlots <= 0) {
      setComposerStatus(`A reply can include up to ${maxCommentMedia} media items.`)
      return
    }

    const acceptedFiles = selectedFiles.slice(0, availableSlots)
    const oversizedFile = acceptedFiles.find(
      (file) => file.size > maxCommentMediaBytes,
    )

    if (oversizedFile) {
      setComposerStatus('Each image or GIF must be 3 MB or smaller.')
      return
    }

    try {
      const nextMedia = await Promise.all(
        acceptedFiles.map(async (file) => ({
          id: createMediaId(),
          type,
          url: await readFileAsDataUrl(file),
          name: file.name,
        })),
      )
      setMedia((currentMedia) => [...currentMedia, ...nextMedia])
      setComposerStatus('')
    } catch {
      setComposerStatus('That file could not be added. Please try another one.')
    }
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current
    const selectionStart = textarea?.selectionStart ?? body.length
    const selectionEnd = textarea?.selectionEnd ?? body.length
    const nextBody = `${body.slice(0, selectionStart)}${emoji}${body.slice(selectionEnd)}`

    setBody(nextBody)
    setIsEmojiPickerOpen(false)
    requestAnimationFrame(() => {
      textarea?.focus()
      const nextCursorPosition = selectionStart + emoji.length
      textarea?.setSelectionRange(nextCursorPosition, nextCursorPosition)
    })
  }

  function resetComposer() {
    setBody('')
    setMedia([])
    setIsEmojiPickerOpen(false)
    setIsPollOpen(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setComposerStatus('')
    textareaRef.current?.style.removeProperty('height')
    textareaRef.current?.style.removeProperty('overflow-y')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      textareaRef.current?.focus()
      return
    }

    const poll = hasValidPoll
      ? {
          question: pollQuestion.trim(),
          options: pollOptions.map((option) => option.trim()),
        }
      : null

    try {
      onSubmit({
        body: body.trim(),
        media,
        poll,
      })
      resetComposer()
    } catch {
      setComposerStatus('Your reply could not be saved. Try a smaller image.')
    }
  }

  const composerField = (
    <>
      <label htmlFor={`${id}-textarea`} className={isReply ? 'sr-only' : 'text-xs font-semibold text-[var(--color-text)]'}>
        {label}
      </label>
      <div
        className={
          isReply
            ? 'mt-1 flex items-stretch overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] transition focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20'
            : 'mt-1.5 flex items-end gap-2'
        }
      >
        <textarea
          ref={textareaRef}
          id={`${id}-textarea`}
          aria-describedby={isReply ? `${id}-context` : undefined}
          rows={1}
          autoFocus={autoFocus}
          value={body}
          onChange={(event) => {
            setBody(event.target.value)
            resizeCommentTextarea(event.currentTarget)
          }}
          placeholder={placeholder}
          className={
            isReply
              ? 'min-h-11 min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent px-3 py-2.5 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]'
              : 'min-h-11 min-w-0 flex-1 resize-none overflow-y-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20'
          }
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={
            isReply
              ? 'min-h-11 min-w-20 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-accent)] px-4 text-xs font-bold text-[var(--color-on-brand)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-card)] disabled:text-[var(--color-muted)]'
              : 'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-[var(--color-on-brand)] transition hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-45'
          }
        >
          <span className={isReply ? '' : 'hidden sm:inline'}>{submitLabel}</span>
          {!isReply ? <Send size={15} aria-hidden="true" /> : null}
          {!isReply ? <span className="sr-only sm:hidden">{submitLabel}</span> : null}
        </button>
      </div>
    </>
  )

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={
        isReply
          ? 'mt-3'
          : 'mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-3'
      }
    >
      {isReply ? (
        <div className="flex min-h-7 items-center justify-between gap-3 px-1">
          <p
            id={`${id}-context`}
            className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold text-[var(--color-accent)]"
          >
            <CornerDownRight size={13} aria-hidden="true" />
            {label}
          </p>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel reply"
            title="Cancel"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-card)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {composerField}

      <div
        className="mt-1 flex flex-wrap items-center gap-0.5"
        role="group"
        aria-label={`Add to your ${isReply ? 'reply' : 'comment'}`}
      >
        <ToolbarButton
          label="Add images"
          isActive={media.some((item) => item.type === 'image')}
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Add GIFs"
          isActive={media.some((item) => item.type === 'gif')}
          onClick={() => gifInputRef.current?.click()}
        >
          GIF
        </ToolbarButton>
        <ToolbarButton
          label="Add a poll"
          isActive={isPollOpen}
          onClick={() => setIsPollOpen((currentValue) => !currentValue)}
        >
          <BarChart3 size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Add an emoji"
          isActive={isEmojiPickerOpen}
          onClick={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}
        >
          <Smile size={17} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleMediaSelection(event, 'image')}
      />
      <input
        ref={gifInputRef}
        type="file"
        hidden
        multiple
        accept="image/gif"
        onChange={(event) => void handleMediaSelection(event, 'gif')}
      />

      {isEmojiPickerOpen ? (
        <div
          className="mt-1 flex flex-wrap gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1.5"
          aria-label="Choose an emoji"
        >
          {commentEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-[var(--color-soft-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {media.map((mediaItem) => (
            <div
              key={mediaItem.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-input)]"
            >
              <img
                src={mediaItem.url}
                alt={mediaItem.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setMedia((currentMedia) =>
                    currentMedia.filter((item) => item.id !== mediaItem.id),
                  )
                }
                aria-label={`Remove ${mediaItem.name}`}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={14} aria-hidden="true" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-white">
                {mediaItem.type}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {isPollOpen ? (
        <fieldset className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] p-3">
          <legend className="px-1 text-xs font-bold text-[var(--color-text)]">
            Poll
          </legend>
          <label className="sr-only" htmlFor={`${id}-poll-question`}>
            Poll question
          </label>
          <input
            id={`${id}-poll-question`}
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
            placeholder="Ask a question"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
          />
          <div className="mt-2 grid gap-2">
            {pollOptions.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <label
                  className="sr-only"
                  htmlFor={`${id}-poll-option-${optionIndex}`}
                >
                  Poll option {optionIndex + 1}
                </label>
                <input
                  id={`${id}-poll-option-${optionIndex}`}
                  value={option}
                  onChange={(event) =>
                    setPollOptions((currentOptions) =>
                      currentOptions.map((currentOption, currentIndex) =>
                        currentIndex === optionIndex
                          ? event.target.value
                          : currentOption,
                      ),
                    )
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
                />
                {pollOptions.length > 2 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPollOptions((currentOptions) =>
                        currentOptions.filter(
                          (_, currentIndex) => currentIndex !== optionIndex,
                        ),
                      )
                    }
                    aria-label={`Remove option ${optionIndex + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {pollOptions.length < 4 ? (
            <button
              type="button"
              onClick={() =>
                setPollOptions((currentOptions) => [...currentOptions, ''])
              }
              className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[var(--color-accent)] transition hover:bg-[var(--color-soft-accent)]"
            >
              <Plus size={14} aria-hidden="true" />
              Add option
            </button>
          ) : null}
        </fieldset>
      ) : null}

      {composerStatus ? (
        <p
          className="mt-1 text-xs font-medium text-[var(--color-muted)]"
          aria-live="polite"
        >
          {composerStatus}
        </p>
      ) : null}
    </form>
  )
}

export default CommentComposer
