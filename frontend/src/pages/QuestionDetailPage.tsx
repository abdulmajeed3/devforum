import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { questionsApi } from '@/lib/api-helpers'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage, timeAgo } from '@/lib/utils'
import VoteControls from '@/components/questions/VoteControls'
import MarkdownRenderer from '@/components/questions/MarkdownRenderer'
import AnswerCard from '@/components/questions/AnswerCard'
import AnswerForm from '@/components/questions/AnswerForm'
import CommentItem from '@/components/questions/CommentItem'
import CommentForm from '@/components/questions/CommentForm'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const questionId = parseInt(id ?? '0', 10)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionsApi.get(questionId),
    enabled: !!questionId,
  })

  const deleteQuestion = useMutation({
    mutationFn: () => questionsApi.delete(questionId),
    onSuccess: () => navigate('/questions'),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const acceptAnswer = useMutation({
    mutationFn: (answerId: number) => questionsApi.acceptAnswer(questionId, answerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const unacceptAnswer = useMutation({
    mutationFn: (answerId: number) => questionsApi.unacceptAnswer(questionId, answerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const postAnswer = useMutation({
    mutationFn: (body: string) => questionsApi.createAnswer(questionId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const postComment = useMutation({
    mutationFn: (body: string) => questionsApi.createComment(questionId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !question) {
    return (
      <EmptyState
        title="Question not found"
        description="This question may have been deleted or doesn't exist."
        action={{ label: 'Back to Questions', onClick: () => navigate('/questions') }}
      />
    )
  }

  const isAuthor = user?.id === question.author.id

  const handleDelete = () => {
    if (!confirm('Delete this question? This cannot be undone.')) return
    deleteQuestion.mutate()
  }

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.is_accepted && !b.is_accepted) return -1
    if (!a.is_accepted && b.is_accepted) return 1
    return b.vote_score - a.vote_score
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-1.5">
        <Link to="/questions" className="hover:text-blue-600">Questions</Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs">{question.title}</span>
      </nav>

      {error && (
        <Alert variant="error" dismissible>
          {error}
        </Alert>
      )}

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-2 mb-3 flex-wrap">
          {question.status === 'solved' && <Badge variant="success">Solved</Badge>}
          {question.status === 'closed' && <Badge variant="gray">Closed</Badge>}
          {question.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.slug}`}
              className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

        <div className="flex gap-4">
          <VoteControls
            targetType="question"
            targetId={questionId}
            voteScore={question.vote_score}
            userVote={question.user_vote}
            questionId={questionId}
          />
          <div className="flex-1">
            <MarkdownRenderer content={question.body} />

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isAuthor && (
                  <>
                    <Link
                      to={`/questions/${questionId}/edit`}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Avatar user={question.author} size="xs" />
                <Link to={`/users/${question.author.username}`} className="font-medium hover:text-blue-600">
                  {question.author.display_name || question.author.username}
                </Link>
                <span>asked {timeAgo(question.created_at)}</span>
                {question.updated_at !== question.created_at && (
                  <span>· edited {timeAgo(question.updated_at)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments on question */}
        {question.comments.length > 0 && (
          <div className="mt-4 pl-16 border-t border-gray-100 pt-3">
            <div className="pl-2 border-l-2 border-gray-100">
              {question.comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          </div>
        )}
        <div className="mt-2 pl-16">
          <CommentForm onSubmit={async (body) => { await postComment.mutateAsync(body) }} />
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          {sortedAnswers.length} Answer{sortedAnswers.length !== 1 ? 's' : ''}
        </h2>

        {sortedAnswers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            <p>No answers yet. Be the first to help!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAnswers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                questionId={questionId}
                isQuestionAuthor={isAuthor}
                onAccept={(aid) => acceptAnswer.mutate(aid)}
                onUnaccept={(aid) => unacceptAnswer.mutate(aid)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
        {isAuthenticated ? (
          <AnswerForm
            onSubmit={async (body) => { await postAnswer.mutateAsync(body) }}
          />
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="mb-3">You need to be signed in to post an answer.</p>
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in to answer
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
