import type { PostMedia, PostMediaLayout } from '../types/post'

export const DEFAULT_POST_MEDIA_LAYOUT: PostMediaLayout = 'grid'

const PORTRAIT_ASPECT_RATIO_MAX = 0.8
const LANDSCAPE_ASPECT_RATIO_MIN = 1.4
const VISIBLE_MEDIA_LIMIT = 4

export type PostMediaLayoutRecommendation = {
  layout: PostMediaLayout
  featuredMediaId?: string
  reason: string
}

type DimensionedMedia = {
  id: string
  index: number
  aspectRatio: number
}

export function getPostMediaLayoutsForCount(
  mediaCount: number,
): readonly PostMediaLayout[] {
  if (mediaCount === 2) {
    return ['side-by-side', 'stacked']
  }

  if (mediaCount === 3) {
    return ['portrait-strip', 'featured-left', 'featured-top']
  }

  if (mediaCount === 4) {
    return ['grid', 'featured-left', 'featured-top']
  }

  return []
}

export function getDefaultPostMediaLayout(mediaCount: number): PostMediaLayout {
  if (mediaCount === 2) {
    return 'side-by-side'
  }

  if (mediaCount === 3) {
    return 'featured-left'
  }

  return DEFAULT_POST_MEDIA_LAYOUT
}

export function recommendPostMediaLayout(
  media: readonly PostMedia[],
): PostMediaLayoutRecommendation {
  const mediaCount = media.length

  if (mediaCount <= 1) {
    return {
      layout: DEFAULT_POST_MEDIA_LAYOUT,
      reason: 'A single image uses the full media frame.',
    }
  }

  const dimensionedMedia = getDimensionedMedia(media)

  if (mediaCount === 2) {
    const portraitCount = dimensionedMedia.filter(
      (item) => item.aspectRatio <= PORTRAIT_ASPECT_RATIO_MAX,
    ).length
    const landscapeMedia = dimensionedMedia.filter(
      (item) => item.aspectRatio >= LANDSCAPE_ASPECT_RATIO_MIN,
    )

    if (portraitCount === 2) {
      return {
        layout: 'side-by-side',
        reason: 'Side by side gives two portrait images equal vertical space.',
      }
    }

    if (landscapeMedia.length === 2) {
      return {
        layout: 'stacked',
        reason: 'Stacked rows give two landscape images more horizontal room.',
      }
    }

    if (landscapeMedia.length === 1) {
      return {
        layout: 'stacked',
        featuredMediaId: landscapeMedia[0].id,
        reason: 'Stacked places the landscape image in the larger first row.',
      }
    }

    return {
      layout: 'side-by-side',
      reason: 'Side by side is the most balanced fit for this pair.',
    }
  }

  if (mediaCount === 3) {
    const portraitCount = dimensionedMedia.filter(
      (item) => item.aspectRatio <= PORTRAIT_ASPECT_RATIO_MAX,
    ).length
    const firstImage = dimensionedMedia.find((item) => item.index === 0)
    const widestImage = dimensionedMedia.reduce<DimensionedMedia | undefined>(
      (widest, item) => {
        if (!widest || item.aspectRatio > widest.aspectRatio) {
          return item
        }

        return widest
      },
      undefined,
    )

    if (portraitCount === 3) {
      return {
        layout: 'portrait-strip',
        reason: 'Three portrait images fit cleanly in equal vertical columns.',
      }
    }

    if (
      widestImage
      && widestImage.aspectRatio >= LANDSCAPE_ASPECT_RATIO_MIN
    ) {
      return {
        layout: 'featured-top',
        featuredMediaId: widestImage.id,
        reason: 'The widest image works best across the featured top row.',
      }
    }

    return {
      layout: 'featured-left',
      featuredMediaId: media[0]?.id,
      reason:
        firstImage?.aspectRatio && firstImage.aspectRatio <= PORTRAIT_ASPECT_RATIO_MAX
          ? 'The first portrait image works best in the taller featured column.'
          : 'The first image leads, with two smaller supporting tiles.',
    }
  }

  return {
    layout: DEFAULT_POST_MEDIA_LAYOUT,
    reason: 'A 2 × 2 grid keeps four or more images compact and consistent.',
  }
}

