import { Link } from 'react-router-dom'
import { MessageSquare, Eye, CheckCircle } from 'lucide-react'
import type { QuestionSummary } from '@/types'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  question: QuestionSummary
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex gap-4">
        {/* Stats column */}
        <div className="flex flex-col items-center gap-3 shrink-0 w-14 text-center">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'text-base font-semibold',
                question.vote_score > 0
                  ? 'text-green-600'
                  : question.vote_score < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              )}
            >
              {question.vote_score}
            </span>
            <span className="text-xs text-gray-400">votes</span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'text-base font-semibold',
                question.has_accepted_answer
                  ? 'text-green-600'
                  : 'text-gray-600'
              )}
            >
              {question.answer_count}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              {question.has_accepted_answer && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              ans
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {question.status === 'solved' && (
              <Badge variant="success" className="shrink-0">
                Solved
              </Badge>
            )}
            {question.status === 'closed' && (
              <Badge variant="gray" className="shrink-0">
                Closed
              </Badge>
            )}
          </div>

          <Link
            to={`/questions/${question.id}`}
            className="text-blue-700 hover:text-blue-900 font-medium text-sm leading-snug line-clamp-2 block mb-2"
          >
            {question.title}
          </Link>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {question.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>{question.view_count} views</span>
              <MessageSquare className="h-3.5 w-3.5 ml-1" />
              <span>{question.answer_count} answers</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Avatar user={question.author} size="xs" />
              <Link
                to={`/users/${question.author.username}`}
                className="hover:text-blue-600 font-medium"
              >
                {question.author.display_name || question.author.username}
              </Link>
              <span>·</span>
              <span>{timeAgo(question.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
