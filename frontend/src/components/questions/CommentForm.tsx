import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const { isAuthenticated } = useAuth()
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!isAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim().length < 10) return
    setIsSubmitting(true)
    try {
      await onSubmit(value.trim())
      setValue('')
      setExpanded(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2"
      >
        Add a comment
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a comment… (min 10 chars)"
        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        maxLength={600}
      />
      <Button type="submit" size="sm" isLoading={isSubmitting} disabled={value.trim().length < 10}>
        Add
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
        Cancel
      </Button>
    </form>
  )
}
