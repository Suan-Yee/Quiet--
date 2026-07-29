import { useEffect, useState } from 'react'
import { Clock3, FileText } from 'lucide-react'
import { topics } from '../../data/mockPosts'
import type { PostDraft, Topic } from '../../types/post'
import { getPrimaryTopic } from '../../utils/postDisplay'
import PublishingSettings from './PublishingSettings'
import RichTextEditor from './RichTextEditor'

type ArticleComposerProps = {
  draft: PostDraft
  onDraftChange: (nextDraft: Partial<PostDraft>) => void
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

function ArticleComposer({ draft, onDraftChange }: ArticleComposerProps) {
  const [objectUrl, setObjectUrl] = useState('')

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  function handleCoverImageChange(file: File) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    const url = URL.createObjectURL(file)

    setObjectUrl(url)
    onDraftChange({ coverImage: url })

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDraftChange({ coverImage: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  function handleCoverImageRemove() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    setObjectUrl('')
    onDraftChange({ coverImage: '' })
  }

  const contentWordCount = getContentText(draft).split(/\s+/).filter(Boolean).length
  const estimatedReadTime = Math.max(1, Math.ceil(contentWordCount / 220))
  const statusLabel = draft.status.charAt(0).toUpperCase() + draft.status.slice(1)

  return (
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
                  {getPrimaryTopic(draft.topics)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" size={14} />
                  {estimatedReadTime} min read
                </span>
                <span>{statusLabel}</span>
              </div>
            </div>

            <input
              value={draft.title}
              onChange={(event) => onDraftChange({ title: event.target.value })}
              placeholder="Article title"
              aria-label="Article title"
              className="mt-8 w-full bg-transparent font-reading text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] sm:text-6xl"
            />
            <textarea
              value={draft.excerpt}
              onChange={(event) => onDraftChange({ excerpt: event.target.value })}
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
            content={draft.contentJson}
            onChange={(contentJson) => onDraftChange({
              contentJson,
              contentText: getContentText({ ...draft, contentJson }),
            })}
          />
        </section>

        {import.meta.env.DEV ? (
          <details className="theme-scrollbar mt-4 max-h-72 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs text-[var(--color-secondary)]">
            <summary className="cursor-pointer font-bold text-[var(--color-text)]">
              Draft JSON
            </summary>
            <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(draft, null, 2)}</pre>
          </details>
        ) : null}
      </main>

      <PublishingSettings
        status={draft.status}
        topic={getPrimaryTopic(draft.topics)}
        coverImage={draft.coverImage}
        onStatusChange={(status) => onDraftChange({ status })}
        onTopicChange={(topic) => onDraftChange({ topics: [getTopicByName(topic)] })}
        onCoverImageChange={handleCoverImageChange}
        onCoverImageRemove={handleCoverImageRemove}
      />
    </div>
  )
}

export default ArticleComposer
