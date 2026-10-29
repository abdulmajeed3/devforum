import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant?: Variant
  title?: string
  children: ReactNode
  dismissible?: boolean
  className?: string
}

const styles: Record<Variant, { container: string; icon: ReactNode }> = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />,
  },
}

export default function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const { container, icon } = styles[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 text-sm',
        container,
        className
      )}
      role="alert"
    >
      {icon}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="whitespace-pre-line">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="text-current opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
