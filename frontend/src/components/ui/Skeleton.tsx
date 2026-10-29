import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-gray-200', className)}
      aria-hidden="true"
    />
  )
}

export function QuestionCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
      <div className="flex flex-col items-center gap-2 w-16 shrink-0">
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}
