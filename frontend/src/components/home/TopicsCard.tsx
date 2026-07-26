import { topics } from '../../data/mockPosts'

type TopicsCardProps = {
  activeTopic?: string
  onSelectTopic?: (topic: string) => void
}

function TopicsCard({ activeTopic = '', onSelectTopic }: TopicsCardProps) {
  return (
    <section className="border-y border-[var(--color-border)] py-5">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="type-kicker">Explore</p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[var(--color-text)]">
            Browse the shelves
          </h2>
        </div>
        <p className="hidden text-sm text-[var(--color-secondary)] sm:block">
          Follow a thread that catches your attention.
        </p>
      </div>

      <nav
        aria-label="Browse stories by topic"
        className="theme-scrollbar mt-4 flex gap-6 overflow-x-auto"
      >
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic?.(topic.name)}
            className={`group shrink-0 border-b-2 pb-2 text-left transition ${
              activeTopic.toLowerCase() === topic.name.toLowerCase()
                ? 'border-[var(--color-brand-panel)] text-[var(--color-text)]'
                : 'border-transparent text-[var(--color-secondary)] hover:border-[var(--color-border-soft)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="block text-sm font-semibold">{topic.name}</span>
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              {topic.postCount} {topic.postCount === 1 ? 'story' : 'stories'}
            </span>
          </button>
        ))}
      </nav>
    </section>
  )
}

export default TopicsCard
