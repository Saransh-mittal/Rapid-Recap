// routes/AppRoutes.jsx - Updated with smooth page transitions
import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Loading from '../components/miscellaneous/Loading'
import AdminRoute from './AdminRoute'
import ServiceScreen from '../screens/ServiceScreen'
import ConfirmDeleteAccount from '../screens/ConfirmDeleteAccount'
import DeleteAccount from '../screens/DeleteAccount'
import { useSelector } from 'react-redux'
import ReferralDashboard from '../screens/ReferralDashboard'
import PageTransitionWrapper from '../components/transitions/PageTransitionWrapper'

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
const QuickClash = lazy(() => import('../screens/QuickClash'))
const QuickClashLayoutV2 = lazy(() =>
  import('../components/quickClashComponents/v2/QuickClashLayoutV2')
)
const QuickClashSession = lazy(() => import('../screens/QuickClashSession'))

// GameHub components
const IntegratedGameHub = lazy(() =>
  import('../components/gameHub/IntegratedGameHub'),
)
const EnhancedGameInterface = lazy(() =>
  import('../components/gameHub/EnhancedGameInterface'),
)
// GameSummaryInterface component
const GameSummaryInterface = lazy(() =>
  import('../components/gameHub/GameSummaryInterface'),
)
// NEW: GameReportWrapper component
const GameReportWrapper = lazy(() =>
  import('../components/gameHub/GameReportWrapper'),
)

const OnboardingProcess = lazy(() => import('../screens/OnboardingProcess'))
const DemotionSummary = lazy(() => import('../screens/DemotionSummary'))
const PrivacyPolicy = lazy(() => import('../screens/PrivacyPolicy'))
const TeamBattlePage = lazy(() =>
  import('../components/quickClashComponents/team/TeamBattlePageV2'),
)
const TeamBattleAnalysisPage = lazy(() =>
  import('../screens/TeamBattleAnalysisPage'),
)
const QuickClashSocketTest =
  process.env.NODE_ENV === 'production'
    ? null
    : React.lazy(() => import('../screens/testing/QuickClashSocketTest'))
const AppStartScreen = lazy(() => import('../screens/AppStartScreen'))

// Spark Engine - Viral invite system
const PlayLanding = lazy(() => import('../screens/PlayLanding'))
const SparkLobby = lazy(() =>
  import('../components/quickClashComponents/lobby/SparkLobby')
)
const SparkMatchmaking = lazy(() =>
  import('../components/quickClashComponents/lobby/SparkMatchmaking')
)
const SparkBattlePage = lazy(() =>
  import('../components/quickClashComponents/lobby/SparkBattlePage')
)

// Helper to check if a session player exists (for route guards)
const hasSessionPlayer = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('playSessionId')
}

// Helper to check if session player has been upgraded to V2 UI
// (i.e., has completed first battle or visited /quickclash)
const hasUpgradedSessionPlayer = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('sparkUpgraded') === 'true' && hasSessionPlayer()
}

// Enhanced loading component with glassmorphic design
const EnhancedLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
    <div className="relative">
      {/* Background blur circle */}
      <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl scale-150"></div>

      {/* Loading spinner */}
      <div className="relative w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>

      {/* Loading text */}
      <p className="mt-4 text-white/70 text-center text-sm">Loading...</p>
    </div>
  </div>
)

const AppRoutes = ({ isToken, needsOnboarding, setIsGuestLoggedin }) => {
  const { summary, isVisible } = useSelector(state => state.demotionSummary)

  return (
    <PageTransitionWrapper>
      <Suspense fallback={<EnhancedLoading />}>
        <Routes>
          {needsOnboarding ? (
            <>
              <Route
                path="/"
                element={
                  <OnboardingProcess setIsGuestLoggedin={setIsGuestLoggedin} />
                }
              />
              {/* GameHub routes */}
              <Route
                path="/gamehub/:articleId"
                element={
                  isToken ? <IntegratedGameHub /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/gamehub/:articleId/:gameType"
                element={
                  isToken ? (
                    <EnhancedGameInterface />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              {/* NEW: Game Report route */}
              <Route
                path="/gamehub/:articleId/report"
                element={
                  isToken ? <GameReportWrapper /> : <Navigate to="/" replace />
                }
              />
              {/* Game Summary route */}
              <Route
                path="/gamehub/:articleId/summary/:sessionId"
                element={
                  isToken ? (
                    <GameSummaryInterface />
                  ) : (
                    <Navigate to="/" replace />
                  )
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
              {/* Root route: logged-in -> AppStartScreen, new users -> PlayLanding */}
              <Route
                path="/"
                element={isToken ? <AppStartScreen /> : <PlayLanding />}
              />

              {/* Spark Engine - Routes with auth handling */}
              {/* /play: Authenticated users → /quickclash, Upgraded session players → /quickclash, New players → PlayLanding */}
              <Route
                path="/play"
                element={
                  isToken
                    ? <Navigate to="/quickclash" replace />
                    : hasUpgradedSessionPlayer()
                      ? <Navigate to="/quickclash" replace />
                      : <PlayLanding />
                }
              />
              <Route
                path="/play/join/:teamCode"
                element={
                  isToken
                    ? <Navigate to="/quickclash" replace />
                    : hasUpgradedSessionPlayer()
                      ? <Navigate to="/quickclash" replace />
                      : <PlayLanding />
                }
              />
              <Route
                path="/play/lobby"
                element={<SparkLobby />}
              />
              <Route
                path="/play/matchmaking"
                element={<SparkMatchmaking />}
              />
              <Route
                path="/play/session/:challengeId"
                element={<QuickClashSession isSessionPlayer={true} />}
              />
              <Route
                path="/play/battle/:battleId"
                element={<TeamBattlePage />}
              />
              {process.env.NODE_ENV != 'production' && (
                <Route
                  path="/quickclash/test-socket"
                  element={<QuickClashSocketTest />}
                />
              )}
              <Route
                path="/quickclash/*"
                element={(isToken || hasSessionPlayer()) ? <QuickClashLayoutV2 /> : <Navigate to="/" replace />}
              />
              <Route
                path="/quickclash-legacy"
                element={isToken ? <QuickClash /> : <Navigate to="/" replace />}
              />
              <Route
                path="/quickclash/teamBattle/:battleId"
                element={
                  (isToken || hasSessionPlayer()) ? <TeamBattlePage /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/quickclash/analysis/:battleId"
                element={
                  isToken ? (
                    <TeamBattleAnalysisPage />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/quickclash/session/:challengeId"
                element={
                  isToken ? <QuickClashSession /> : <Navigate to="/" replace />
                }
              />

              {/* GameHub routes */}
              <Route
                path="/gamehub/:articleId"
                element={
                  isToken ? <IntegratedGameHub /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/gamehub/:articleId/:gameType"
                element={
                  isToken ? (
                    <EnhancedGameInterface />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              {/* NEW: Game Report route */}
              <Route
                path="/gamehub/:articleId/report"
                element={
                  isToken ? <GameReportWrapper /> : <Navigate to="/" replace />
                }
              />
              {/* Game Summary route */}
              <Route
                path="/gamehub/:articleId/summary/:sessionId"
                element={
                  isToken ? (
                    <GameSummaryInterface />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route path="/manual" element={<RuleBook />} />
              <Route path="/manual/:pageId" element={<RuleBook />} />
              <Route path="/hall-of-champions" element={<HallOfChampions />} />
              <Route path="/contact/feedback" element={<ContactLayout />} />
              <Route path="/home/:category" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/referral" element={<ReferralDashboard />} />
              <Route path="/article/:id/:slug" element={<Article />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/profile/:inGameName" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<ContactLayout />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

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
    </PageTransitionWrapper>
  )
}

export default AppRoutes
