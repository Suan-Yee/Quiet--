import type { PostStatus } from '../../types/post'
import Button from '../common/Button'
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
  onPublish: () => void
  onSaveDraft: () => void
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
  onPublish,
  onSaveDraft,
}: PublishingSettingsProps) {
  return (
    <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10 lg:sticky lg:top-28">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Publishing
      </p>
      <h2 className="mt-2 font-reading text-2xl font-bold text-[var(--color-text)]">Settings</h2>

      <div className="mt-5 space-y-5">
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
      </div>

      <div className="mt-6 grid gap-3">
        <Button type="button" variant="primary" onClick={onPublish}>
          Publish
        </Button>
        <Button type="button" variant="secondary" onClick={onSaveDraft}>
          Save Draft
        </Button>
      </div>
    </aside>
  )
}

export default PublishingSettings
