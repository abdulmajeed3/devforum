import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    if (response?.data && typeof response.data === 'object') {
      const data = response.data as Record<string, unknown>
      const messages = Object.entries(data).map(([key, val]) => {
        if (key === 'detail') return String(val)
        if (key === 'non_field_errors')
          return Array.isArray(val) ? val.join(', ') : String(val)
        return `${key}: ${Array.isArray(val) ? val.join(', ') : String(val)}`
      })
      return messages.join('\n')
    }
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}
