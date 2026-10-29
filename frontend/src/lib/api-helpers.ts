import { apiClient } from './api'
import type {
  CurrentUser,
  User,
  AuthResponse,
  QuestionDetail,
  QuestionSummary,
  Answer,
  Comment,
  Tag,
  Notification,
  Paginated,
} from '@/types'

export const authApi = {
  register: (data: {
    email: string
    username: string
    password: string
    password_confirm: string
    display_name?: string
  }) => apiClient.post<AuthResponse>('/auth/register/', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login/', data).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post('/auth/logout/', { refresh }).then((r) => r.data),

  me: () => apiClient.get<CurrentUser>('/auth/me/').then((r) => r.data),

  updateMe: (data: FormData) =>
    apiClient
      .patch<CurrentUser>('/auth/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  changePassword: (data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }) => apiClient.post('/auth/me/change-password/', data).then((r) => r.data),

  getProfile: (username: string) =>
    apiClient.get<User>(`/auth/users/${username}/`).then((r) => r.data),
}

export const questionsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<Paginated<QuestionSummary>>('/questions/', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<QuestionDetail>(`/questions/${id}/`).then((r) => r.data),

  create: (data: { title: string; body: string; tag_names?: string[] }) =>
    apiClient.post<QuestionDetail>('/questions/', data).then((r) => r.data),

  update: (id: number, data: { title?: string; body?: string; tag_names?: string[] }) =>
    apiClient.patch<QuestionDetail>(`/questions/${id}/`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/questions/${id}/`),

  listAnswers: (questionId: number) =>
    apiClient
      .get<Paginated<Answer>>(`/questions/${questionId}/answers/`)
      .then((r) => r.data),

  createAnswer: (questionId: number, data: { body: string }) =>
    apiClient.post<Answer>(`/questions/${questionId}/answers/`, data).then((r) => r.data),

  updateAnswer: (answerId: number, data: { body: string }) =>
    apiClient
      .patch<Answer>(`/questions/answers/${answerId}/`, data)
      .then((r) => r.data),

  deleteAnswer: (answerId: number) =>
    apiClient.delete(`/questions/answers/${answerId}/`),

  acceptAnswer: (questionId: number, answerId: number) =>
    apiClient
      .post(`/questions/${questionId}/answers/${answerId}/accept/`)
      .then((r) => r.data),

  unacceptAnswer: (questionId: number, answerId: number) =>
    apiClient
      .post(`/questions/${questionId}/answers/${answerId}/unaccept/`)
      .then((r) => r.data),

  listComments: (questionId: number) =>
    apiClient
      .get<Paginated<Comment>>(`/questions/${questionId}/comments/`)
      .then((r) => r.data),

  createComment: (questionId: number, data: { body: string }) =>
    apiClient
      .post<Comment>(`/questions/${questionId}/comments/`, data)
      .then((r) => r.data),

  listAnswerComments: (answerId: number) =>
    apiClient
      .get<Paginated<Comment>>(`/questions/answers/${answerId}/comments/`)
      .then((r) => r.data),

  createAnswerComment: (answerId: number, data: { body: string }) =>
    apiClient
      .post<Comment>(`/questions/answers/${answerId}/comments/`, data)
      .then((r) => r.data),
}

export const tagsApi = {
  list: () => apiClient.get<Paginated<Tag>>('/tags/').then((r) => r.data),
  get: (slug: string) => apiClient.get<Tag>(`/tags/${slug}/`).then((r) => r.data),
}

export const votesApi = {
  voteQuestion: (id: number, value: 1 | -1) =>
    apiClient
      .post<{ vote_score: number; user_vote: 1 | -1 | null }>(`/votes/questions/${id}/`, {
        value,
      })
      .then((r) => r.data),

  voteAnswer: (id: number, value: 1 | -1) =>
    apiClient
      .post<{ vote_score: number; user_vote: 1 | -1 | null }>(`/votes/answers/${id}/`, {
        value,
      })
      .then((r) => r.data),
}

export const notificationsApi = {
  list: (params?: { unread?: boolean }) =>
    apiClient
      .get<Paginated<Notification>>('/notifications/', { params })
      .then((r) => r.data),

  count: () =>
    apiClient.get<{ unread_count: number }>('/notifications/count/').then((r) => r.data),

  markAllRead: () =>
    apiClient.post('/notifications/mark-all-read/').then((r) => r.data),

  markRead: (id: number) =>
    apiClient.post(`/notifications/${id}/read/`).then((r) => r.data),
}
