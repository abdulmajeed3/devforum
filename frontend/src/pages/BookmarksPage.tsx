import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import { questionsApi } from '@/lib/api-helpers'
import QuestionCard from '@/components/questions/QuestionCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'

export default function BookmarksPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => questionsApi.listBookmarks(),
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="h-6 w-6 text-blue-600" fill="currentColor" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Questions you have saved for later</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Save questions you want to come back to by clicking the Bookmark button on any question."
          action={{ label: 'Browse Questions', onClick: () => navigate('/questions') }}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {data.count} bookmarked question{data.count !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {data.results.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
          {data.results.length < data.count && (
            <p className="text-center text-sm text-gray-500">
              Showing {data.results.length} of {data.count}.{' '}
              <Link to="/questions" className="text-blue-600 hover:underline">
                Browse all questions
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
