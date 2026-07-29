import { useEffect, useState } from 'react'
import { FileText, MessageSquareText, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import ArticleComposer from '../components/post/ArticleComposer'
import ArticlePreview from '../components/post/ArticlePreview'
import NormalPostComposer from '../components/post/NormalPostComposer'
import PreviewModeSwitch, { type PreviewMode } from '../components/post/PreviewModeSwitch'
import StudioCommandBar from '../components/post/StudioCommandBar'
import Toast from '../components/common/Toast'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { emptyEditorContent } from '../data/mockTiptapContent'
import { topics } from '../data/mockPosts'
import type { MockPost, PostDraft, PostStatus } from '../types/post'
import { getLocalDraft, saveLocalDraft, saveLocalPost } from '../utils/localPosts'

type CreateMode = 'normal' | 'article'

type ToastState = {
  title: string
  messages: string[]
  variant: 'error' | 'success'
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

function hasArticleContent(draft: PostDraft) {
  return draft.contentJson.content?.some((node) => {
    if (node.type === 'paragraph' || node.type === 'heading') {
      return node.content?.some((childNode) => Boolean(childNode.text?.trim()))
    }

    return node.type !== 'paragraph'
  })
}

function createArticleDraft(): PostDraft {
  const storedDraft = getLocalDraft()

  if (storedDraft && storedDraft.postType !== 'normal') {
    return {
      ...storedDraft,
      postType: 'article',
    }
  }

  const createdAt = new Date().toISOString()

  return {
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
    createdAt,
    updatedAt: createdAt,
    isReacted: false,
    isBookmarked: false,
    isFeatured: false,
    quotePreview: '',
  }
}

function CreatePostPage() {
  const navigate = useNavigate()
  const [createMode, setCreateMode] = useState<CreateMode>('normal')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('card')
  const [isArticlePreviewOpen, setIsArticlePreviewOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [articleDraft, setArticleDraft] = useState<PostDraft>(createArticleDraft)

  useEffect(() => {
    if (toast?.variant !== 'success') {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    if (!isArticlePreviewOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsArticlePreviewOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isArticlePreviewOpen])

  function updateArticleDraft(nextDraft: Partial<PostDraft>) {
    setToast(null)
    setArticleDraft((currentDraft) => ({
      ...currentDraft,
      ...nextDraft,
      postType: 'article',
    }))
  }

  function buildArticlePost(status: PostStatus): MockPost {
    const wordCount = getContentText(articleDraft).split(/\s+/).filter(Boolean).length
    const readMinutes = Math.max(1, Math.ceil(wordCount / 220))
    const id = status === 'published' ? Date.now() : articleDraft.id

    return {
      id,
      authorId: articleDraft.authorId,
      author: articleDraft.author,
      postType: 'article',
      title: articleDraft.title.trim(),
      excerpt: articleDraft.excerpt.trim(),
      contentText: getContentText(articleDraft),
      contentJson: articleDraft.contentJson,
      coverImage: articleDraft.coverImage,
      coverImagePublicId: articleDraft.coverImagePublicId,
      status,
      visibility: articleDraft.visibility,
      readTime: readMinutes,
      reactionCount: articleDraft.reactionCount,
      commentCount: articleDraft.commentCount,
      bookmarkCount: articleDraft.bookmarkCount,
      topics: articleDraft.topics,
      createdAt: articleDraft.createdAt,
      updatedAt: new Date().toISOString(),
      isFeatured: articleDraft.isFeatured,
      quotePreview: articleDraft.quotePreview,
      isReacted: articleDraft.isReacted,
      isBookmarked: articleDraft.isBookmarked,
    }
  }

  function validateArticleDraft() {
    const messages: string[] = []

    if (!articleDraft.title.trim()) {
      messages.push('Add a title before publishing.')
    }

    if (!articleDraft.excerpt.trim()) {
      messages.push('Add a subtitle or excerpt before publishing.')
    }

    if (!hasArticleContent(articleDraft)) {
      messages.push('Write some article content before publishing.')
    }

    return messages
  }

  function handleArticlePublish() {
    const messages = validateArticleDraft()

    if (messages.length > 0) {
      setToast({
        title: 'Before publishing',
        messages,
        variant: 'error',
      })
      return
    }

    const post = buildArticlePost('published')
    saveLocalPost(post)
    saveLocalDraft({
      ...articleDraft,
      id: post.id,
      status: 'published',
      updatedAt: post.updatedAt,
    })
    navigate(`/posts/${post.id}`)
  }

  function handleArticleSaveDraft() {
    saveLocalDraft({
      ...articleDraft,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    })
    setToast({
      title: 'Draft saved',
      messages: ['Your article draft is saved locally on this device.'],
      variant: 'success',
    })
  }

  return (
    <div className="min-h-[calc(100svh-72px)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-card)]/80">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="type-kicker">Create</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[var(--color-text)] sm:text-3xl">
              Choose how you want to share
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-secondary)]">
              Share a quick thought with images, or open the full writing room for a longer article.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Post type"
            className="grid w-full gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 sm:w-auto sm:grid-cols-2"
          >
            <button
              type="button"
              role="tab"
              id="normal-post-tab"
              aria-selected={createMode === 'normal'}
              aria-controls="normal-post-panel"
              onClick={() => setCreateMode('normal')}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                createMode === 'normal'
                  ? 'bg-[var(--color-card)] text-[var(--color-accent)] shadow-sm'
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <MessageSquareText aria-hidden="true" size={18} />
              Normal Post
            </button>
            <button
              type="button"
              role="tab"
              id="article-post-tab"
              aria-selected={createMode === 'article'}
              aria-controls="article-post-panel"
              onClick={() => setCreateMode('article')}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                createMode === 'article'
                  ? 'bg-[var(--color-card)] text-[var(--color-accent)] shadow-sm'
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <FileText aria-hidden="true" size={18} />
              Create Article
            </button>
          </div>
        </div>
      </section>

      <section
        id="normal-post-panel"
        role="tabpanel"
        aria-labelledby="normal-post-tab"
        hidden={createMode !== 'normal'}
      >
        <NormalPostComposer />
      </section>

      <section
        id="article-post-panel"
        role="tabpanel"
        aria-labelledby="article-post-tab"
        hidden={createMode !== 'article'}
        className="pb-28 lg:pb-16"
      >
        {toast ? (
          <Toast
            title={toast.title}
            messages={toast.messages}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        ) : null}

        <StudioCommandBar
          title={articleDraft.title}
          status={articleDraft.status}
          onPreview={() => setIsArticlePreviewOpen(true)}
          onSaveDraft={handleArticleSaveDraft}
          onPublish={handleArticlePublish}
        />

        <ArticleComposer
          draft={articleDraft}
          onDraftChange={updateArticleDraft}
        />
      </section>

      {isArticlePreviewOpen ? (
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
                {articleDraft.title.trim() || 'Untitled draft'}
              </h2>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <PreviewModeSwitch value={previewMode} onChange={setPreviewMode} />
              <button
                type="button"
                onClick={() => setIsArticlePreviewOpen(false)}
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
              <ArticlePreview draft={articleDraft} mode={previewMode} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CreatePostPage
