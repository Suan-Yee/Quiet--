import { ImagePlus, Link2, Upload, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import Button from '../common/Button'

export const MAX_INLINE_IMAGES = 10

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1600
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type InlineImagePanelProps = {
  editor: Editor
  imageCount: number
  onClose: () => void
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('The selected image could not be read.'))
    }

    reader.onerror = () => reject(new Error('The selected image could not be read.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be prepared.'))
    image.src = source
  })
}

async function prepareImage(file: File) {
  const originalDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(originalDataUrl)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))

  if (scale === 1 && file.size <= 750_000) {
    return originalDataUrl
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.naturalWidth * scale)
  canvas.height = Math.round(image.naturalHeight * scale)

  const context = canvas.getContext('2d')

  if (!context) {
    return originalDataUrl
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const compressedDataUrl = canvas.toDataURL('image/webp', 0.82)
  return compressedDataUrl.length < originalDataUrl.length ? compressedDataUrl : originalDataUrl
}

function isValidRemoteImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function InlineImagePanel({ editor, imageCount, onClose }: InlineImagePanelProps) {
  const [uploadedImage, setUploadedImage] = useState('')
  const [fileName, setFileName] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [isPreparing, setIsPreparing] = useState(false)
  const isAtLimit = imageCount >= MAX_INLINE_IMAGES
  const imageSource = uploadedImage || remoteUrl.trim()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setError('')

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Choose an image smaller than 5 MB.')
      return
    }

    setIsPreparing(true)

    try {
      const preparedImage = await prepareImage(file)
      setUploadedImage(preparedImage)
      setFileName(file.name)
      setRemoteUrl('')
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'The selected image could not be prepared.')
    } finally {
      setIsPreparing(false)
    }
  }

  function handleRemoteUrlChange(value: string) {
    setRemoteUrl(value)
    setUploadedImage('')
    setFileName('')
    setError('')
  }

  function insertImage() {
    setError('')

    if (isAtLimit) {
      setError(`A post can contain up to ${MAX_INLINE_IMAGES} inline images.`)
      return
    }

    if (!imageSource) {
      setError('Choose an image or paste an image URL.')
      return
    }

    if (!uploadedImage && !isValidRemoteImageUrl(imageSource)) {
      setError('Enter a complete image URL beginning with http:// or https://.')
      return
    }

    if (!altText.trim()) {
      setError('Add alt text that describes the image.')
      return
    }

    const insertionPosition = editor.state.selection.to

    editor
      .chain()
      .focus()
      .insertContentAt(insertionPosition, {
        type: 'image',
        attrs: {
          src: imageSource,
          alt: altText.trim(),
          title: caption.trim(),
        },
      })
      .run()

    onClose()
  }

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-card-elevated)] px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ImagePlus size={18} aria-hidden="true" className="text-[var(--color-accent)]" />
            <h3 className="font-semibold text-[var(--color-text)]">Add inline image</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-[var(--color-secondary)]">
            This image appears inside the article. {imageCount}/{MAX_INLINE_IMAGES} images used.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inline image panel"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-secondary)] transition hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      {isAtLimit ? (
        <p className="mt-4 rounded-2xl border border-[#EBCAB8] bg-[var(--color-soft-accent)] px-4 py-3 text-sm font-medium text-[var(--color-text)]">
          You have reached the limit of {MAX_INLINE_IMAGES} inline images. Remove one from the article before adding another.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 text-sm font-semibold text-[var(--color-secondary)] transition hover:border-[var(--color-border-soft)] hover:text-[var(--color-text)]">
              <Upload size={17} aria-hidden="true" />
              {isPreparing ? 'Preparing image...' : 'Upload from device'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isPreparing}
                onChange={handleFileChange}
              />
            </label>

            <div className="relative">
              <Link2
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                type="url"
                value={remoteUrl}
                onChange={(event) => handleRemoteUrlChange(event.target.value)}
                placeholder="Or paste an image URL"
                aria-label="Inline image URL"
                className="h-11 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-card)] pl-10 pr-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
              />
            </div>

            <p className="text-xs leading-5 text-[var(--color-muted)]">
              JPG, PNG, or WebP. Maximum 5 MB. Large uploads are resized for the article.
            </p>
          </div>

          <div className="space-y-3">
            {imageSource ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
                <img src={imageSource} alt="Selected inline preview" className="h-36 w-full object-cover" />
                {fileName ? (
                  <p className="truncate border-t border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-secondary)]">
                    {fileName}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="inline-image-alt" className="text-xs font-semibold text-[var(--color-text)]">
                Alt text <span className="text-[var(--color-accent)]">Required</span>
              </label>
              <input
                id="inline-image-alt"
                type="text"
                value={altText}
                onChange={(event) => {
                  setAltText(event.target.value)
                  setError('')
                }}
                placeholder="Describe what is shown"
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label htmlFor="inline-image-caption" className="text-xs font-semibold text-[var(--color-text)]">
                Caption <span className="font-normal text-[var(--color-muted)]">Optional</span>
              </label>
              <input
                id="inline-image-caption"
                type="text"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Add context or image credit"
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-[#B54708] dark:text-[#FFB37A]">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Drag an inserted image to reposition it. Select it and press Delete to remove it.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={insertImage} disabled={isAtLimit || isPreparing}>
            Insert image
          </Button>
        </div>
      </div>
    </section>
  )
}

export default InlineImagePanel
