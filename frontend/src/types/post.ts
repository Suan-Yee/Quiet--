import type { JSONContent } from '@tiptap/react'

export type PostAuthor = {
  name: string
  avatar: string
  description: string
}

export type PostDraft = {
  id: string
  title: string
  excerpt: string
  category: string
  status: 'Draft' | 'Published'
  coverImage: string
  userProfile: PostAuthor
  author: PostAuthor
  createdAt: string
  readTime: string
  reactionCount: number
  commentCount: number
  isReacted: boolean
  isBookmarked: boolean
  isFeatured: boolean
  quotePreview: string
  content: JSONContent
}
