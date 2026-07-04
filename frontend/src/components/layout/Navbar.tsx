import { Menu, Search, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import quietLogo from '../../assets/quiet-logo.svg'
import { buttonStyles } from '../common/Button'
import Container from '../common/Container'
import ThemeToggle from '../common/ThemeToggle'

function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSearchTerm = searchTerm.trim()
    navigate(normalizedSearchTerm ? `/?q=${encodeURIComponent(normalizedSearchTerm)}` : '/')
    setIsMobileMenuOpen(false)
  }

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-transparent backdrop-blur-xl">
        <Container className="flex h-[72px] items-center justify-between">
          <NavLink to="/" className="group flex items-center gap-3 text-[var(--color-text)]">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm shadow-[#1F2933]/5 transition group-hover:-translate-y-0.5 group-hover:border-[var(--color-border-soft)] dark:shadow-black/10">
              <img src={quietLogo} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="font-reading text-2xl font-bold leading-none">Quiet</span>
          </NavLink>
          <ThemeToggle />
        </Container>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-transparent backdrop-blur-xl">
      <Container className="grid h-[72px] grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_minmax(280px,460px)_1fr]">
        <NavLink to="/" className="group flex items-center gap-3 text-[var(--color-text)]">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm shadow-[#1F2933]/5 transition group-hover:-translate-y-0.5 group-hover:border-[var(--color-border-soft)] dark:shadow-black/10">
            <img src={quietLogo} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="font-reading text-2xl font-bold leading-none">quiet</span>
        </NavLink>

        <form
          className="hidden h-11 items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-input)]/90 px-4 text-[var(--color-secondary)] shadow-sm shadow-[#1F2933]/5 transition focus-within:border-[var(--color-accent)] dark:shadow-black/10 md:flex"
          onSubmit={handleSearchSubmit}
        >
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search writers and posts"
            className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </form>

        <nav className="flex items-center justify-end gap-2 text-sm font-medium">
          <NavLink to="/create" className={buttonStyles('primary', 'hidden sm:inline-flex px-5')}>
            Write
          </NavLink>
          <NavLink to="/profile" className={buttonStyles('ghost', 'px-3')}>
            Profile
          </NavLink>
          <ThemeToggle />
          <button
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm shadow-[#1F2933]/5 transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] dark:shadow-black/10 md:hidden"
            type="button"
            onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </nav>
      </Container>

      {isMobileMenuOpen ? (
        <Container className="pb-4 md:hidden">
          <form
            className="flex h-11 items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-[var(--color-secondary)] shadow-sm shadow-[#1F2933]/5 transition focus-within:border-[var(--color-accent)] dark:shadow-black/10"
            onSubmit={handleSearchSubmit}
          >
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search posts"
              className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            />
          </form>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
            <NavLink
              to="/create"
              className={buttonStyles('primary', 'px-4')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Write
            </NavLink>
            <NavLink
              to="/profile"
              className={buttonStyles('secondary', 'px-4')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
          </div>
        </Container>
      ) : null}
    </header>
  )
}

export default Navbar
