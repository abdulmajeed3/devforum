import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import MarkdownRenderer from './MarkdownRenderer'

const answerSchema = z.object({
  body: z.string().min(30, 'Answer must be at least 30 characters'),
})

type AnswerFormData = z.infer<typeof answerSchema>

interface AnswerFormProps {
  initialBody?: string
  onSubmit: (body: string) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function AnswerForm({
  initialBody = '',
  onSubmit,
  onCancel,
  submitLabel = 'Post Answer',
}: AnswerFormProps) {
  const [preview, setPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: { body: initialBody },
  })

  const bodyValue = watch('body')

  const handleFormSubmit = async (data: AnswerFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data.body)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Your Answer <span className="text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                !preview ? 'bg-gray-200 text-gray-800 font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                preview ? 'bg-gray-200 text-gray-800 font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {preview ? (
          <div className="border border-gray-300 rounded-md p-4 min-h-[160px] bg-white">
            {bodyValue ? (
              <MarkdownRenderer content={bodyValue} />
            ) : (
              <p className="text-gray-400 text-sm italic">Nothing to preview yet…</p>
            )}
          </div>
        ) : (
          <Textarea
            placeholder="Write your answer here. Use code blocks for code examples."
            rows={8}
            error={errors.body?.message}
            {...register('body')}
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