export function getEffectivePostMediaLayout(
  layout: PostMediaLayout | string | undefined,
  mediaCount: number,
): PostMediaLayout {
  if (mediaCount <= 1 || mediaCount >= 5) {
    return DEFAULT_POST_MEDIA_LAYOUT
  }

  if (mediaCount === 2) {
    if (layout === 'side-by-side' || layout === 'stacked') {
      return layout
    }

    if (
      layout === 'landscape'
      || layout === 'adaptive'
      || layout === 'featured-top'
    ) {
      return 'stacked'
    }

    return 'side-by-side'
  }

  if (mediaCount === 3) {
    if (
      layout === 'portrait-strip'
      || layout === 'featured-left'
      || layout === 'featured-top'
    ) {
      return layout
    }

    if (layout === 'landscape' || layout === 'adaptive') {
      return 'featured-top'
    }

    return 'featured-left'
  }

  if (
    layout === 'grid'
    || layout === 'featured-left'
    || layout === 'featured-top'
  ) {
    return layout
  }

  if (layout === 'portrait') {
    return 'featured-left'
  }

  if (layout === 'landscape' || layout === 'adaptive') {
    return 'featured-top'
  }

  return DEFAULT_POST_MEDIA_LAYOUT
}

export function getPostMediaGridClass(
  layout: PostMediaLayout,
  visibleMediaCount: number,
) {
  if (visibleMediaCount === 2) {
    return layout === 'stacked'
      ? 'grid-cols-1 grid-rows-5'
      : 'grid-cols-2 grid-rows-1'
  }

  if (visibleMediaCount === 3) {
    if (layout === 'portrait-strip') {
      return 'grid-cols-3 grid-rows-1'
    }

    return layout === 'featured-top'
      ? 'grid-cols-2 grid-rows-3'
      : 'grid-cols-2 grid-rows-2'
  }

  if (visibleMediaCount === 4 && layout === 'featured-left') {
    return 'grid-cols-4 grid-rows-2'
  }

  if (visibleMediaCount === 4 && layout === 'featured-top') {
    return 'grid-cols-3 grid-rows-3'
  }

  return 'grid-cols-2 grid-rows-2'
}

export function getPostMediaTileClass(
  layout: PostMediaLayout,
  visibleMediaCount: number,
  index: number,
) {
  if (visibleMediaCount === 2 && layout === 'stacked') {
    return index === 0 ? 'row-span-3' : 'row-span-2'
  }

  if (visibleMediaCount === 3 && layout === 'featured-left') {
    return index === 0 ? 'row-span-2' : ''
  }

  if (visibleMediaCount === 3 && layout === 'featured-top') {
    return index === 0 ? 'col-span-2 row-span-2' : ''
  }

  if (visibleMediaCount === 4 && layout === 'featured-left') {
    if (index === 0) {
      return 'col-span-2 row-span-2'
    }

    return index === 1 ? 'col-span-2' : ''
  }

  if (visibleMediaCount === 4 && layout === 'featured-top') {
    return index === 0 ? 'col-span-3 row-span-2' : ''
  }

  return ''
}

function getDimensionedMedia(media: readonly PostMedia[]) {
  return media
    .slice(0, VISIBLE_MEDIA_LIMIT)
    .flatMap<DimensionedMedia>((item, index) => {
      const aspectRatio = getIntrinsicAspectRatio(item)

      return aspectRatio === undefined
        ? []
        : [{ id: item.id, index, aspectRatio }]
    })
}

function getIntrinsicAspectRatio(media: PostMedia | undefined) {
  if (
    media === undefined
    || typeof media.width !== 'number'
    || !Number.isFinite(media.width)
    || media.width <= 0
    || typeof media.height !== 'number'
    || !Number.isFinite(media.height)
    || media.height <= 0
  ) {
    return undefined
  }

  return media.width / media.height
}
