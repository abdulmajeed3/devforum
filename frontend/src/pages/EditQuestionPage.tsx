import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { questionsApi } from '@/lib/api-helpers'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/lib/utils'
import QuestionForm from '@/components/questions/QuestionForm'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>()
  const questionId = parseInt(id ?? '0', 10)
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionsApi.get(questionId),
    enabled: !!questionId,
  })

  const updateQuestion = useMutation({
    mutationFn: (data: { title: string; body: string; tag_names: string[] }) =>
      questionsApi.update(questionId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      navigate(`/questions/${questionId}`)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <LoadingSpinner />

  if (!question) {
    return <Alert variant="error">Question not found.</Alert>
  }

  if (user?.id !== question.author.id) {
    navigate(`/questions/${questionId}`)
    return null
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
      </div>

      {error && (
        <Alert variant="error" className="mb-4" dismissible>
          {error}
        </Alert>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <QuestionForm
          initialTitle={question.title}
          initialBody={question.body}
          initialTags={question.tags.map((t) => t.name)}
          onSubmit={async (data) => { await updateQuestion.mutateAsync(data) }}
          onCancel={() => navigate(`/questions/${questionId}`)}
          isSubmitting={updateQuestion.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
