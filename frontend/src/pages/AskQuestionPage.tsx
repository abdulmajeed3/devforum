import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { questionsApi } from '@/lib/api-helpers'
import { getErrorMessage } from '@/lib/utils'
import QuestionForm from '@/components/questions/QuestionForm'
import Alert from '@/components/ui/Alert'

export default function AskQuestionPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const createQuestion = useMutation({
    mutationFn: (data: { title: string; body: string; tag_names: string[] }) =>
      questionsApi.create(data),
    onSuccess: (question) => {
      navigate(`/questions/${question.id}`)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleSubmit = async (data: { title: string; body: string; tag_names: string[] }) => {
    setError(null)
    await createQuestion.mutateAsync(data)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
        <p className="mt-1 text-sm text-gray-500">
          Be specific and imagine you are asking a question to another developer.
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4" dismissible>
          {error}
        </Alert>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <QuestionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/questions')}
          isSubmitting={createQuestion.isPending}
          submitLabel="Post Question"
        />
      </div>
    </div>
  )
}
