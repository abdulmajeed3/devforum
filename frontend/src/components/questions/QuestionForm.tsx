import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import TagInput from './TagInput'
import MarkdownRenderer from './MarkdownRenderer'

const questionSchema = z.object({
  title: z.string().min(15, 'Title must be at least 15 characters').max(300, 'Title too long'),
  body: z.string().min(30, 'Body must be at least 30 characters'),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionFormProps {
  initialTitle?: string
  initialBody?: string
  initialTags?: string[]
  onSubmit: (data: { title: string; body: string; tag_names: string[] }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export default function QuestionForm({
  initialTitle = '',
  initialBody = '',
  initialTags = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Post Question',
}: QuestionFormProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [preview, setPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { title: initialTitle, body: initialBody },
  })

  const bodyValue = watch('body')

  const handleFormSubmit = async (data: QuestionFormData) => {
    await onSubmit({ ...data, tag_names: tags })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Title"
        placeholder="What is your programming question? Be specific."
        error={errors.title?.message}
        helpText="Minimum 15 characters. Be descriptive about your problem."
        {...register('title')}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Body <span className="text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                !preview
                  ? 'bg-gray-200 text-gray-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                preview
                  ? 'bg-gray-200 text-gray-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {preview ? (
          <div className="border border-gray-300 rounded-md p-4 min-h-[200px] bg-white">
            {bodyValue ? (
              <MarkdownRenderer content={bodyValue} />
            ) : (
              <p className="text-gray-400 text-sm italic">Nothing to preview yet…</p>
            )}
          </div>
        ) : (
          <Textarea
            placeholder="Describe your problem in detail. Include code examples using ```language blocks."
            rows={12}
            error={errors.body?.message}
            helpText="Minimum 30 characters. Use ``` for code blocks."
            onKeyDown={(e) => {
              // Tab indentation support
              if (e.key === 'Tab') {
                e.preventDefault()
                const el = e.currentTarget
                const start = el.selectionStart
                const end = el.selectionEnd
                el.value = el.value.substring(0, start) + '  ' + el.value.substring(end)
                el.selectionStart = el.selectionEnd = start + 2
              }
            }}
            {...register('body')}
          />
        )}
      </div>

      <TagInput tags={tags} onChange={setTags} maxTags={5} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
