import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AppLayout from '../components/layout/AppLayout'

const CreatePostPage = lazy(() => import('../pages/CreatePostPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const PostDetailPage = lazy(() => import('../pages/PostDetailPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))

function AppRoutes() {
  return (
    <Suspense
      fallback={(
        <LoadingSpinner
          label="Preparing your reading room"
          className="min-h-screen bg-[var(--color-bg)]"
        />
      )}
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="create" element={<CreatePostPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:authorSlug" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
