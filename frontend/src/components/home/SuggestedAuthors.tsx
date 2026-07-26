import { suggestedAuthors } from '../../data/mockPosts'

function SuggestedAuthors() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="type-kicker">New voices</p>
          <h2 className="type-section-title mt-2">
            Writers worth meeting
          </h2>
        </div>
        <span className="hidden text-sm text-[var(--color-secondary)] sm:block">
          Selected by Quiet
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {suggestedAuthors.map((author) => (
          <article
            key={author.name}
            className="group flex min-h-48 flex-col rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)]"
          >
            <div className="flex items-center gap-3">
              <img
                src={author.avatar}
                alt=""
                className="h-11 w-11 rounded-[12px] object-cover ring-1 ring-[var(--color-border)]"
              />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[var(--color-text)]">
                  {author.name}
                </h3>
                <p className="truncate text-xs font-medium text-[var(--color-muted)]">
                  {author.topic}
                </p>
              </div>
            </div>

            <p className="mt-4 flex-1 text-sm leading-6 text-[var(--color-secondary)]">
              {author.description}
            </p>

            <button
              type="button"
              aria-label={`Follow ${author.name}`}
              className="mt-4 inline-flex min-h-10 w-fit items-center border-b border-[var(--color-text)] text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Follow
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SuggestedAuthors
