import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { finishRouteTransition } from '../../utils/routeTransition'
import Navbar from './Navbar'

function AppLayout() {
  const location = useLocation()

  useLayoutEffect(() => {
    finishRouteTransition()
  }, [location.key])

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_12%_10%,rgb(117_199_157_/_0.14),transparent_32%),radial-gradient(circle_at_88%_0%,rgb(205_235_123_/_0.10),transparent_28%)]"
        aria-hidden="true"
      />
      <Navbar />
      <main className="relative z-10">
        <div key={location.key} className="route-transition">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
