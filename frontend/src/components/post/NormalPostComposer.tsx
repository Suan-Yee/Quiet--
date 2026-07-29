import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import {
  Eye,
  ImagePlus,
  Images,
  Send,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { mockCurrentUser } from '../../data/mockCurrentUser'
import { emptyEditorContent } from '../../data/mockTiptapContent'
import { topics } from '../../data/mockPosts'
import type {
  MockPost,
  PostMedia,
  PostMediaLayout,
  PostMediaMimeType,
} from '../../types/post'
import { saveLocalPost } from '../../utils/localPosts'
import {
  ACCEPTED_NORMAL_POST_MEDIA_TYPES,
  NORMAL_POST_MEDIA_LIMIT,
  isAcceptedPostMediaType,
  validateNormalPostMedia,
} from '../../utils/normalPost'
import {
  getEffectivePostMediaLayout,
  recommendPostMediaLayout,
} from '../../utils/postMediaLayout'
import Button from '../common/Button'
import Toast from '../common/Toast'
import NormalPostPreview from './NormalPostPreview'

type ToastState = {
  title: string
  messages: string[]
  variant: 'error' | 'success'
}

function createMediaId() {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `normal-media-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getImageAlt(fileName: string) {
  const readableName = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  return readableName || 'Uploaded post image'
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The image dimensions could not be read.'))
    image.src = source
  })
}

function prepareStillImage(
  source: string,
  image: HTMLImageElement,
  originalMimeType: PostMediaMimeType,
): Pick<PostMedia, 'url' | 'mimeType'> {
  const maximumDimension = 1440
  const scale = Math.min(
    1,
    maximumDimension / Math.max(image.naturalWidth, image.naturalHeight),
  )
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return {
      url: source,
      mimeType: originalMimeType,
    }
  }

  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const compressedSource = canvas.toDataURL('image/webp', 0.78)

  if (compressedSource.length >= source.length) {
    return {
      url: source,
      mimeType: originalMimeType,
    }
  }

  return {
    url: compressedSource,
    mimeType: 'image/webp',
  }
}

function readFileAsPostMedia(file: File): Promise<PostMedia> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Could not read ${file.name}.`))
        return
      }

      try {
        const image = await loadImage(reader.result)
        const preparedImage =
          file.type === 'image/gif'
            ? {
                url: reader.result,
                mimeType: file.type as PostMediaMimeType,
              }
            : prepareStillImage(
                reader.result,
                image,
                file.type as PostMediaMimeType,
              )

        resolve({
          id: createMediaId(),
          ...preparedImage,
          alt: getImageAlt(file.name),
          width: image.naturalWidth,
          height: image.naturalHeight,
        })
      } catch {
        reject(new Error(`Could not prepare ${file.name}.`))
      }
    }

    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function getLayoutLabel(layout: PostMediaLayout) {
  if (layout === 'side-by-side') {
    return 'Side by side'
  }

  if (layout === 'stacked') {
    return 'Stacked'
  }

  if (layout === 'portrait-strip') {
    return 'Portrait row'
  }

  if (layout === 'featured-left') {
    return 'Feature left'
  }

  if (layout === 'featured-top') {
    return 'Feature top'
  }

  return '2 × 2 grid'
}

