import { Eye, FilePenLine, Save, Send } from 'lucide-react'
import Button from '../common/Button'
import type { PostStatus } from '../../types/post'

type StudioCommandBarProps = {
  title: string
  status: PostStatus
  onPreview: () => void
  onSaveDraft: () => void
  onPublish: () => void
}

function StudioCommandBar({
  title,
  status,
  onPreview,
  onSaveDraft,
  onPublish,
}: StudioCommandBarProps) {
  const statusLabel = status === 'published' ? 'Published' : status === 'archived' ? 'Archived' : 'Draft'

  return (
    <>
      <header className="sticky top-[72px] z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/92 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-accent)]">
            <FilePenLine aria-hidden="true" size={18} />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Writing room
              </p>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'published' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-highlight)]'
                }`}
                aria-hidden="true"
              />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                {statusLabel}
              </p>
            </div>
            <p className="mt-1 max-w-[42vw] truncate text-sm font-bold text-[var(--color-text)] sm:max-w-sm">
              {title.trim() || 'Untitled draft'}
            </p>
          </div>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Button type="button" variant="ghost" className="gap-2" onClick={onPreview}>
              <Eye aria-hidden="true" size={17} />
              Preview
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={onSaveDraft}>
              <Save aria-hidden="true" size={16} />
              Save draft
            </Button>
            <Button type="button" className="gap-2 px-5" onClick={onPublish}>
              <Send aria-hidden="true" size={16} />
              Publish
            </Button>
          </div>

          <button
            type="button"
            onClick={onPreview}
            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] lg:hidden"
            aria-label="Open post preview"
          >
            <Eye aria-hidden="true" size={18} />
          </button>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-card)]/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_45px_-30px_rgb(var(--shadow-color)/0.5)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)] gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="flex min-h-11 items-center justify-center rounded-xl text-[var(--color-secondary)] transition hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Open post preview"
          >
            <Eye aria-hidden="true" size={19} />
          </button>
          <Button type="button" variant="secondary" className="gap-2 px-3" onClick={onSaveDraft}>
            <Save aria-hidden="true" size={16} />
            Save
          </Button>
          <Button type="button" className="gap-2 px-3" onClick={onPublish}>
            <Send aria-hidden="true" size={16} />
            Publish
          </Button>
        </div>
      </div>
    </>
  )
}

export default StudioCommandBar
