import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import RichTextEditor from '../components/post/RichTextEditor'
import PublishingSettings from '../components/post/PublishingSettings'
import PreviewModeSwitch, { type PreviewMode } from '../components/post/PreviewModeSwitch'
import ArticlePreview from '../components/post/ArticlePreview'
import Toast from '../components/common/Toast'
import { emptyEditorContent } from '../data/mockTiptapContent'
import { mockCurrentUser } from '../data/mockCurrentUser'
import type { MockPost } from '../data/mockPosts'
import type { PostDraft } from '../types/post'
import { getLocalDraft, saveLocalDraft, saveLocalPost } from '../utils/localPosts'

type ToastState = {
  title: string
  messages: string[]
  variant: 'error' | 'success'
}

function CreatePostPage() {
  const navigate = useNavigate()
  const [previewMode, setPreviewMode] = useState<PreviewMode>('card')
  const [objectUrl, setObjectUrl] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const [postDraft, setPostDraft] = useState<PostDraft>(() => getLocalDraft() ?? {
    id: 'draft-post',
    title: '',
    excerpt: '',
    category: 'Essay',
    status: 'Draft',
    coverImage: '',
    userProfile: mockCurrentUser,
    author: mockCurrentUser,
    createdAt: 'Today',
    readTime: '1 min read',
    reactionCount: 0,
    commentCount: 0,
    isReacted: false,
    isBookmarked: false,
    isFeatured: false,
    quotePreview: '',
    content: emptyEditorContent,
  })

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  useEffect(() => {
    if (toast?.variant !== 'success') {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  function updateDraft(nextDraft: Partial<PostDraft>) {
    setToast(null)
    setPostDraft((currentDraft) => ({
      ...currentDraft,
      ...nextDraft,
    }))
  }

  function handleCoverImageChange(file: File) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    const url = URL.createObjectURL(file)

    setObjectUrl(url)
    updateDraft({ coverImage: url })

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDraft({ coverImage: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  function handleCoverImageRemove() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    setObjectUrl('')
    updateDraft({ coverImage: '' })
  }

  function hasArticleContent(draft: PostDraft) {
    return draft.content.content?.some((node) => {
      if (node.type === 'paragraph') {
        return node.content?.some((childNode) => Boolean(childNode.text?.trim()))
      }

      if (node.type === 'heading') {
        return node.content?.some((childNode) => Boolean(childNode.text?.trim()))
      }

      return node.type !== 'paragraph'
    })
  }

  function getContentText(draft: PostDraft) {
    const textParts: string[] = []

    function walk(node: unknown) {
      if (!node || typeof node !== 'object') {
        return
      }

      if ('text' in node && typeof node.text === 'string') {
        textParts.push(node.text)
      }

      if ('content' in node && Array.isArray(node.content)) {
        node.content.forEach(walk)
      }
    }

    walk(draft.content)

    return textParts.join(' ')
  }

  function buildPostId(title: string) {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return `${slug || 'post'}-${Date.now()}`
  }

  function buildLocalPost(status: 'Draft' | 'Published'): MockPost {
    const wordCount = getContentText(postDraft).split(/\s+/).filter(Boolean).length
    const readMinutes = Math.max(1, Math.ceil(wordCount / 220))
    const id = status === 'Published' ? buildPostId(postDraft.title) : postDraft.id

    return {
      id,
      title: postDraft.title.trim(),
      preview: postDraft.excerpt.trim(),
      category: postDraft.category,
      authorDescription: postDraft.author.description,
      author: {
        name: postDraft.author.name,
        avatar: postDraft.author.avatar,
      },
      date: postDraft.createdAt,
      readTime: `${readMinutes} min read`,
      image: postDraft.coverImage || undefined,
      isFeatured: postDraft.isFeatured,
      quotePreview: postDraft.quotePreview || undefined,
      reactionCount: postDraft.reactionCount,
      commentCount: postDraft.commentCount,
      isReacted: postDraft.isReacted,
      isBookmarked: postDraft.isBookmarked,
      content: postDraft.content,
      reactions: postDraft.reactionCount,
      comments: postDraft.commentCount,
    }
  }

  function validateDraft() {
    const messages: string[] = []

    if (!postDraft.title.trim()) {
      messages.push('Add a title before publishing.')
    }

    if (!postDraft.excerpt.trim()) {
      messages.push('Add a subtitle or excerpt before publishing.')
    }

    if (!hasArticleContent(postDraft)) {
      messages.push('Write some article content before publishing.')
    }

    return messages
  }

  function handlePublish() {
    const messages = validateDraft()

    if (messages.length > 0) {
      setToast({
        title: 'Before publishing',
        messages,
        variant: 'error',
      })
      return
    }

    const post = buildLocalPost('Published')
    saveLocalPost(post)
    saveLocalDraft({ ...postDraft, id: post.id, status: 'Published' })
    navigate(`/posts/${post.id}`)
  }

  function handleSaveDraft() {
    saveLocalDraft({ ...postDraft, status: 'Draft' })
    setToast({
      title: 'Draft saved',
      messages: ['Your draft is saved locally on this device.'],
      variant: 'success',
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {toast ? (
        <Toast
          title={toast.title}
          messages={toast.messages}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start">
        <main className="min-w-0">
          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Writing studio
            </p>
            <input
              value={postDraft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Article title"
              className="mt-4 w-full bg-transparent font-reading text-3xl font-bold leading-tight text-[var(--color-text)] outline-none placeholder:text-[#A8A29A] dark:placeholder:text-[#7D7167] sm:text-5xl"
            />
            <textarea
              value={postDraft.excerpt}
              onChange={(event) => updateDraft({ excerpt: event.target.value })}
              rows={2}
              placeholder="Write a calm subtitle or excerpt..."
              className="mt-5 w-full resize-none bg-transparent text-lg leading-8 text-[var(--color-secondary)] outline-none placeholder:text-[#A8A29A] dark:placeholder:text-[#7D7167]"
            />

            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5 text-sm font-medium text-[var(--color-secondary)]">
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]">
                {postDraft.category}
              </span>
              <span>{postDraft.status}</span>
            </div>
          </section>

          <div className="mt-7">
            <RichTextEditor
              content={postDraft.content}
              onChange={(content) => updateDraft({ content })}
            />
          </div>

          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Live preview
                </p>
                <h2 className="mt-1 font-reading text-2xl font-bold text-[var(--color-text)]">
                  Match the reader experience
                </h2>
              </div>
              <PreviewModeSwitch value={previewMode} onChange={setPreviewMode} />
            </div>
            <ArticlePreview draft={postDraft} mode={previewMode} />
          </section>

          {import.meta.env.DEV ? (
            <details className="theme-scrollbar mt-6 max-h-72 overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs text-[var(--color-secondary)]">
              <summary className="cursor-pointer font-semibold text-[var(--color-text)]">
                Draft JSON
              </summary>
              <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(postDraft, null, 2)}</pre>
            </details>
          ) : null}
        </main>

        <PublishingSettings
          status={postDraft.status}
          category={postDraft.category}
          coverImage={postDraft.coverImage}
          onStatusChange={(status) => updateDraft({ status })}
          onCategoryChange={(category) => updateDraft({ category })}
          onCoverImageChange={handleCoverImageChange}
          onCoverImageRemove={handleCoverImageRemove}
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </div>
  )
}

export default CreatePostPage