function NormalPostComposer() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)
  const [text, setText] = useState('')
  const [media, setMedia] = useState<PostMedia[]>([])
  const [labelsEnabled, setLabelsEnabled] = useState(false)
  const [mediaLayout, setMediaLayout] = useState<PostMediaLayout>('grid')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)

  function hasFiles(event: DragEvent<HTMLElement>) {
    return Array.from(event.dataTransfer.types).includes('Files')
  }

  async function addFiles(files: File[]) {
    setUploadErrors([])
    setToast(null)

    const remainingCapacity = NORMAL_POST_MEDIA_LIMIT - media.length

    if (remainingCapacity <= 0) {
      setUploadErrors([`A normal post can contain up to ${NORMAL_POST_MEDIA_LIMIT} images.`])
      return
    }

    const validation = validateNormalPostMedia(files)
    const acceptedFiles = validation.acceptedFiles.slice(0, remainingCapacity)
    const unsupportedFileCount = files.filter(
      (file) => !isAcceptedPostMediaType(file.type),
    ).length
    const acceptedTypeCount = files.length - unsupportedFileCount
    const rejectedForCapacity = Math.max(0, acceptedTypeCount - acceptedFiles.length)
    const nextErrors: string[] = []

    if (unsupportedFileCount > 0) {
      nextErrors.push(
        `${unsupportedFileCount} ${unsupportedFileCount === 1 ? 'file was' : 'files were'} skipped. Only images and GIFs are supported; video is not accepted.`,
      )
    }

    if (rejectedForCapacity > 0) {
      nextErrors.push(
        `${rejectedForCapacity} ${rejectedForCapacity === 1 ? 'image was' : 'images were'} skipped because the 10-image limit was reached.`,
      )
    }

    if (acceptedFiles.length === 0) {
      setUploadErrors(nextErrors)
      return
    }

    try {
      const uploadedMedia = await Promise.all(acceptedFiles.map(readFileAsPostMedia))
      const nextMedia = [...media, ...uploadedMedia]
      const nextCount = nextMedia.length

      setMedia(nextMedia)
      setMediaLayout((currentLayout) =>
        getEffectivePostMediaLayout(currentLayout, nextMedia.length),
      )
      setUploadStatus(
        `${uploadedMedia.length} ${uploadedMedia.length === 1 ? 'image' : 'images'} added. ${nextCount} of ${NORMAL_POST_MEDIA_LIMIT} used.`,
      )
      setUploadErrors(nextErrors)
    } catch (error) {
      setUploadErrors([
        error instanceof Error ? error.message : 'One or more images could not be read.',
        ...nextErrors,
      ])
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current += 1
    setIsDraggingFiles(true)
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)

    if (dragDepthRef.current === 0) {
      setIsDraggingFiles(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = 0
    setIsDraggingFiles(false)
    void addFiles(Array.from(event.dataTransfer.files))
  }

  function removeMedia(mediaId: string) {
    const nextMedia = media.filter((item) => item.id !== mediaId)

    setMedia(nextMedia)
    setMediaLayout((currentLayout) =>
      getEffectivePostMediaLayout(currentLayout, nextMedia.length),
    )
    setUploadStatus(
      nextMedia.length > 0
        ? `${nextMedia.length} of ${NORMAL_POST_MEDIA_LIMIT} images selected.`
        : 'All images removed.',
    )
  }

  function updateMediaLabel(mediaId: string, label: string) {
    setMedia((currentMedia) =>
      currentMedia.map((item) => (item.id === mediaId ? { ...item, label } : item)),
    )
  }

  function handlePreviewMediaChange(nextMedia: PostMedia[]) {
    setMedia(nextMedia)
    setMediaLayout((currentLayout) =>
      getEffectivePostMediaLayout(currentLayout, nextMedia.length),
    )
  }

  function validatePost() {
    if (text.trim() || media.length > 0) {
      return []
    }

    return ['Write something or add at least one image before publishing.']
  }

  function buildNormalPost(): MockPost {
    const publishedAt = new Date().toISOString()
    const publishedMedia = media.map((item) => ({
      ...item,
      label: labelsEnabled && item.label?.trim() ? item.label.trim() : undefined,
    }))

    return {
      id: Date.now(),
      authorId: mockCurrentUser.id,
      author: mockCurrentUser,
      postType: 'normal',
      title: '',
      excerpt: '',
      contentText: text.trim(),
      contentJson: emptyEditorContent,
      media: publishedMedia,
      mediaLayout: getEffectivePostMediaLayout(mediaLayout, media.length),
      coverImage: publishedMedia[0]?.url ?? '',
      coverImagePublicId: '',
      status: 'published',
      visibility: 'public',
      readTime: 1,
      reactionCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      repostCount: 0,
      topics: [topics[0]],
      createdAt: publishedAt,
      updatedAt: publishedAt,
      isFeatured: false,
      quotePreview: '',
      isReacted: false,
      isBookmarked: false,
      isReposted: false,
    }
  }

  function handlePublish() {
    const validationMessages = validatePost()

    if (validationMessages.length > 0) {
      setToast({
        title: 'Before publishing',
        messages: validationMessages,
        variant: 'error',
      })
      return
    }

    try {
      saveLocalPost(buildNormalPost())
      navigate('/')
    } catch {
      setIsPreviewOpen(false)
      setToast({
        title: 'Could not save this post',
        messages: [
          'The selected images are too large for local demo storage. Try smaller image files or fewer GIFs.',
        ],
        variant: 'error',
      })
    }
  }

  const canAddMoreImages = media.length < NORMAL_POST_MEDIA_LIMIT
  const canPreview = Boolean(text.trim() || media.length > 0)
  const layoutRecommendation = recommendPostMediaLayout(media)

  return (
    <div className="pb-24 sm:pb-16">
      {toast ? (
        <Toast
          title={toast.title}
          messages={toast.messages}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8 lg:px-8">
        <main className="min-w-0">
          <section className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_70px_-48px_rgb(var(--shadow-color)/0.55)]">
            <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-5 sm:px-8">
              <img
                src={mockCurrentUser.profileImage}
                alt=""
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-border)]"
              />
              <div>
                <p className="text-sm font-extrabold text-[var(--color-text)]">
                  @{mockCurrentUser.username}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  Normal post · Public
                </p>
              </div>
            </header>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <label htmlFor="normal-post-text" className="sr-only">
                Post text
              </label>
              <textarea
                id="normal-post-text"
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  setToast(null)
                }}
                rows={8}
                maxLength={5000}
                placeholder="What would you like to share?"
                className="min-h-48 w-full resize-y bg-transparent text-lg leading-8 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] sm:text-xl"
              />
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4 text-xs font-semibold text-[var(--color-muted)]">
                <span>Text and images only</span>
                <span className="tabular-nums">{text.length}/5,000</span>
              </div>
            </div>
          </section>

          <section
            className="mt-5 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6"
            aria-labelledby="normal-post-media-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="type-kicker">Media</p>
                <h2 id="normal-post-media-title" className="mt-1.5 text-lg font-extrabold text-[var(--color-text)]">
                  Add images
                </h2>
                <p
                  id="normal-post-media-help"
                  className="mt-1 text-sm leading-6 text-[var(--color-secondary)]"
                >
                  Up to 10 images. GIFs are allowed; videos are not accepted.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={labelsEnabled}
                onClick={() => setLabelsEnabled((currentValue) => !currentValue)}
                className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 text-sm font-bold text-[var(--color-text)] transition hover:border-[var(--color-border-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <Tag aria-hidden="true" size={17} />
                Image labels
                <span
                  aria-hidden="true"
                  className={`relative h-5 w-9 rounded-full transition ${
                    labelsEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-soft)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      labelsEnabled ? 'left-[1.125rem]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              id="normal-post-media-input"
              type="file"
              multiple
              accept={ACCEPTED_NORMAL_POST_MEDIA_TYPES.join(',')}
              onChange={handleFileInputChange}
              aria-describedby="normal-post-media-help normal-post-upload-status"
              className="sr-only"
            />

            {canAddMoreImages && media.length === 0 ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                  isDraggingFiles
                    ? 'border-[var(--color-accent)] bg-[var(--color-soft-accent)]'
                    : 'border-[var(--color-border-soft)] bg-[var(--color-bg)]'
                }`}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-card-elevated)] text-[var(--color-accent)]">
                  <ImagePlus aria-hidden="true" size={22} />
                </span>
                <p className="mt-3 text-sm font-extrabold text-[var(--color-text)]">
                  Drop images here
                </p>
                <p className="mt-1 text-xs text-[var(--color-secondary)]">
                  or choose them from your device
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Images aria-hidden="true" size={16} />
                  Choose images
                </Button>
              </div>
            ) : canAddMoreImages ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-5 flex min-h-16 flex-wrap items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 transition ${
                  isDraggingFiles
                    ? 'border-[var(--color-accent)] bg-[var(--color-soft-accent)]'
                    : 'border-[var(--color-border-soft)] bg-[var(--color-bg)]'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-card-elevated)] text-[var(--color-accent)]">
                  <ImagePlus aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[var(--color-text)]">
                    Add more images
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-secondary)]">
                    Drop here or choose from your device
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 gap-2 px-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Images aria-hidden="true" size={16} />
                  Choose
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[var(--color-card-elevated)] px-4 py-3 text-sm font-semibold text-[var(--color-secondary)]">
                You have reached the 10-image limit.
              </div>
            )}

            {media.length > 0 ? (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {media.map((item, index) => (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
                  >
                    <div className="relative h-40">
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-lg bg-black/55 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Trash2 aria-hidden="true" size={18} />
                      </button>
                    </div>

                    {labelsEnabled ? (
                      <div className="p-3">
                        <label
                          htmlFor={`normal-post-label-${item.id}`}
                          className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[var(--color-muted)]"
                        >
                          Image label
                        </label>
                        <input
                          id={`normal-post-label-${item.id}`}
                          value={item.label ?? ''}
                          onChange={(event) => updateMediaLabel(item.id, event.target.value)}
                          maxLength={120}
                          placeholder="Optional caption"
                          className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-soft-accent)]"
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <p
              id="normal-post-upload-status"
              aria-live="polite"
              className="mt-4 text-xs font-semibold text-[var(--color-secondary)]"
            >
              {uploadStatus}
            </p>
            {uploadErrors.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs font-semibold text-[var(--color-danger)]" role="alert">
                {uploadErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </main>

        <aside className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 lg:sticky lg:top-[92px]">
          <p className="type-kicker">Before posting</p>
          <h2 className="mt-1.5 text-lg font-extrabold text-[var(--color-text)]">
            Preview your post
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-secondary)]">
            Review labels and drag images into the order you want readers to see.
          </p>

          <dl className="mt-5 space-y-3 border-y border-[var(--color-border)] py-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-secondary)]">Images</dt>
              <dd className="font-extrabold text-[var(--color-text)]">{media.length}/10</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-secondary)]">Labels</dt>
              <dd className="font-extrabold text-[var(--color-text)]">
                {labelsEnabled ? 'On' : 'Off'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-secondary)]">Suggested layout</dt>
              <dd className="font-extrabold text-[var(--color-text)]">
                {media.length === 0
                  ? 'Add images'
                  : media.length === 1
                    ? 'Full frame'
                    : getLayoutLabel(layoutRecommendation.layout)}
              </dd>
            </div>
          </dl>

          {media.length > 1 ? (
            <div className="mt-4 flex gap-3 rounded-xl bg-[var(--color-soft-accent)] p-3 text-xs leading-5 text-[var(--color-secondary)]">
              <Sparkles
                aria-hidden="true"
                size={17}
                className="mt-0.5 shrink-0 text-[var(--color-accent)]"
              />
              <div>
                <p className="font-extrabold text-[var(--color-text)]">
                  Automatically recommended
                </p>
                <p className="mt-0.5">{layoutRecommendation.reason}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!canPreview}
            >
              <Eye aria-hidden="true" size={17} />
              Preview & arrange
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={handlePublish}
              disabled={!canPreview}
            >
              <Send aria-hidden="true" size={16} />
              Publish now
            </Button>
          </div>
        </aside>
      </div>

      {isPreviewOpen ? (
        <NormalPostPreview
          text={text}
          media={media}
          labelsEnabled={labelsEnabled}
          mediaLayout={mediaLayout}
          onMediaChange={handlePreviewMediaChange}
          onMediaLayoutChange={setMediaLayout}
          onClose={() => setIsPreviewOpen(false)}
          onPublish={handlePublish}
        />
      ) : null}
    </div>
  )
}

export default NormalPostComposer
