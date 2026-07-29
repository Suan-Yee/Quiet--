import type { MockPost, PostMedia, PostMediaMimeType, PostType } from '../types/post'

export const NORMAL_POST_MEDIA_LIMIT = 10

export const ACCEPTED_NORMAL_POST_MEDIA_TYPES: readonly PostMediaMimeType[] = [
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

export function isAcceptedPostMediaType(mimeType: string): mimeType is PostMediaMimeType {
  return ACCEPTED_NORMAL_POST_MEDIA_TYPES.some((acceptedType) => acceptedType === mimeType)
}

export function validateNormalPostMedia<T extends Pick<File, 'type'>>(files: readonly T[]) {
  const imageFiles = files.filter((file) => isAcceptedPostMediaType(file.type))

  return {
    acceptedFiles: imageFiles.slice(0, NORMAL_POST_MEDIA_LIMIT),
    rejectedFiles: [
      ...files.filter((file) => !isAcceptedPostMediaType(file.type)),
      ...imageFiles.slice(NORMAL_POST_MEDIA_LIMIT),
    ],
    exceedsLimit: imageFiles.length > NORMAL_POST_MEDIA_LIMIT,
  }
}

export function getPostType(post: Pick<MockPost, 'postType'>): PostType {
  return post.postType ?? 'article'
}

export function getPostMedia(
  post: Pick<MockPost, 'media' | 'coverImage' | 'title'>,
): PostMedia[] {
  const media = (post.media ?? [])
    .filter((item) => isAcceptedPostMediaType(item.mimeType))
    .slice(0, NORMAL_POST_MEDIA_LIMIT)

  if (media.length > 0 || !post.coverImage) {
    return media
  }

  return [
    {
      id: `cover-${post.coverImage}`,
      url: post.coverImage,
      alt: post.title ? `Image for ${post.title}` : 'Post image',
      mimeType: 'image/jpeg',
    },
  ]
}

export function getPostBody(post: Pick<MockPost, 'postType' | 'contentText' | 'excerpt'>) {
  if (getPostType(post) === 'normal') {
    return post.contentText.trim() || post.excerpt.trim()
  }

  return post.excerpt.trim() || post.contentText.trim()
}

export function isPostEdited(post: Pick<MockPost, 'editedAt'>) {
  return Boolean(post.editedAt)
}

export function shouldCollapsePostBody(body: string, hasMedia: boolean) {
  const normalizedBody = body.trim()

  return (
    hasMedia
    && (normalizedBody.length > 140 || /\n\s*\n/.test(normalizedBody))
  )
}
