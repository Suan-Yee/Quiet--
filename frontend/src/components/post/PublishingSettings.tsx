import { CloudOff, SlidersHorizontal } from 'lucide-react'
import type { PostStatus } from '../../types/post'
import CustomDropdown from '../common/CustomDropdown'
import ImageUploader from './ImageUploader'

type PublishingSettingsProps = {
  status: PostStatus
  topic: string
  coverImage: string
  onStatusChange: (status: PostStatus) => void
  onTopicChange: (topic: string) => void
  onCoverImageChange: (file: File) => void
  onCoverImageRemove: () => void
}

const topicOptions = ['Essay', 'Writing', 'Technology', 'Culture', 'Design', 'Books', 'Startups'].map(
  (topic) => ({
    label: topic,
    value: topic,
  }),
)

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]

function PublishingSettings({
  status,
  topic,
  coverImage,
  onStatusChange,
  onTopicChange,
  onCoverImageChange,
  onCoverImageRemove,
}: PublishingSettingsProps) {
  return (
    <aside className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_65px_-48px_rgb(var(--shadow-color)/0.5)] lg:sticky lg:top-[164px]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card-elevated)]/65 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-soft-accent)] text-[var(--color-accent)]">
            <SlidersHorizontal aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Inspector
            </p>
            <h2 className="mt-1 text-base font-bold text-[var(--color-text)]">Publishing setup</h2>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6">
        <CustomDropdown
          label="Topic"
          value={topic}
          options={topicOptions}
          onChange={onTopicChange}
        />

        <CustomDropdown
          label="Status"
          value={status}
          options={statusOptions}
          onChange={(value) => onStatusChange(value as PostStatus)}
        />

        <ImageUploader
          imageUrl={coverImage}
          onImageChange={onCoverImageChange}
          onImageRemove={onCoverImageRemove}
        />

        <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-xs leading-5 text-[var(--color-secondary)]">
          <CloudOff aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
          <p>
            Saving is manual. Drafts and uploaded images stay on this device until the app is connected to a backend.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default PublishingSettings
