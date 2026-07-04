import { FileText } from 'lucide-react'
import Card from '../common/Card'

type EmptyPreviewStateProps = {
  message: string
}

function EmptyPreviewState({ message }: EmptyPreviewStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1E8] text-[#FF6719]">
        <FileText size={18} aria-hidden="true" />
      </div>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6B7280]">{message}</p>
    </Card>
  )
}

export default EmptyPreviewState
