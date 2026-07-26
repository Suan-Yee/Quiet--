import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type DropdownOption = {
  label: string
  value: string
}

type CustomDropdownProps = {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

function CustomDropdown({ label, value, options, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            setActiveIndex(selectedIndex)
          }

          setIsOpen((currentValue) => !currentValue)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false)
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setIsOpen(true)
            setActiveIndex((currentIndex) =>
              Math.min((isOpen ? currentIndex : selectedIndex) + 1, options.length - 1),
            )
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setIsOpen(true)
            setActiveIndex((currentIndex) =>
              Math.max((isOpen ? currentIndex : selectedIndex) - 1, 0),
            )
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()

            if (isOpen) {
              onChange(options[activeIndex].value)
              setIsOpen(false)
            } else {
              setIsOpen(true)
            }
          }
        }}
        className="mt-2 flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-left text-sm font-semibold text-[var(--color-text)] outline-none transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-soft-accent)]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-[var(--color-muted)] transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div
          className="theme-scrollbar absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-xl shadow-[rgb(var(--shadow-color)/0.16)]"
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-[var(--color-soft-accent)] text-[var(--color-accent)]'
                    : isActive
                      ? 'bg-[var(--color-card-elevated)] text-[var(--color-text)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-card-elevated)]'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option.label}</span>
                {isSelected ? <Check size={15} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default CustomDropdown
