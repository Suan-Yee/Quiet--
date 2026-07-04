import type { ReactNode } from 'react'

type AuthLayoutProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <section className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[#E8E1D8] bg-white/[0.92] p-6 shadow-xl shadow-[#1F2933]/10 backdrop-blur-xl dark:border-[#3A3027] dark:bg-[#211B16]/[0.94] dark:shadow-black/20 sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#B8AEA3]">{eyebrow}</p>
            <h1 className="mt-3 font-reading text-3xl font-bold leading-tight text-[#1F2933] dark:text-[#F5EFE7] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6B7280] dark:text-[#B8AEA3]">{subtitle}</p>
          </div>

          <div className="mt-7">{children}</div>

          <div className="mt-6 border-t border-[#EFE7DC] pt-5 text-center text-sm text-[#6B7280] dark:border-[#3A3027] dark:text-[#B8AEA3]">
            {footer}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthLayout
