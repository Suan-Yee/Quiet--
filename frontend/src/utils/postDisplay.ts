import type { Post, Topic } from '../types/post'

export function formatReadTime(readTime: number) {
  return `${readTime} min read`
}

export function formatPostDate(createdAt: string) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return createdAt
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getPrimaryTopic(topics: Topic[]) {
  return topics[0]?.name ?? 'Essay'
}

export function getPostPath(post: Pick<Post, 'id'>) {
  return `/posts/${post.id}`
}
