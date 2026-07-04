import type { ReactNode } from 'react'
import Card from './Card'

type ErrorStateProps = {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={`mx-auto max-w-xl border-[#EBCAB8] bg-[#FFFDF9] p-8 text-center sm:p-10 ${className}`}>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1E8] text-sm font-bold text-[#FF6719]">
        !
      </div>
      <h2 className="mt-4 font-reading text-3xl font-bold leading-tight text-[#1F2933]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6B7280]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  )
}

export default ErrorState
