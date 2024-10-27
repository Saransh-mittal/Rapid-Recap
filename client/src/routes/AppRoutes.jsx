import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import AdminRoute from './AdminRoute'
import ServiceScreen from '../screens/ServiceScreen'
import ConfirmDeleteAccount from '../screens/ConfirmDeleteAccount'
import DeleteAccount from '../screens/DeleteAccount'

import TournamentWrapper from '../screens/TournamentWrapper'
import Home from '../screens/Home'
// import Article from '../screens/Article'
import Profile from '../screens/Profile'
import Leaderboard from '../screens/Leaderboard'
import GetStarted from '../screens/GetStarted'
import Dashboard from '../screens/Dashboard'
import ContactLayout from '../components/contactComponents/ContactLayout'
import OnboardingProcess from '../screens/OnboardingProcess'

const AppRoutes = ({ isToken, needsOnboarding, setIsGuestLoggedin }) => {
  return (
    <Routes>
      {needsOnboarding ? (
        <>
          <Route
            path="/"
            element={
              <OnboardingProcess setIsGuestLoggedin={setIsGuestLoggedin} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route
            path="/"
            element={isToken ? <Navigate to="/home" /> : <GetStarted />}
          />
          <Route path="/get-started" element={<GetStarted />} />

          <Route path="/contact/feedback" element={<ContactLayout />} />
          <Route path="/home/:category" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/chats"
            element={
              <ServiceScreen
                title="Chat Feature Under Maintainance"
                description="We're working hard to bring you better version of our chat feature aka Wise Web. Stay tuned for updates!"
                quote="The best way to predict the future is to create it."
                quoteAuthor="Peter Drucker"
              />
            }
          />
          {/* <Route path="/article/:id/:slug" element={<Article />} />
          <Route path="/article/:id" element={<Article />} /> */}
          <Route path="/profile/:inGameName" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<ContactLayout />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tournament" element={<TournamentWrapper />} />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route
            path="/confirmDeleteAccount/:token"
            element={<ConfirmDeleteAccount />}
          />
        </>
      )}
    </Routes>
  )
}

export default AppRoutes
