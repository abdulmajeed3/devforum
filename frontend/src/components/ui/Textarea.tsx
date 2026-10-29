import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
            'placeholder:text-gray-400 font-mono',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition duration-150 resize-y min-h-[120px]',
            error
              ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500'
              : 'border-gray-300 bg-white text-gray-900',
            className
          )}
          {...props}
        />
        {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea
