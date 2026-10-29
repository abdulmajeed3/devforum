import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Tag as TagIcon } from 'lucide-react'
import { tagsApi } from '@/lib/api-helpers'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

export default function TagsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['tags', 'all'],
    queryFn: tagsApi.list,
  })

  const filtered = data?.results.filter(
    (t) =>
      !search ||
      t.name.includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse topics by tag to find questions in your area of interest.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Filter tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <EmptyState
          icon={<TagIcon className="h-12 w-12" />}
          title="No tags found"
          description={search ? `No tags match "${search}"` : 'No tags available yet.'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((tag) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="inline-flex items-center rounded px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-800 mb-2 group-hover:bg-blue-200 transition-colors">
                {tag.name}
              </div>
              {tag.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{tag.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {tag.question_count} question{tag.question_count !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
