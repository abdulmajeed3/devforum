import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { questionsApi, tagsApi } from '@/lib/api-helpers'
import { useAuth } from '@/contexts/AuthContext'
import QuestionCard from '@/components/questions/QuestionCard'
import { QuestionCardSkeleton } from '@/components/ui/Skeleton'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

const PAGE_SIZE = 20

export default function TagQuestionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const { data: tag, isLoading: tagLoading } = useQuery({
    queryKey: ['tag', slug],
    queryFn: () => tagsApi.get(slug!),
    enabled: !!slug,
  })

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', 'tag', slug, page],
    queryFn: () => questionsApi.list({ tag: slug, page, page_size: PAGE_SIZE }),
    enabled: !!slug,
  })

  const totalPages = questions ? Math.ceil(questions.count / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/tags"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          All Tags
        </Link>

        {tagLoading ? (
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        ) : tag ? (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded px-3 py-1 text-base font-semibold bg-blue-100 text-blue-800">
                  {tag.name}
                </span>
                <span className="text-sm text-gray-500">{tag.question_count} questions</span>
              </div>
              {tag.description && (
                <p className="text-sm text-gray-600">{tag.description}</p>
              )}
            </div>
            {isAuthenticated && (
              <Link to="/ask">
                <Button>Ask Question</Button>
              </Link>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {questionsLoading
          ? Array.from({ length: 5 }).map((_, i) => <QuestionCardSkeleton key={i} />)
          : questions?.results.length === 0
          ? (
            <EmptyState
              title="No questions with this tag"
              description="Be the first to ask a question tagged with this topic!"
            />
          )
          : questions?.results.map((q) => <QuestionCard key={q.id} question={q} />)}

        {totalPages > 1 && (
          <div className="pt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                const params = new URLSearchParams(searchParams)
                params.set('page', String(p))
                setSearchParams(params)
                window.scrollTo(0, 0)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
