export type FeedTab = 'Latest' | 'Following' | 'Popular'

const tabs: FeedTab[] = ['Latest', 'Following', 'Popular']

type FeedTabsProps = {
  activeTab: FeedTab
  onChange: (tab: FeedTab) => void
}

function FeedTabs({ activeTab, onChange }: FeedTabsProps) {
  return (
    <div
      className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10"
      aria-label="Feed filters"
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab

        return (
          <button
            key={tab}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-[var(--color-soft-accent)] text-[var(--color-text)] shadow-sm shadow-[#1F2933]/5 dark:text-[#FF7A2F] dark:shadow-black/10'
                : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

export default FeedTabs
