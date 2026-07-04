import { Route, Routes } from 'react-router'
import AppLayout from '../components/layout/AppLayout'
import CreatePostPage from '../pages/CreatePostPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import PostDetailPage from '../pages/PostDetailPage'
import ProfilePage from '../pages/ProfilePage'
import RegisterPage from '../pages/RegisterPage'

function AppRoutes() {
  return (
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
  )
}

export default AppRoutes
