export type PreviewMode = 'card' | 'detail'

type PreviewModeSwitchProps = {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}

const modes: Array<{ label: string; value: PreviewMode }> = [
  { label: 'Card preview', value: 'card' },
  { label: 'Article preview', value: 'detail' },
]

function PreviewModeSwitch({ value, onChange }: PreviewModeSwitchProps) {
  return (
    <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === mode.value
              ? 'bg-[var(--color-soft-accent)] text-[var(--color-text)] shadow-sm shadow-[#1F2933]/5 dark:text-[var(--color-accent)] dark:shadow-black/10'
              : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}

export default PreviewModeSwitch
