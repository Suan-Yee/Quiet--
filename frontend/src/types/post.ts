import type { JSONContent } from '@tiptap/react'

export type User = {
  id: number
  name: string
  username: string
  email: string
  profileImage: string
  coverImage: string
  bio: string
  authorDescription: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Topic = {
  id: number
  name: string
  slug: string
  postCount: number
  createdAt: string
  updatedAt: string
}

export type PostStatus = 'draft' | 'published' | 'archived'

export type PostVisibility = 'public' | 'private' | 'subscribers'

export type Post = {
  id: number
  authorId: number
  author: User
  title: string
  excerpt: string
  contentText: string
  contentJson: JSONContent
  coverImage: string
  coverImagePublicId: string
  status: PostStatus
  visibility: PostVisibility
  readTime: number
  reactionCount: number
  commentCount: number
  bookmarkCount: number
  topics: Topic[]
  createdAt: string
  updatedAt: string
}

export type MockPost = Post & {
  isReacted: boolean
  isBookmarked: boolean
  isFeatured: boolean
  quotePreview: string
}

export type PostDraft = {
  id: number
  authorId: number
  title: string
  excerpt: string
  contentText: string
  contentJson: JSONContent
  coverImage: string
  coverImagePublicId: string
  status: PostStatus
  visibility: PostVisibility
  readTime: number
  reactionCount: number
  commentCount: number
  bookmarkCount: number
  topics: Topic[]
  author: User
  createdAt: string
  updatedAt: string
  isReacted: boolean
  isBookmarked: boolean
  isFeatured: boolean
  quotePreview: string
}
