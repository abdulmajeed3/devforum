import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MessageSquare, Tag as TagIcon, Users, ArrowRight } from 'lucide-react'
import { questionsApi, tagsApi } from '@/lib/api-helpers'
import QuestionCard from '@/components/questions/QuestionCard'
import { QuestionCardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', 'recent', 5],
    queryFn: () => questionsApi.list({ ordering: '-created_at', page_size: 5 }),
  })

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: tagsApi.list,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const popularTags = tagsData?.results.slice(0, 12) ?? []

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          DevForum — Where Developers Help Each Other
        </h1>
        <p className="text-blue-100 text-lg mb-6 max-w-xl mx-auto">
          Ask technical questions, share your knowledge, and discover solutions from the developer community.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search for a question…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex items-center justify-center gap-4 mt-6">
          {isAuthenticated ? (
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Ask a Question
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/questions"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/60 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Browse Questions
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: MessageSquare, label: 'Questions', value: questionsData?.count ?? '—' },
          { icon: TagIcon, label: 'Tags', value: tagsData?.count ?? '—' },
          { icon: Users, label: 'Community', value: 'Growing' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <Icon className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Questions */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
            <Link
              to="/questions"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {questionsLoading
            ? Array.from({ length: 4 }).map((_, i) => <QuestionCardSkeleton key={i} />)
            : questionsData?.results.map((q) => <QuestionCard key={q.id} question={q} />)}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Popular Tags</h3>
              <Link to="/tags" className="text-xs text-blue-600 hover:underline">
                All tags
              </Link>
            </div>
            {tagsLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {tag.name}
                    <span className="ml-1 text-blue-400">×{tag.question_count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <h3 className="font-semibold text-blue-900 mb-1">Join DevForum</h3>
              <p className="text-sm text-blue-700 mb-3">
                Ask questions, share knowledge, and help other developers.
              </p>
              <Link to="/register">
                <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Create Free Account
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
