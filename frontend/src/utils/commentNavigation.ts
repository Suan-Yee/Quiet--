const arrivalClass = 'comments-arrival'
let arrivalCleanupId = 0
let activeScrollFrameId = 0

function showCommentsArrival(
  commentsSection: HTMLElement,
  cleanupDelay = 1700,
) {
  commentsSection.classList.add(arrivalClass)
  arrivalCleanupId = window.setTimeout(() => {
    commentsSection.classList.remove(arrivalClass)
  }, cleanupDelay)
}

export function scrollToCommentsSection() {
  const commentsSection = document.getElementById('comments')

  if (!commentsSection) {
    return
  }

  const activeCommentsSection = commentsSection
  window.cancelAnimationFrame(activeScrollFrameId)
  window.clearTimeout(arrivalCleanupId)
  activeCommentsSection.classList.remove(arrivalClass)

  const startY = window.scrollY
  const scrollMarginTop =
    Number.parseFloat(
      window.getComputedStyle(activeCommentsSection).scrollMarginTop,
    )
    || 0
  const maximumScrollY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  )
  const targetY = Math.min(
    maximumScrollY,
    Math.max(
      0,
      startY
        + activeCommentsSection.getBoundingClientRect().top
        - scrollMarginTop,
    ),
  )
  const distance = targetY - startY

  if (Math.abs(distance) < 2) {
    showCommentsArrival(activeCommentsSection)
    return
  }

  const duration = Math.min(
    1100,
    Math.max(700, Math.abs(distance) * 0.42),
  )
  let startedAt: number | null = null

  showCommentsArrival(activeCommentsSection)

  function animateScroll(timestamp: number) {
    startedAt ??= timestamp
    const progress = Math.min(1, (timestamp - startedAt) / duration)
    const easedProgress =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

    window.scrollTo(0, startY + distance * easedProgress)

    if (progress < 1) {
      activeScrollFrameId = window.requestAnimationFrame(animateScroll)
      return
    }

    activeScrollFrameId = 0
  }

  activeScrollFrameId = window.requestAnimationFrame(animateScroll)
}
