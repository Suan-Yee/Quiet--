import type { User } from './post'

export type CommentAuthor = Pick<
  User,
  'id' | 'name' | 'username' | 'profileImage'
>

export type CommentMedia = {
  id: string
  type: 'image' | 'gif'
  url: string
  name: string
}

export type CommentPoll = {
  question: string
  options: string[]
}

export type CommentContent = {
  body: string
  media?: CommentMedia[]
  poll?: CommentPoll | null
}

export type NewPostComment = CommentContent & {
  parentId?: string | null
  replyToId?: string | null
}

export type PostComment = {
  id: string
  postId: number
  authorId: number
  author: CommentAuthor
  body: string
  parentId: string | null
  replyToId?: string | null
  media?: CommentMedia[]
  poll?: CommentPoll | null
  createdAt: string
  updatedAt: string
}
