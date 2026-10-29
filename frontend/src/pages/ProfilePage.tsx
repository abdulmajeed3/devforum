import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CalendarDays, Globe, MapPin, Star, Edit } from 'lucide-react'
import { authApi, questionsApi } from '@/lib/api-helpers'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import QuestionCard from '@/components/questions/QuestionCard'
import EmptyState from '@/components/ui/EmptyState'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => authApi.getProfile(username!),
    enabled: !!username,
  })

  const { data: userQuestions } = useQuery({
    queryKey: ['questions', 'user', username],
    queryFn: () => questionsApi.list({ author: username, ordering: '-created_at', page_size: 10 }),
    enabled: !!username && activeTab === 'questions',
  })

  if (isLoading) return <LoadingSpinner />
  if (!profile) {
    return (
      <EmptyState
        title="User not found"
        description="This profile doesn't exist or the user has been removed."
      />
    )
  }

  const isOwnProfile = currentUser?.username === username

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Avatar user={profile} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <Link to="/profile/edit">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Joined {formatDate(profile.date_joined)}
              </span>
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Reputation', value: profile.reputation, icon: Star },
          { label: 'Questions', value: profile.question_count, icon: null },
          { label: 'Answers', value: profile.answer_count, icon: null },
          { label: 'Accepted', value: profile.accepted_answer_count, icon: null },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Activity tabs */}
      <div>
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {(['questions', 'answers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'questions' && (
          <div className="space-y-3">
            {!userQuestions?.results.length ? (
              <EmptyState title="No questions yet" description="This user hasn't asked any questions." />
            ) : (
              userQuestions.results.map((q) => <QuestionCard key={q.id} question={q} />)
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            <p>Answer history coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
