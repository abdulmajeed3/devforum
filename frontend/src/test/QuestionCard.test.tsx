import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuestionCard from '@/components/questions/QuestionCard'
import type { QuestionSummary } from '@/types'

const mockQuestion: QuestionSummary = {
  id: 1,
  title: 'How do I use React hooks properly?',
  author: {
    id: 1,
    username: 'alice',
    display_name: 'Alice Chen',
    avatar_url: null,
    reputation: 100,
  },
  tags: [
    { id: 1, name: 'react', slug: 'react' },
    { id: 2, name: 'javascript', slug: 'javascript' },
  ],
  status: 'open',
  vote_score: 5,
  answer_count: 3,
  has_accepted_answer: true,
  view_count: 42,
  created_at: new Date(Date.now() - 3600000).toISOString(),
  updated_at: new Date(Date.now() - 1800000).toISOString(),
}

function renderCard(q: QuestionSummary = mockQuestion) {
  return render(
    <MemoryRouter>
      <QuestionCard question={q} />
    </MemoryRouter>
  )
}

describe('QuestionCard', () => {
  it('renders question title', () => {
    renderCard()
    expect(screen.getByText('How do I use React hooks properly?')).toBeInTheDocument()
  })

  it('renders vote score', () => {
    renderCard()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders answer count', () => {
    renderCard()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders tags', () => {
    renderCard()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('renders author name', () => {
    renderCard()
    expect(screen.getByText('Alice Chen')).toBeInTheDocument()
  })

  it('renders "Solved" badge for solved question', () => {
    renderCard({ ...mockQuestion, status: 'solved' })
    expect(screen.getByText('Solved')).toBeInTheDocument()
  })

  it('title links to question detail', () => {
    renderCard()
    const link = screen.getByRole('link', { name: /how do i use react hooks/i })
    expect(link).toHaveAttribute('href', '/questions/1')
  })
})
