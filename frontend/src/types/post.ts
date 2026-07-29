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

export type PostType = 'article' | 'normal'

export type PostMediaLayout =
  | 'grid'
  | 'side-by-side'
  | 'stacked'
  | 'portrait-strip'
  | 'featured-left'
  | 'featured-top'

export type PostMediaMimeType =
  | 'image/avif'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/webp'

export type PostMedia = {
  id: string
  url: string
  alt: string
  label?: string
  width?: number
  height?: number
  mimeType: PostMediaMimeType
}

export type Post = {
  id: number
  authorId: number
  author: User
  postType?: PostType
  title: string
  excerpt: string
  contentText: string
  contentJson: JSONContent
  media?: PostMedia[]
  mediaLayout?: PostMediaLayout
  coverImage: string
  coverImagePublicId: string
  status: PostStatus
  visibility: PostVisibility
  readTime: number
  reactionCount: number
  commentCount: number
  bookmarkCount: number
  repostCount?: number
  topics: Topic[]
  createdAt: string
  updatedAt: string
  editedAt?: string
}

export type MockPost = Post & {
  isReacted: boolean
  isBookmarked: boolean
  isFeatured: boolean
  quotePreview: string
  isReposted?: boolean
}

export type PostDraft = {
  id: number
  authorId: number
  postType?: PostType
  title: string
  excerpt: string
  contentText: string
  contentJson: JSONContent
  media?: PostMedia[]
  mediaLayout?: PostMediaLayout
  coverImage: string
  coverImagePublicId: string
  status: PostStatus
  visibility: PostVisibility
  readTime: number
  reactionCount: number
  commentCount: number
  bookmarkCount: number
  repostCount?: number
  topics: Topic[]
  author: User
  createdAt: string
  updatedAt: string
  editedAt?: string
  isReacted: boolean
  isBookmarked: boolean
  isFeatured: boolean
  quotePreview: string
  isReposted?: boolean
}
