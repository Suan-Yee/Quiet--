import { Outlet } from 'react-router'
import authBackgroundDark from '../../assets/auth-bg-dark.svg'
import authBackgroundLight from '../../assets/auth-bg-light.svg'
import Navbar from './Navbar'

function AppLayout() {
  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover dark:hidden"
        src={authBackgroundLight}
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden h-full w-full object-cover dark:block"
        src={authBackgroundDark}
      />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#FAF7F0]/5 via-[#FAF7F0]/16 to-[#FAF7F0]/42 dark:from-[#17130F]/18 dark:via-[#17130F]/26 dark:to-[#17130F]/54"
        aria-hidden="true"
      />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
