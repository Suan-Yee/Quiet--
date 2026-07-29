const routeLeavingClass = 'route-is-leaving'
const routeExitFallbackMs = 320

export function transitionToRoute(updateRoute: () => void) {
  const routeElement = document.querySelector<HTMLElement>('.route-transition')

  if (document.documentElement.classList.contains(routeLeavingClass)) {
    return
  }

  if (!routeElement) {
    updateRoute()
    return
  }

  const activeRouteElement = routeElement
  const root = document.documentElement
  let hasFinished = false
  let fallbackId = 0

  function finishTransition() {
    if (hasFinished) {
      return
    }

    hasFinished = true
    window.clearTimeout(fallbackId)
    activeRouteElement.removeEventListener('animationend', handleAnimationEnd)
    updateRoute()
  }

  function handleAnimationEnd(event: AnimationEvent) {
    if (
      event.animationName === 'route-exit'
      || event.animationName === 'route-exit-reduced'
    ) {
      finishTransition()
    }
  }

  root.classList.add(routeLeavingClass)
  activeRouteElement.addEventListener('animationend', handleAnimationEnd)
  fallbackId = window.setTimeout(finishTransition, routeExitFallbackMs)
}

export function finishRouteTransition() {
  document.documentElement.classList.remove(routeLeavingClass)
}
