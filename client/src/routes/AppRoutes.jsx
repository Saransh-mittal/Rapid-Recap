import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Loading from '../components/miscellaneous/Loading'
import AdminRoute from './AdminRoute'

const Tournament = lazy(() => import('../screens/Tournament'))
const Home = lazy(() => import('../screens/Home'))
const Article = lazy(() => import('../screens/Article'))
const Profile = lazy(() => import('../screens/Profile'))
const LeaderBoard = lazy(() => import('../screens/LeaderBoard'))
const GetStarted = lazy(() => import('../screens/GetStarted'))
const ChatPage = lazy(() => import('../screens/ChatPage'))
const Dashboard = lazy(() => import('../screens/Dashboard'))
const ContactLayout = lazy(() =>
  import('../components/contactComponents/ContactLayout'),
)

const AppRoutes = ({ isToken }) => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route
        path="/"
        element={isToken ? <Navigate to="/home" /> : <GetStarted />}
      />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/contact/feedback" element={<ContactLayout />} />
      <Route path="/home/:category" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/chats" element={<ChatPage />} />
      <Route path="/article/:id/:slug" element={<Article />} />
      <Route path="/article/:id" element={<Article />} />
      <Route path="/profile/:inGameName" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contact" element={<ContactLayout />} />
      <Route path="/leaderboard" element={<LeaderBoard />} />
      <Route path="/tournament" element={<Tournament />} />
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
)

export default AppRoutes
