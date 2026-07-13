import Card from '../common/Card'
import { suggestedAuthors } from '../../data/mockPosts'

function SuggestedAuthors() {
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-[var(--color-text)]">Suggested authors</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          Curated
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {suggestedAuthors.map((author) => (
          <div
            key={author.name}
            className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-[var(--color-card-elevated)]"
          >
            <img
              src={author.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--color-border)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">{author.name}</p>
              <p className="truncate text-xs font-medium text-[var(--color-muted)]">{author.topic}</p>
            </div>
            <button
              type="button"
              aria-label={`Follow ${author.name}`}
              className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-accent)]"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SuggestedAuthors
