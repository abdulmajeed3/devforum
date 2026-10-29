export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface UserMinimal {
  id: number
  username: string
  display_name: string
  avatar_url: string | null
  reputation: number
}

export interface User {
  id: number
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  website: string
  location: string
  date_joined: string
  reputation: number
  question_count: number
  answer_count: number
  accepted_answer_count: number
}

export interface CurrentUser extends User {
  email: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  description: string
  question_count: number
}

export interface TagMinimal {
  id: number
  name: string
  slug: string
}

export interface Comment {
  id: number
  author: UserMinimal
  body: string
  created_at: string
  updated_at: string
}

export interface Answer {
  id: number
  question: number
  author: UserMinimal
  body: string
  is_accepted: boolean
  vote_score: number
  user_vote: 1 | -1 | null
  comments: Comment[]
  created_at: string
  updated_at: string
}

export interface QuestionSummary {
  id: number
  title: string
  author: UserMinimal
  tags: TagMinimal[]
  status: 'open' | 'solved' | 'closed'
  vote_score: number
  answer_count: number
  has_accepted_answer: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface QuestionDetail extends QuestionSummary {
  body: string
  answers: Answer[]
  comments: Comment[]
  user_vote: 1 | -1 | null
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  user: CurrentUser
  access: string
  refresh: string
}

export interface Notification {
  id: number
  sender: UserMinimal | null
  notification_type: 'answer' | 'comment' | 'vote' | 'accepted'
  question_id: number | null
  question_title: string | null
  answer: number | null
  is_read: boolean
  created_at: string
}
