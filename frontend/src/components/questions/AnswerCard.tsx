import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Edit2, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Answer } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { questionsApi } from '@/lib/api-helpers'
import { timeAgo } from '@/lib/utils'
import { getErrorMessage } from '@/lib/utils'
import VoteControls from './VoteControls'
import MarkdownRenderer from './MarkdownRenderer'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import AnswerForm from './AnswerForm'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'

interface AnswerCardProps {
  answer: Answer
  questionId: number
  isQuestionAuthor: boolean
  onAccept?: (answerId: number) => void
  onUnaccept?: (answerId: number) => void
}

export default function AnswerCard({
  answer,
  questionId,
  isQuestionAuthor,
  onAccept,
  onUnaccept,
}: AnswerCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwn = user?.id === answer.author.id

  const deleteMutation = useMutation({
    mutationFn: () => questionsApi.deleteAnswer(answer.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const editMutation = useMutation({
    mutationFn: (body: string) => questionsApi.updateAnswer(answer.id, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      setEditing(false)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const addCommentMutation = useMutation({
    mutationFn: (body: string) => questionsApi.createAnswerComment(answer.id, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
  })

  const handleDelete = () => {
    if (!confirm('Delete this answer?')) return
    deleteMutation.mutate()
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        answer.is_accepted ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <VoteControls
            targetType="answer"
            targetId={answer.id}
            voteScore={answer.vote_score}
            userVote={answer.user_vote}
            questionId={questionId}
          />
          {answer.is_accepted && (
            <div title="Accepted answer">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          )}
          {isQuestionAuthor && !answer.is_accepted && onAccept && (
            <button
              onClick={() => onAccept(answer.id)}
              title="Accept this answer"
              className="text-gray-300 hover:text-green-600 transition-colors"
            >
              <CheckCircle className="h-6 w-6" />
            </button>
          )}
          {isQuestionAuthor && answer.is_accepted && onUnaccept && (
            <button
              onClick={() => onUnaccept(answer.id)}
              title="Unaccept this answer"
              className="text-green-600 hover:text-gray-400 transition-colors"
            >
              <CheckCircle className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {answer.is_accepted && (
            <div className="mb-2">
              <Badge variant="success">✓ Accepted Answer</Badge>
            </div>
          )}

          {error && (
            <Alert variant="error" className="mb-3" dismissible>
              {error}
            </Alert>
          )}

          {editing ? (
            <AnswerForm
              initialBody={answer.body}
              onSubmit={async (body) => { await editMutation.mutateAsync(body) }}
              onCancel={() => setEditing(false)}
              submitLabel="Save Changes"
            />
          ) : (
            <MarkdownRenderer content={answer.body} />
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {isOwn && !editing && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Avatar user={answer.author} size="xs" />
              <Link
                to={`/users/${answer.author.username}`}
                className="font-medium hover:text-blue-600"
              >
                {answer.author.display_name || answer.author.username}
              </Link>
              <span>·</span>
              <span>{timeAgo(answer.created_at)}</span>
            </div>
          </div>

          {/* Comments */}
          {answer.comments.length > 0 && (
            <div className="mt-3 pl-3 border-l-2 border-gray-100">
              {answer.comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          )}
          <div className="mt-2">
            <CommentForm
              onSubmit={async (body) => { await addCommentMutation.mutateAsync(body) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
