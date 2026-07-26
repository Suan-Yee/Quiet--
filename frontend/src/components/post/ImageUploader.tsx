import { Image, X } from 'lucide-react'

type ImageUploaderProps = {
  imageUrl: string
  onImageChange: (file: File) => void
  onImageRemove: () => void
}

function ImageUploader({ imageUrl, onImageChange, onImageRemove }: ImageUploaderProps) {
  return (
    <div>
      <p className="text-sm font-bold text-[var(--color-text)]">Cover image</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
        Used in discovery and article previews. A landscape image works best.
      </p>
      {imageUrl ? (
        <div className="relative mt-3 overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)]">
          <img src={imageUrl} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-[#0C1411]/75 text-white backdrop-blur transition hover:bg-[#0C1411] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Remove cover image"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-bg)] px-4 py-4 text-sm font-bold text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]">
        <Image size={17} aria-hidden="true" />
        <span>{imageUrl ? 'Replace cover' : 'Add a cover'}</span>
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
    </div>
  )
}

export default ImageUploader
