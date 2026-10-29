import { ChevronUp, ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { votesApi } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'

interface VoteControlsProps {
  targetType: 'question' | 'answer'
  targetId: number
  voteScore: number
  userVote: 1 | -1 | null
  questionId?: number
  className?: string
}

export default function VoteControls({
  targetType,
  targetId,
  voteScore: initialScore,
  userVote: initialVote,
  questionId,
  className,
}: VoteControlsProps) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialVote)

  const mutation = useMutation({
    mutationFn: (value: 1 | -1) =>
      targetType === 'question'
        ? votesApi.voteQuestion(targetId, value)
        : votesApi.voteAnswer(targetId, value),
    onSuccess: (data) => {
      setScore(data.vote_score)
      setUserVote(data.user_vote)
      if (questionId) {
        void queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      }
    },
  })

  const handleVote = (value: 1 | -1) => {
    if (!isAuthenticated) return
    mutation.mutate(value)
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <button
        onClick={() => handleVote(1)}
        disabled={!isAuthenticated || mutation.isPending}
        title={isAuthenticated ? 'Upvote' : 'Login to vote'}
        className={cn(
          'p-1.5 rounded transition-colors',
          userVote === 1
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
          (!isAuthenticated || mutation.isPending) && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={cn(
          'text-base font-semibold min-w-[2ch] text-center',
          score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600'
        )}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={!isAuthenticated || mutation.isPending}
        title={isAuthenticated ? 'Downvote' : 'Login to vote'}
        className={cn(
          'p-1.5 rounded transition-colors',
          userVote === -1
            ? 'text-red-600 bg-red-50'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50',
          (!isAuthenticated || mutation.isPending) && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  )
}
