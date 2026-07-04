import { Image, X } from 'lucide-react'

type ImageUploaderProps = {
  imageUrl: string
  onImageChange: (file: File) => void
  onImageRemove: () => void
}

function ImageUploader({ imageUrl, onImageChange, onImageRemove }: ImageUploaderProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--color-text)]">Cover image</p>
      <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-5 text-sm font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)]">
        <Image size={17} aria-hidden="true" />
        <span>{imageUrl ? 'Replace image' : 'Choose image'}</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) {
              onImageChange(file)
            }

            event.target.value = ''
          }}
        />
      </label>

      {imageUrl ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
          <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={onImageRemove}
            className="flex w-full items-center justify-center gap-2 border-t border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-secondary)] transition hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]"
          >
            <X size={15} aria-hidden="true" />
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ImageUploader
