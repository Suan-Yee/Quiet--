import { BookOpenText, Compass, Menu, PenLine, Search, UserRound, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import quietLogo from '../../assets/quiet-logo.svg'
import { buttonStyles } from '../common/buttonStyles'
import Container from '../common/Container'
import ThemeToggle from '../common/ThemeToggle'

const desktopNavItems = [
  { label: 'Discover', to: '/', icon: Compass },
  { label: 'My room', to: '/profile', icon: BookOpenText },
]

function Navbar() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(search).get('q') ?? '',
  )
  const isAuthPage = pathname === '/login' || pathname === '/register'

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSearchTerm = searchTerm.trim()
    navigate(normalizedSearchTerm ? `/?q=${encodeURIComponent(normalizedSearchTerm)}` : '/')
    setIsMobileMenuOpen(false)
  }

  if (isAuthPage) {
    return (
      <header className="relative z-50 border-b border-[var(--color-border)]/80 bg-[var(--color-bg)]/88 backdrop-blur-xl">
        <Container className="flex h-[68px] items-center justify-between">
          <BrandLink />
          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--color-secondary)] transition hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              <Compass aria-hidden="true" size={17} />
              Explore
            </NavLink>
            <ThemeToggle />
          </div>
        </Container>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/80 bg-[var(--color-bg)]/88 backdrop-blur-2xl">
      <Container className="flex h-[72px] items-center gap-4">
        <BrandLink />

        <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {desktopNavItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[var(--color-card-elevated)] text-[var(--color-text)]'
                    : 'text-[var(--color-secondary)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <Icon aria-hidden="true" size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <form
          className="ml-auto hidden h-11 w-full max-w-[300px] items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3.5 text-[var(--color-secondary)] transition focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-soft-accent)] md:flex"
          onSubmit={handleSearchSubmit}
        >
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search the reading room"
            aria-label="Search stories and writers"
            className="w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </form>

        <nav className="flex items-center gap-2" aria-label="Account actions">
          <NavLink to="/create" className={buttonStyles('primary', 'hidden gap-2 px-4 sm:inline-flex')}>
            <PenLine aria-hidden="true" size={16} />
            Write
          </NavLink>
          <NavLink
            to="/profile"
            aria-label="Open profile"
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] sm:inline-flex"
          >
            <UserRound aria-hidden="true" size={18} />
          </NavLink>
          <ThemeToggle />
          <button
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] lg:hidden"
            type="button"
            onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
          </button>
        </nav>
      </Container>

      {isMobileMenuOpen ? (
        <Container className="border-t border-[var(--color-border)] py-4 lg:hidden">
          <form
            className="flex h-11 items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3.5 text-[var(--color-secondary)] transition focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-soft-accent)] md:hidden"
            onSubmit={handleSearchSubmit}
          >
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search stories and writers"
              aria-label="Search stories and writers"
              className="w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            />
          </form>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {desktopNavItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--color-secondary)] transition hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon aria-hidden="true" size={17} />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/create"
              className={buttonStyles('primary', 'gap-2')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PenLine aria-hidden="true" size={16} />
              Write something
            </NavLink>
          </div>
        </Container>
      ) : null}
    </header>
  )
}

function BrandLink() {
  return (
    <NavLink to="/" className="group flex shrink-0 items-center gap-2.5 text-[var(--color-text)]">
      <img
        src={quietLogo}
        alt=""
        className="h-10 w-10 rounded-xl transition duration-200 group-hover:-rotate-2 group-hover:scale-[1.03]"
      />
      <span>
        <span className="block text-lg font-extrabold leading-none tracking-[-0.04em]">Quiet</span>
        <span className="mt-1 hidden text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)] xl:block">
          Reading room
        </span>
      </span>
    </NavLink>
  )
}

export default Navbar
