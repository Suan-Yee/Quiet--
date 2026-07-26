import { BookOpenText, Rows3 } from 'lucide-react'

export type PreviewMode = 'card' | 'detail'

type PreviewModeSwitchProps = {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}

const modes = [
  { label: 'Card', value: 'card', icon: Rows3 },
  { label: 'Article', value: 'detail', icon: BookOpenText },
] satisfies Array<{ label: string; value: PreviewMode; icon: typeof Rows3 }>

function PreviewModeSwitch({ value, onChange }: PreviewModeSwitchProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1"
      role="tablist"
      aria-label="Preview format"
    >
      {modes.map((mode) => {
        const Icon = mode.icon

        return (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:px-3 ${
            value === mode.value
              ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm shadow-[rgb(var(--shadow-color)/0.12)]'
              : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
          }`}
          role="tab"
          aria-selected={value === mode.value}
        >
          <Icon aria-hidden="true" size={15} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
        )
      })}
    </div>
  )
}

export default PreviewModeSwitch
