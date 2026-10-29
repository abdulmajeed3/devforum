import { Trash2 } from 'lucide-react'
import type { Comment } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface CommentItemProps {
  comment: Comment
  onDelete?: (id: number) => void
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { user } = useAuth()
  const isOwn = user?.id === comment.author.id

  return (
    <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0 group">
      <div className="flex-1 text-sm text-gray-700">
        {comment.body}{' '}
        <span className="text-gray-400 text-xs">—</span>{' '}
        <Link
          to={`/users/${comment.author.username}`}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          {comment.author.display_name || comment.author.username}
        </Link>{' '}
        <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
      </div>
      {isOwn && onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity p-0.5"
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
