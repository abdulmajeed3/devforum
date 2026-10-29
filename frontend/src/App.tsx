import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import QuestionsPage from '@/pages/QuestionsPage'
import QuestionDetailPage from '@/pages/QuestionDetailPage'
import AskQuestionPage from '@/pages/AskQuestionPage'
import EditQuestionPage from '@/pages/EditQuestionPage'
import TagsPage from '@/pages/TagsPage'
import TagQuestionsPage from '@/pages/TagQuestionsPage'
import ProfilePage from '@/pages/ProfilePage'
import EditProfilePage from '@/pages/EditProfilePage'
import NotificationsPage from '@/pages/NotificationsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:slug" element={<TagQuestionsPage />} />
            <Route path="/users/:username" element={<ProfilePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/questions/:id/edit" element={<EditQuestionPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
