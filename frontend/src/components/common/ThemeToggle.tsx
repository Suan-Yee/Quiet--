import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_KEY = 'quiet-pages-theme'

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [isDark, theme])

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8DED2] bg-white/88 text-[#1F2933] shadow-sm shadow-[#1F2933]/5 transition hover:border-[#EBCAB8] hover:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#FF6719] focus:ring-offset-2 focus:ring-offset-[#FAF7F0] dark:border-[#3A3027] dark:bg-[#211B16] dark:text-[#F5EFE7] dark:shadow-black/10 dark:hover:border-[#FF7A2F]/50 dark:hover:bg-[#2A221B] dark:focus:ring-[#FF7A2F] dark:focus:ring-offset-[#17130F]"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
    </button>
  )
}

export default ThemeToggle
