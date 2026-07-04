import Card from '../common/Card'
import { topics } from '../../data/mockPosts'

function TopicsCard() {
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-[var(--color-text)]">Topics</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-sm font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]"
          >
            {topic}
          </span>
        ))}
      </div>
    </Card>
  )
}

export default TopicsCard
