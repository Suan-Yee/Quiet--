export type FeedTab = 'Latest' | 'Following' | 'Popular'

const tabs: FeedTab[] = ['Latest', 'Following', 'Popular']

type FeedTabsProps = {
  activeTab: FeedTab
  onChange: (tab: FeedTab) => void
}

function FeedTabs({ activeTab, onChange }: FeedTabsProps) {
  return (
    <div
      className="flex max-w-full items-center gap-6 overflow-x-auto border-b border-[var(--color-border)]"
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
            className={`relative min-h-11 shrink-0 border-b-2 px-0.5 pb-3 pt-2 text-sm font-semibold transition ${
              isActive
                ? 'border-[var(--color-brand-panel)] text-[var(--color-text)]'
                : 'border-transparent text-[var(--color-secondary)] hover:border-[var(--color-border-soft)] hover:text-[var(--color-text)]'
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
