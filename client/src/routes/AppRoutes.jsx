import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Loading from '../components/miscellaneous/Loading'
import AdminRoute from './AdminRoute'
import ServiceScreen from '../screens/ServiceScreen'
import ConfirmDeleteAccount from '../screens/ConfirmDeleteAccount'
import DeleteAccount from '../screens/DeleteAccount'
import { useSelector } from 'react-redux'

const TournamentWrapper = lazy(() => import('../screens/TournamentWrapper'))
const Home = lazy(() => import('../screens/Home'))
const Article = lazy(() => import('../screens/Article'))
const Profile = lazy(() => import('../screens/Profile'))
const Leaderboard = lazy(() => import('../screens/LeaderBoard'))
const GetStarted = lazy(() => import('../screens/GetStarted'))
const Dashboard = lazy(() => import('../screens/Dashboard'))
const ContactLayout = lazy(() =>
  import('../components/contactComponents/ContactLayout'),
)
const RuleBook = lazy(() => import('../screens/RuleBook'))
const HallOfChampions = lazy(() => import('../screens/HallOfChampions'))

const OnboardingProcess = lazy(() => import('../screens/OnboardingProcess'))
const DemotionSummary = lazy(() => import('../screens/DemotionSummary'))
const PrivacyPolicy = lazy(() => import('../screens/PrivacyPolicy'))

const AppRoutes = ({ isToken, needsOnboarding, setIsGuestLoggedin }) => {
  const { summary, isVisible } = useSelector(state => state.demotionSummary)
  return (
    <Suspense fallback={<Loading />}>
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
        ) : isVisible && summary ? (
          <>
            <Route path="/" element={<DemotionSummary />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={isToken ? <Navigate to="/home" /> : <GetStarted />}
            />
            <Route path="/manual" element={<RuleBook />} />
            <Route path="/manual/:pageId" element={<RuleBook />} />
            {/* <Route path="/get-started" element={<GetStarted />} /> */}
            <Route path="/hall-of-champions" element={<HallOfChampions />} />
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
            <Route path="/article/:id/:slug" element={<Article />} />
            <Route path="/article/:id" element={<Article />} />
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/confirmDeleteAccount/:token"
              element={<ConfirmDeleteAccount />}
            />
          </>
        )}
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
