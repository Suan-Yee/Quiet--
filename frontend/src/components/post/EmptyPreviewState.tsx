import { FileText } from 'lucide-react'
import Card from '../common/Card'

type EmptyPreviewStateProps = {
  message: string
}

function EmptyPreviewState({ message }: EmptyPreviewStateProps) {
  return (
    <Card className="border-dashed p-8 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-soft-accent)] text-[var(--color-accent)]">
        <FileText size={20} aria-hidden="true" />
      </div>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-secondary)]">{message}</p>
    </Card>
  )
}

export default EmptyPreviewState
