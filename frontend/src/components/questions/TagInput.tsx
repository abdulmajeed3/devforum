import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  error?: string
}

export default function TagInput({ tags, onChange, maxTags = 5, error }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (value: string) => {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, '-')
    if (!normalized || tags.includes(normalized) || tags.length >= maxTags) return
    onChange([...tags, normalized])
    setInputValue('')
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags <span className="text-gray-400 font-normal">(up to {maxTags})</span>
      </label>
      <div
        className={cn(
          'flex flex-wrap gap-1.5 p-2 border rounded-md bg-white min-h-[42px]',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
          error ? 'border-red-300' : 'border-gray-300'
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-blue-600"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => inputValue && addTag(inputValue)}
            placeholder={tags.length === 0 ? 'Add tags (Enter or comma to add)' : ''}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-gray-400">Press Enter or comma to add a tag</p>
    </div>
  )
}
