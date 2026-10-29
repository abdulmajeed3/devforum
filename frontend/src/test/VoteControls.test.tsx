import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VoteControls from '@/components/questions/VoteControls'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api-helpers', () => ({
  votesApi: {
    voteQuestion: vi.fn(),
    voteAnswer: vi.fn(),
  },
}))

import { useAuth } from '@/contexts/AuthContext'

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderVote(isAuthenticated = false) {
  vi.mocked(useAuth).mockReturnValue({
    user: isAuthenticated ? { id: 1, username: 'test', display_name: 'Test', email: 'test@test.com', avatar_url: null, bio: '', website: '', location: '', date_joined: '', reputation: 0, question_count: 0, answer_count: 0, accepted_answer_count: 0 } : null,
    isAuthenticated,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })

  const qc = makeQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <VoteControls
        targetType="question"
        targetId={1}
        voteScore={7}
        userVote={null}
      />
    </QueryClientProvider>
  )
}

describe('VoteControls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders vote score', () => {
    renderVote()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders upvote and downvote buttons', () => {
    renderVote()
    expect(screen.getByLabelText('Upvote')).toBeInTheDocument()
    expect(screen.getByLabelText('Downvote')).toBeInTheDocument()
  })

  it('buttons are disabled when not authenticated', () => {
    renderVote(false)
    expect(screen.getByLabelText('Upvote')).toBeDisabled()
    expect(screen.getByLabelText('Downvote')).toBeDisabled()
  })

  it('buttons are enabled when authenticated', () => {
    renderVote(true)
    expect(screen.getByLabelText('Upvote')).not.toBeDisabled()
    expect(screen.getByLabelText('Downvote')).not.toBeDisabled()
  })
})
