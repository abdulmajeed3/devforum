import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal } from 'lucide-react'
import { questionsApi, tagsApi } from '@/lib/api-helpers'
import { useAuth } from '@/contexts/AuthContext'
import QuestionCard from '@/components/questions/QuestionCard'
import { QuestionCardSkeleton } from '@/components/ui/Skeleton'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

const PAGE_SIZE = 20

export default function QuestionsPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const search = searchParams.get('search') ?? ''
  const ordering = searchParams.get('ordering') ?? '-created_at'
  const status = searchParams.get('status') ?? ''
  const unanswered = searchParams.get('unanswered') === 'true'
  const tagFilter = searchParams.get('tag') ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['questions', { page, search, ordering, status, unanswered, tagFilter }],
    queryFn: () =>
      questionsApi.list({
        page,
        search: search || undefined,
        ordering,
        status: status || undefined,
        unanswered: unanswered || undefined,
        tag: tagFilter || undefined,
        page_size: PAGE_SIZE,
      }),
  })

  const { data: tagsData } = useQuery({
    queryKey: ['tags', 'sidebar'],
    queryFn: tagsApi.list,
  })

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('search', searchInput)
  }

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.count} question{data.count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {isAuthenticated && (
          <Link to="/ask">
            <Button>Ask Question</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search questions…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={ordering}
            onChange={(e) => setParam('ordering', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="-created_at">Newest</option>
            <option value="-vote_score">Most Voted</option>
            <option value="-view_count">Most Viewed</option>
          </select>

          <select
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="solved">Solved</option>
          </select>

          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams)
              if (unanswered) p.delete('unanswered')
              else p.set('unanswered', 'true')
              p.delete('page')
              setSearchParams(p)
            }}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
              unanswered
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Unanswered
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question list */}
        <div className="lg:col-span-3 space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <QuestionCardSkeleton key={i} />)
          ) : data?.results.length === 0 ? (
            <EmptyState
              title="No questions found"
              description={
                search
                  ? `No questions match "${search}". Try different search terms.`
                  : 'Be the first to ask a question!'
              }
              action={
                isAuthenticated
                  ? { label: 'Ask a Question', onClick: () => window.location.assign('/ask') }
                  : undefined
              }
            />
          ) : (
            data?.results.map((q) => <QuestionCard key={q.id} question={q} />)
          )}

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

        {/* Sidebar tags */}
        <div className="hidden lg:block">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Filter by Tag</h3>
            <div className="space-y-1">
              {tagsData?.results.slice(0, 15).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setParam('tag', tagFilter === tag.slug ? '' : tag.slug)}
                  className={`w-full text-left px-2 py-1 text-sm rounded transition-colors flex items-center justify-between ${
                    tagFilter === tag.slug
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-gray-400">{tag.question_count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
