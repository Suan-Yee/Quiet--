import { useEffect, useState } from 'react'
import { Clock3, FileText, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import RichTextEditor from '../components/post/RichTextEditor'
import PublishingSettings from '../components/post/PublishingSettings'
import PreviewModeSwitch, { type PreviewMode } from '../components/post/PreviewModeSwitch'
import ArticlePreview from '../components/post/ArticlePreview'
import StudioCommandBar from '../components/post/StudioCommandBar'
import Toast from '../components/common/Toast'
import { emptyEditorContent } from '../data/mockTiptapContent'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { topics } from '../data/mockPosts'
import type { MockPost, PostDraft, PostStatus, Topic } from '../types/post'
import { getLocalDraft, saveLocalDraft, saveLocalPost } from '../utils/localPosts'
import { getPrimaryTopic } from '../utils/postDisplay'

type ToastState = {
  title: string
  messages: string[]
  variant: 'error' | 'success'
}

function CreatePostPage() {
  const navigate = useNavigate()
  const [previewMode, setPreviewMode] = useState<PreviewMode>('card')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [objectUrl, setObjectUrl] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const [postDraft, setPostDraft] = useState<PostDraft>(() => getLocalDraft() ?? {
    id: 0,
    authorId: mockCurrentUser.id,
    postType: 'article',
    title: '',
    excerpt: '',
    contentText: '',
    contentJson: emptyEditorContent,
    coverImage: '',
    coverImagePublicId: '',
    status: 'draft',
    visibility: 'public',
    readTime: 1,
    reactionCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    topics: [topics[0]],
    author: mockCurrentUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReacted: false,
    isBookmarked: false,
    isFeatured: false,
    quotePreview: '',
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

  useEffect(() => {
    if (!isPreviewOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewOpen])

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
    return draft.contentJson.content?.some((node) => {
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

    walk(draft.contentJson)

    return textParts.join(' ')
  }

  function getTopicByName(topicName: string): Topic {
    const existingTopic = topics.find((topic) => topic.name === topicName)

    return existingTopic ?? {
      id: Date.now(),
      name: topicName,
      slug: topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  function buildPostId() {
    return Date.now()
  }

  function buildLocalPost(status: PostStatus): MockPost {
    const wordCount = getContentText(postDraft).split(/\s+/).filter(Boolean).length
    const readMinutes = Math.max(1, Math.ceil(wordCount / 220))
    const id = status === 'published' ? buildPostId() : postDraft.id

    return {
      id,
      authorId: postDraft.authorId,
      author: postDraft.author,
      postType: postDraft.postType ?? 'article',
      title: postDraft.title.trim(),
      excerpt: postDraft.excerpt.trim(),
      contentText: getContentText(postDraft),
      contentJson: postDraft.contentJson,
      coverImage: postDraft.coverImage,
      coverImagePublicId: postDraft.coverImagePublicId,
      status,
      visibility: postDraft.visibility,
      readTime: readMinutes,
      reactionCount: postDraft.reactionCount,
      commentCount: postDraft.commentCount,
      bookmarkCount: postDraft.bookmarkCount,
      topics: postDraft.topics,
      createdAt: postDraft.createdAt,
      updatedAt: new Date().toISOString(),
      isFeatured: postDraft.isFeatured,
      quotePreview: postDraft.quotePreview,
      isReacted: postDraft.isReacted,
      isBookmarked: postDraft.isBookmarked,
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

    const post = buildLocalPost('published')
    saveLocalPost(post)
    saveLocalDraft({ ...postDraft, id: post.id, status: 'published', updatedAt: post.updatedAt })
    navigate(`/posts/${post.id}`)
  }

  function handleSaveDraft() {
    saveLocalDraft({ ...postDraft, status: 'draft', updatedAt: new Date().toISOString() })
    setToast({
      title: 'Draft saved',
      messages: ['Your draft is saved locally on this device.'],
      variant: 'success',
    })
  }

  const contentWordCount = getContentText(postDraft).split(/\s+/).filter(Boolean).length
  const estimatedReadTime = Math.max(1, Math.ceil(contentWordCount / 220))
  const statusLabel = postDraft.status.charAt(0).toUpperCase() + postDraft.status.slice(1)

  return (
    <div className="min-h-[calc(100svh-72px)] pb-28 lg:pb-16">
      {toast ? (
        <Toast
          title={toast.title}
          messages={toast.messages}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}

      <StudioCommandBar
        title={postDraft.title}
        status={postDraft.status}
        onPreview={() => setIsPreviewOpen(true)}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8 lg:px-8">
        <main className="min-w-0">
          <section className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_70px_-48px_rgb(var(--shadow-color)/0.55)]">
            <header className="px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-9 lg:px-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  <FileText aria-hidden="true" size={14} />
                  Document
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--color-secondary)]">
                  <span className="rounded-lg bg-[var(--color-card-elevated)] px-2.5 py-1.5">
                    {getPrimaryTopic(postDraft.topics)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 aria-hidden="true" size={14} />
                    {estimatedReadTime} min read
                  </span>
                  <span>{statusLabel}</span>
                </div>
              </div>

            <input
              value={postDraft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Article title"
              aria-label="Article title"
              className="mt-8 w-full bg-transparent font-reading text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] sm:text-6xl"
            />
            <textarea
              value={postDraft.excerpt}
              onChange={(event) => updateDraft({ excerpt: event.target.value })}
              rows={3}
              placeholder="Add a subtitle that gives readers a reason to stay..."
              aria-label="Article subtitle or excerpt"
              className="mt-6 w-full resize-none bg-transparent text-lg leading-8 text-[var(--color-secondary)] outline-none placeholder:text-[var(--color-muted)] sm:text-xl"
            />

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5 text-xs font-semibold text-[var(--color-muted)]">
                <span>Start with the thought. Shape the structure later.</span>
                <span className="shrink-0">{contentWordCount} words</span>
              </div>
            </header>

            <RichTextEditor
              content={postDraft.contentJson}
              onChange={(contentJson) => updateDraft({
                contentJson,
                contentText: getContentText({ ...postDraft, contentJson }),
              })}
            />
          </section>

          {import.meta.env.DEV ? (
            <details className="theme-scrollbar mt-4 max-h-72 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs text-[var(--color-secondary)]">
              <summary className="cursor-pointer font-bold text-[var(--color-text)]">
                Draft JSON
              </summary>
              <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(postDraft, null, 2)}</pre>
            </details>
          ) : null}
        </main>

        <PublishingSettings
          status={postDraft.status}
          topic={getPrimaryTopic(postDraft.topics)}
          coverImage={postDraft.coverImage}
          onStatusChange={(status) => updateDraft({ status })}
          onTopicChange={(topic) => updateDraft({ topics: [getTopicByName(topic)] })}
          onCoverImageChange={handleCoverImageChange}
          onCoverImageRemove={handleCoverImageRemove}
        />
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-[var(--color-bg)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-preview-title"
        >
          <header className="flex min-h-[72px] flex-wrap items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-card)]/94 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Reader view
              </p>
              <h2 id="studio-preview-title" className="mt-1 truncate text-sm font-bold text-[var(--color-text)] sm:text-base">
                {postDraft.title.trim() || 'Untitled draft'}
              </h2>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <PreviewModeSwitch value={previewMode} onChange={setPreviewMode} />
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-secondary)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                aria-label="Close preview"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
          </header>

          <div className="theme-scrollbar flex-1 overflow-y-auto">
            <div
              className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ${
                previewMode === 'card' ? 'max-w-5xl' : 'max-w-[1080px]'
              }`}
            >
              <ArticlePreview draft={postDraft} mode={previewMode} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CreatePostPage
