import type { ReactNode } from 'react'
import { BookOpenText, Library, PenLine } from 'lucide-react'

type AuthLayoutProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <section className="relative flex min-h-[calc(100svh-68px)] items-center px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_28px_90px_-45px_rgb(var(--shadow-color)/0.55)] lg:min-h-[680px] lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <aside className="relative hidden overflow-hidden bg-[var(--color-brand-panel)] p-10 text-[var(--color-on-brand)] lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[var(--color-on-brand)]/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-[var(--color-highlight)]/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(125deg,transparent_45%,rgb(205_235_123_/_0.08)_100%)]"
          />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--color-highlight)]">
              Quiet reading room
            </p>
            <h2 className="mt-7 max-w-lg text-5xl font-semibold leading-[1.05] tracking-[-0.055em] xl:text-6xl">
              Make room for ideas worth returning to.
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-[var(--color-on-brand-muted)]">
              A focused place to discover thoughtful work, keep a personal library, and shape your own writing.
            </p>
          </div>

          <div className="relative grid gap-3">
            {[
              { icon: Library, label: 'Build a library', detail: 'Keep the stories that stay with you.' },
              { icon: PenLine, label: 'Write with focus', detail: 'Move from first line to published piece.' },
              { icon: BookOpenText, label: 'Return with ease', detail: 'Pick up reading and drafts where you left them.' },
            ].map(({ icon: Icon, label, detail }, index) => (
              <div
                key={label}
                className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--color-on-brand)]/12 py-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-on-brand)]/8 text-[var(--color-highlight)]">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--color-on-brand-muted)]">
                    {detail}
                  </span>
                </span>
                <span className="text-xs font-bold text-[var(--color-on-brand-muted)]">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <p className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-soft-accent)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                <BookOpenText aria-hidden="true" size={15} />
                Quiet reading room
              </p>
            </div>

            <div className="mt-7 lg:mt-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--color-text)] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--color-secondary)]">
                {subtitle}
              </p>
            </div>

            <div className="mt-8">{children}</div>

            <div className="mt-7 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-secondary)]">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthLayout
