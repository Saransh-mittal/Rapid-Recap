import './App.css'
import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Box } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const FixedBackground = React.lazy(() =>
  import('./components/miscellaneous/FixedBackground.jsx'),
)
const AppRoutes = React.lazy(() => import('./routes/AppRoutes.jsx'))
const GuestLoginModal = React.lazy(() =>
  import('./components/authComponents/GuestLoginModal.jsx'),
)
const ButtonGradient = React.lazy(() =>
  import('./assets/svg/ButtonGradient.jsx'),
)
const Signin = React.lazy(() => import('./screens/Signin.jsx'))
const Register = React.lazy(() => import('./screens/Register.jsx'))
const NoteMessageQueue = React.lazy(() =>
  import('./components/miscellaneous/NoteMessageQueue.jsx'),
)
const XPLevelModal = React.lazy(() =>
  import('./components/Header-Footer/navbarComponents/XPLevelModal.jsx'),
)
const Quiz = React.lazy(() => import('./screens/Quiz.jsx'))

const NotificationModal = React.lazy(() =>
  import(
    './components/Header-Footer/modernNavbarComponents/modals/NotificationModal.jsx'
  ),
)
const UpgradeModal = React.lazy(() =>
  import('./components/homeComponents/UpgradeModal'),
)
const TournamentRewardsModal = React.lazy(() =>
  import(
    './components/tournamentComponents/rewards/TournamentRewardsModal.jsx'
  ),
)
import { RewardDisplay } from './components/rewards'

import {
  fetchUnreadNoteMessages,
  setIsRegisterOpen,
  setIsSigninOpen,
  setShowXpLevelModal,
  setSoundSettings,
  setSelectedNotificationId,
  setIsNotifInboxModalOpen,
  addNoteMessageIfAllowed,
} from './redux/appSlice.js'
import i18n from 'i18next'
import { changeLanguage } from './utils/helper.utils.js'
import {
  checkNotificationStatus,
  isSubscribedChecker,
} from './redux/notificationSlice.js'
import TournamentQuiz from './components/tournamentComponents/tournamentQuiz/TournamentQuiz.jsx'
import {
  checkTournamentRegistration,
  getTopLeaderboard,
} from './redux/tournamentSlice.js'
import LoadingScreen from './screens/LoadingScreen.jsx'
import { setIsLoading, setTaskProgress } from './redux/loadingProgressSlice.js'
import { NavbarProvider } from './contextAPI/NavbarContext.jsx'
import useCountdown from './customHooks/useCountdown.js'
import ModernNavbar from './components/Header-Footer/ModernNavbar.jsx'
import { userCacheService, useUserCache } from './lib/cache/index.js'
import {
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
} from './redux/quizSlice.js'
import { quinBoostChecker } from './utils/quiz.utils.js'
import { tournamentRewardsClaim } from './utils/tournamentRewards.js'
import { useSocket } from './customHooks/useSocket.js'
import useRewardsModal from './customHooks/useRewardsModal.js'
import MaintenanceHandler from './services/MaintenanceHandler.jsx'
import { fetchDemotionSummary } from './redux/demotionSummarySlice.js'
import { Helmet } from 'react-helmet'

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()
  const { isLoading, overallProgress } = useSelector(
    state => state.loadingProgress,
  )
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const { t } = useTranslation('App') // Initialize translation function
  const { t: tournamentSliceTranslation } = useTranslation('tournamentSlice') // Added translation
  const { t: rewardsTranslation } = useTranslation('rewards') // Added translation
  const [navbarLoaded, setNavbarLoaded] = useState(false)
  const dispatch = useDispatch()
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )
  const {
    isOpen: isOpenRewardsModal,
    onClose,
    isLoading: isLoadingRewardsModal,
  } = useRewardsModal()
  const { getSocket } = useSocket()
  const {
    isRegisterOpen,
    isSigninOpen,
    showXpLevelModal,
    isNotifInboxModalOpen,
    selectedNotificationId,
  } = useSelector(state => state.app)
  const { isOpen, tournamentQuiz } = useSelector(state => state.quiz)
  const { summary, isVisible } = useSelector(state => state.demotionSummary)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [guestModalJustClosed, setGuestModalJustClosed] = useState(false)
  const { tournamentId, status, tournamentStartTime } = useSelector(
    state => state.tournament,
  )
  const [isReload, setIsReload] = useState(false)
  useCountdown({ timeString: tournamentStartTime })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const showNavbar = !user?.needsOnboarding
  const { updates } = useSelector(state => state.app)
  const USER_IQ = user?.IQ_score ?? null
  const { t: GuestLoginModaltranslation } = useTranslation('GuestLoginModal')
  const handleNotifModalClose = useCallback(() => {
    dispatch(setIsNotifInboxModalOpen(false))
    dispatch(setSelectedNotificationId(null))
  }, [dispatch])
  useEffect(() => {
    if (selectedNotificationId) {
      dispatch(setIsNotifInboxModalOpen(true))
    }
  }, [selectedNotificationId])

  const handleClose = useCallback(() => {
    setIsGuestLoggedin(false)
    setGuestModalJustClosed(true)
  }, [])

  const isLoggedIn = useMemo(
    () => isAuthenticated && user,
    [isAuthenticated, user],
  )
  const isToken = useCallback(() => localStorage.getItem('token'), [])
  const getUserInGameName = useMemo(
    () => (isLoggedIn ? user?.inGameName : null),
    [isLoggedIn, user],
  )

  const getLatestWeeklyReportUpdate = useCallback(() => {
    if (updates && updates.length > 0) {
      // get latest by date weekly report
      const weeklyReportUpdates = updates.filter(
        update => update.type === 'weeklyReport',
      )
      weeklyReportUpdates.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })

      return weeklyReportUpdates[0]
    }
    return null
  }, [updates])

  useEffect(() => {
    // setShowLoadingScreen(true)
    setTimeout(() => {
      setShowUpgradeModal(true)
    }, 5000)
    if (window.performance) {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === 'reload'
      ) {
        setIsReload(true)

        // You can dispatch this to Redux if needed
        const splashScreen = document.getElementById('splash-screen')
        if (splashScreen) {
          splashScreen.style.opacity = '0'
          splashScreen.style.transition = 'opacity 0.3s ease-out'

          splashScreen.style.display = 'none'
        }
      } else {
        setIsReload(false)
        setShowLoadingScreen(true)
      }
    } else {
      // Fallback for browsers that don't support Performance API
      if (sessionStorage.getItem('app_session_id')) {
        setIsReload(true)

        const splashScreen = document.getElementById('splash-screen')
        if (splashScreen) {
          splashScreen.style.opacity = '0'
          splashScreen.style.transition = 'opacity 0.3s ease-out'

          splashScreen.style.display = 'none'
        }
      } else {
        setIsReload(false)
        setShowLoadingScreen(true)
        sessionStorage.setItem('app_session_id', Date.now().toString())
      }
    }

    // Clean up function
    return () => {
      if (!isReload) {
        sessionStorage.removeItem('app_session_id')
      }
    }
  }, [])

  useEffect(() => {
    const token = isToken()

    // Handle non-authenticated state
    // if (!token && !location.pathname.includes('/article')) {
    //   dispatch(
    //     addNoteMessageIfAllowed({
    //       title: t('Start using Rapid Recap'),
    //       duration: 15000,
    //       width: '350px',
    //       actions: [
    //         { text: t('Sign-In'), actionType: 'SIGN_IN' },
    //         { text: t('Sign-In As Guest'), actionType: 'GUEST' },
    //       ],
    //       isMileStone: true,
    //     }),
    //   )
    // }

    // Enhanced Service Worker handling
    if ('serviceWorker' in navigator) {
      dispatch(setTaskProgress({ task: 'serviceWorker', progress: 50 }))

      // Register service worker immediately instead of waiting for load event
      navigator.serviceWorker
        .register('/sw.js')
        .then(
          registration => {
            console.log(
              'ServiceWorker registration successful:',
              registration.scope,
            )

            // Check for updates periodically (every 4 hours)
            setInterval(() => {
              registration.update()
            }, 4 * 60 * 60 * 1000)
          },
          err => {
            console.error('ServiceWorker registration failed:', err)
          },
        )
        .finally(() => {
          dispatch(setTaskProgress({ task: 'serviceWorker', progress: 100 }))
        })
    }

    // Midnight refresh functionality
    const refreshAtMidnightUTC = () => {
      const now = new Date()
      const midnightUTC = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        24,
        0,
        0,
        0,
      )
      const timeUntilMidnight = midnightUTC - now
      const timeout =
        timeUntilMidnight > 0 ? timeUntilMidnight : 86400000 + timeUntilMidnight

      setTimeout(() => {
        window.location.reload(true)
      }, timeout)
    }

    refreshAtMidnightUTC()

    // Cleanup function
    return () => {
      // Clear any intervals if component unmounts
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          clearInterval(registration.update)
        })
      }
    }
  }, [dispatch, isToken]) // Added t to dependencies for translations

  useEffect(() => {
    if (tournamentId && status === 'ongoing') {
      dispatch(getTopLeaderboard({ tournamentId, t }))
    }
  }, [tournamentId, status])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') {
      dispatch(checkTournamentRegistration(tournamentSliceTranslation))
    }
  }, [loginCheckStatus])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled' && isAuthenticated) {
      dispatch(fetchDemotionSummary())
    }
  }, [loginCheckStatus, isAuthenticated])

  useEffect(() => {
    let timer
    if (isAuthenticated) {
      dispatch(isSubscribedChecker())
      dispatch(checkNotificationStatus())
      const delay = Math.floor(Math.random() * 120000) + 30000
      timer = setTimeout(() => {
        dispatch(fetchUnreadNoteMessages())
      }, delay)
      quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
        dispatch,
      })
      getSocket()
    }
    if (isAuthenticated && user?.soundSettings) {
      dispatch(setSoundSettings(user.soundSettings))
    }
    if (isAuthenticated && user?.userLanguage) {
      i18n.changeLanguage(user?.userLanguage ? user.userLanguage : 'en')
    } else if (
      isAuthenticated &&
      !user?.userLanguage &&
      !user?.needsOnboarding
    ) {
      changeLanguage('en', null, null)
      dispatch(
        addNoteMessageIfAllowed({
          title: t('Please select your language from profile'), // Added translation
          duration: null,
          width: '300px',
          actions: [{ actionType: 'LANGUAGE' }], // Added translation
        }),
      )
    }
    if (isAuthenticated && user?.needsOnboarding) {
      dispatch(setTaskProgress({ task: 'navbarLoad', progress: 100 }))
    }
    dispatch(setTaskProgress({ task: 'otherTasks', progress: 100 }))
    return () => clearTimeout(timer)
  }, [isAuthenticated])

  useEffect(() => {
    if (user && user.inGameName)
      tournamentRewardsClaim({ user, dispatch, t: rewardsTranslation })
  }, [user])

  useEffect(() => {
    ReactGA.set({
      'User Logged In': isLoggedIn ? t('Logged In') : t('Logged Out'), // Added translation
      'User InGameName': getUserInGameName ? getUserInGameName : t('anonymous'), // Added translation
    })
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })
  }, [location, getUserInGameName, isLoggedIn])

  useUserCache()

  // Modified fetchInitialData
  useEffect(() => {
    const fetchInitialData = async () => {
      await userCacheService.fetchAndCacheUser(dispatch)
    }

    fetchInitialData()
  }, [dispatch])

  useEffect(() => {
    if (guestModalJustClosed && user?.role === 'guest') {
      dispatch(
        addNoteMessageIfAllowed({
          title: t('You can view your credentials of guest account in profile'), // Added translation
          duration: 10000,
          width: '300px',
          actions: [{ text: t('View Profile'), actionType: 'VIEW_PROFILE' }], // Added translation
        }),
      )
    }
  }, [guestModalJustClosed, user])

  useEffect(() => {
    if (
      user?.role === 'guest' &&
      !guestModalJustClosed &&
      !isGuestLoggedin &&
      !user?.newAccount
    ) {
      dispatch(
        addNoteMessageIfAllowed({
          title: t('Register to Safeguard your progress'), // Added translation
          duration: 5000,
          width: '300px',
          actions: [{ actionType: 'SECURE_YOUR_PROGRESS' }],
        }),
      )
    }
  }, [user, guestModalJustClosed, isGuestLoggedin])

  const handleNavbarLoad = useCallback(() => {
    setNavbarLoaded(true)
    dispatch(setTaskProgress({ task: 'navbarLoad', progress: 100 }))
  }, [])

  useEffect(() => {
    if (overallProgress === 100) {
      // dispatch after 500ms to ensure all components are loaded
      setTimeout(() => {
        dispatch(setIsLoading(false))
        setShowLoadingScreen(false)
      }, 500)
    }
  }, [navbarLoaded, overallProgress, dispatch])

  return (
    <MaintenanceHandler>
      <Helmet>
        <title>{t('Rapid Recap - Stay Informed, Stay Ahead')}</title>
        <meta
          name="description"
          content={t(
            'Rapid Recap is your go-to source for the latest news and articles. Test your knowledge with quizzes and track your Information Quotient (IQ) score.',
          )}
        />
        <meta
          name="keywords"
          content={t(
            'Rapid Recap, news, articles, quizzes, IQ score, leaderboard',
          )}
        />
        <meta
          property="og:title"
          content={t('Rapid Recap - Stay Informed, Stay Ahead')}
        />
        <meta
          property="og:description"
          content={t(
            'Stay updated with the latest news and articles. Take quizzes and see your Information Quotient (IQ) score on Rapid Recap.',
          )}
        />
      </Helmet>

      {showLoadingScreen && <LoadingScreen progress={overallProgress} />}

      <Suspense fallback={null}>
        {!showLoadingScreen && <FixedBackground />}
      </Suspense>

      <Suspense fallback={null}>
        <NoteMessageQueue />
      </Suspense>

      {showXpLevelModal && (
        <Suspense fallback={null}>
          <XPLevelModal
            setShowXPLevelModal={show => dispatch(setShowXpLevelModal(show))}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <ButtonGradient />
      </Suspense>
      <Suspense fallback={null}>
        <GuestLoginModal
          isOpen={isGuestLoggedin}
          onClose={handleClose}
          guestName={user?.inGameName}
          guestPassword={user?.guestTempPassword}
          guestId={user?._id}
          onOpen={() => setIsGuestLoggedin(true)}
          t={GuestLoginModaltranslation}
        />
      </Suspense>
      <Suspense fallback={null}>
        {isOpen ? tournamentQuiz ? <TournamentQuiz /> : <Quiz /> : null}
      </Suspense>
      <Suspense fallback={null}>
        <Signin
          isOpen={isSigninOpen}
          onOpen={() => dispatch(setIsSigninOpen(true))}
          onClose={() => dispatch(setIsSigninOpen(false))}
        />
      </Suspense>
      <Suspense fallback={null}>
        {isAuthenticated && USER_IQ > 90 && user.societyUpgradeMessage && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title={t('upgrade_modal_title')}
            content={t('upgrade_modal_content')}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        <Register
          isOpen={isRegisterOpen}
          onOpen={() => dispatch(setIsRegisterOpen(true))}
          onClose={() => dispatch(setIsRegisterOpen(false))}
        />
      </Suspense>
      <NavbarProvider>
        {showNavbar && !(summary && isVisible) && (
          <Suspense fallback={null}>
            {/* <Navbar onNavbarLoad={handleNavbarLoad} /> */}
            <ModernNavbar onNavbarLoad={handleNavbarLoad} />
          </Suspense>
        )}
        <Box
          position="relative"
          minHeight="100vh"
          zIndex={1}
          overflowX={'hidden'}
        >
          <Suspense fallback={null}>
            <AppRoutes
              isToken={isToken()}
              needsOnboarding={user?.needsOnboarding}
              setIsGuestLoggedin={setIsGuestLoggedin}
            />
          </Suspense>
        </Box>
      </NavbarProvider>
      <Suspense fallback={null}>
        {isNotifInboxModalOpen && (
          <NotificationModal
            handleNotifModalClose={handleNotifModalClose}
            selectedNotificationId={selectedNotificationId}
            selectedNotification={getLatestWeeklyReportUpdate()}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {!isLoadingRewardsModal && (
          <TournamentRewardsModal
            isOpen={isOpenRewardsModal}
            onClose={onClose}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        <RewardDisplay />
      </Suspense>
    </MaintenanceHandler>
  )
}

export default App
