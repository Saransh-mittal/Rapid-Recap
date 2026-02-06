// client/src/App.jsx - Updated to use auth state utility

import './App.css'
import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// import ReactGA from 'react-ga4'
import { Box, useToast } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

// UPDATED: Import auth state utility and localStorage wrapper
import {
  initializeAuthSignals,
  updateAuthSignalCookie,
  hasAuthSignals,
} from './utils/authStateManager.js'
import localStorageService from './services/localStorageWrapper.js'
import { notificationManager } from './utils/notifications.jsx'
import useFriendsSocket from './customHooks/useFriendsSocket'

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
// import PWAPromptStrip from './components/pwa/PWAPromptStrip'
const PWAPromptStrip = React.lazy(() =>
  import('./components/pwa/PWAPromptStrip.jsx'),
)
import { getPWAPromptStatus } from './utils/pwaInstallStore'
// import { RewardDisplay } from './components/rewards'
const RewardDisplay = React.lazy(() =>
  import('./components/rewards/RewardDisplay.jsx'),
)

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
// import {
//   // checkTournamentRegistration,
//   getTopLeaderboard,
// } from './redux/tournamentSlice.js'
import { setIsLoading, setTaskProgress } from './redux/loadingProgressSlice.js'
import { NavbarProvider } from './contextAPI/NavbarContext.jsx'
import useCountdown from './customHooks/useCountdown.js'
import ModernNavbar from './components/Header-Footer/ModernNavbar.jsx'
import { userCacheService, useUserCache } from './lib/cache/index.js'
import { setQuizLeftToGetQuizBoost } from './redux/quizSlice.js'
import { quinBoostChecker } from './utils/quiz.utils.js'
import { tournamentRewardsClaim } from './utils/tournamentRewards.js'
import { useSocket } from './customHooks/useSocket.js'
import useRewardsModal from './customHooks/useRewardsModal.js'
import MaintenanceHandler from './services/MaintenanceHandler.jsx'
import { fetchDemotionSummary } from './redux/demotionSummarySlice.js'
import usePWAInstallation from './customHooks/usePWAInstallation.js'
import { fetchInventory } from './redux/inventorySlice.js'
import useQuickClashSocket from './customHooks/useQuickClashSocket.js'
import useQuickClash from './customHooks/useQuickClash.js'
import NotificationReminderModal from './components/miscellaneous/NotificationReminderModal.jsx'
import { fetchSpecialCategories } from './services/specialCategoryService.js'
import {
  LoadingScreen,
  useResponsiveBreakpoints,
} from './screens/AppStartScreen.jsx'
const ConnectionStatusIndicator = React.lazy(() =>
  import('./components/connection/ConnectionStatusIndicator.jsx'),
)

// Import Tutorial Manager
import { TutorialProvider } from './components/quickClashComponents/v2/tutorial/TutorialManager'
import MobileRestrictedView from './components/miscellaneous/MobileRestrictedView.jsx'
import MobileSimulatorWrapper from './components/miscellaneous/MobileSimulatorWrapper.jsx'

const App = () => {
  // ReactGA.initialize('G-ES5VQ8NW7Z')
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
  // Initialize friends socket at app level - this will be shared globally
  const {
    isConnected: friendsSocketConnected,
    isConnecting: friendsSocketConnecting,
    networkStatus: friendsNetworkStatus,
    checkFriendsOnlineStatus,
    requestFriendsUpdate,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    reconnect: reconnectFriendsSocket,
  } = useFriendsSocket({
    autoConnect: true,
    enableToasts: true,
    enableOptimisticUpdates: true,
    enableNotifications: true,
  })
  const {
    isOpen: isOpenRewardsModal,
    onClose,
    isLoading: isLoadingRewardsModal,
  } = useRewardsModal()
  const { getSocket } = useSocket()
  const {
    isConnected: quickClashSocketConnected,
    isListening: quickClashSocketListening,
    isInitialized: quickClashSocketInitialized,
    rooms: quickClashRooms,
    initializeQuickClashSocket,
    cleanupSocketListeners,
    getConnectionStatus,
    isSocketReady,
  } = useQuickClashSocket()

  const { loadActiveChallenges } = useQuickClash()
  const {
    isRegisterOpen,
    isSigninOpen,
    showXpLevelModal,
    isNotifInboxModalOpen,
    selectedNotificationId,
    isMobileSimulation,
  } = useSelector(state => state.app)
  const { isOpen, tournamentQuiz } = useSelector(state => state.quiz)
  const { summary, isVisible } = useSelector(state => state.demotionSummary)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [guestModalJustClosed, setGuestModalJustClosed] = useState(false)
  const { tournamentId, status, tournamentStartTime } = useSelector(
    state => state.tournament,
  )
  const [isReload, setIsReload] = useState(false)
  const [showPWAPrompt, setShowPWAPrompt] = useState(false)
  // Check if already installed or prompt was recently dismissed
  const { isInstalled } = usePWAInstallation()
  const isDismissed = getPWAPromptStatus()
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

  const screenInfo = useResponsiveBreakpoints()
  const videoOverlays = useMemo(
    () => [
      {
        className: screenInfo.isMobile
          ? 'bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/70'
          : 'bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60',
        style: { zIndex: 1 },
      },
    ],
    [screenInfo.isMobile],
  )

  // Expose socket utilities globally for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.friendsSocket = {
        isConnected: friendsSocketConnected,
        isConnecting: friendsSocketConnecting,
        networkStatus: friendsNetworkStatus,
        checkOnlineStatus: checkFriendsOnlineStatus,
        requestUpdate: requestFriendsUpdate,
        reconnect: reconnectFriendsSocket,
        joinFriendConversation: joinConversation,
        leaveFriendConversation: leaveConversation,
        sendFriendTypingIndicator: sendTypingIndicator,
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.friendsSocket
      }
    }
  }, [
    friendsSocketConnected,
    friendsSocketConnecting,
    friendsNetworkStatus,
    checkFriendsOnlineStatus,
    requestFriendsUpdate,
    reconnectFriendsSocket,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
  ])

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
  const isToken = useCallback(() => localStorageService.getItem('token'), [])
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
    setTimeout(() => {
      setShowPWAPrompt(true)
    }, 45000)
    // setShowLoadingScreen(true)
    setTimeout(() => {
      setShowUpgradeModal(true)
    }, 5000)

    // UPDATED: Initialize auth signals and sync cookies
    initializeAuthSignals()
    updateAuthSignalCookie()

    if (window.performance) {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === 'reload'
      ) {
        setIsReload(true)
        if (window.finishLoading) window.finishLoading()
      } else {
        setIsReload(false)
        setShowLoadingScreen(true)
        // Also hide splash screen as we transition to React app
        if (window.finishLoading) window.finishLoading()
      }
    } else {
      // Fallback for browsers that don't support Performance API
      if (sessionStorage.getItem('app_session_id')) {
        setIsReload(true)
        if (window.finishLoading) window.finishLoading()
      } else {
        setIsReload(false)
        setShowLoadingScreen(true)
        sessionStorage.setItem('app_session_id', Date.now().toString())
        if (window.finishLoading) window.finishLoading()
      }
    }

    // UPDATED: Demo quiz is now handled by the demo quiz overlay script
    // No need to hide it here - the overlay script will handle it based on server flags
    console.log('[App] Demo quiz handling delegated to overlay script')

    // Clean up function
    return () => {
      if (!isReload) {
        sessionStorage.removeItem('app_session_id')
      }
      cleanupSocketListeners()
    }
  }, [])

  const handlePromptClose = () => {
    setShowPWAPrompt(false)
  }

  useEffect(() => {
    const token = isToken()

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

            // Force update and activation
            registration.update()

            // If service worker is waiting, ask it to take control immediately
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing

              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log(
                    'New service worker installed, forcing activation',
                  )
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                }
              })
            })

            // Listen for controller change (new service worker taking over)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('New service worker activated')
              // Purge locale cache when new service worker takes control
              if (window.refreshTranslations) {
                window.refreshTranslations()
              }
            })

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

  // useEffect(() => {
  //   if (tournamentId && status === 'ongoing') {
  //     dispatch(getTopLeaderboard({ tournamentId, t }))
  //   }
  // }, [tournamentId, status])

  // useEffect(() => {
  //   if (loginCheckStatus === 'fulfilled') {
  //     dispatch(checkTournamentRegistration(tournamentSliceTranslation))
  //   }
  // }, [loginCheckStatus])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled' && isAuthenticated) {
      dispatch(fetchDemotionSummary())
    }
    const handleHashChange = () => {
      if (
        window.location.hash.split('?')[0] === '#signin' &&
        !isAuthenticated &&
        loginCheckStatus === 'fulfilled'
      ) {
        // Handle referral code
        if (
          window.location.hash
            .split('?')?.[1]
            ?.split('&')?.[0]
            ?.split('=')?.[0] === 'ref'
        ) {
          localStorageService.setItem(
            'ref',
            window.location.hash
              .split('?')?.[1]
              ?.split('&')?.[0]
              ?.split('=')?.[1],
          )
        }

        // Handle early adopter code
        const searchParams = new URLSearchParams(
          window.location.hash.split('?')[1],
        )
        const eocParam = searchParams.get('EOC')
        if (eocParam) {
          localStorageService.setItem('EOC', eocParam)
        }

        dispatch(setIsSigninOpen(true))
      }
      if (
        window.location.hash === '#register' &&
        !isAuthenticated &&
        loginCheckStatus === 'fulfilled'
      ) {
        dispatch(setIsRegisterOpen(true))
      }
    }
    // Check hash on initial load
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [loginCheckStatus, isAuthenticated])

  useEffect(() => {
    // Only initialize if user is authenticated, socket is ready, and not already initialized
    if (isAuthenticated && isSocketReady && !quickClashSocketInitialized) {
      console.log('[APP] Initializing Quick Clash socket (single connection)')
      initializeQuickClashSocket()
    }
  }, [isAuthenticated, isSocketReady, quickClashSocketInitialized]) // FIXED: Stable dependencies

  useEffect(() => {
    let timer
    const loadInitialData = async () => {
      // Fetch special categories first - they need to be available for the categories list
      await fetchSpecialCategories(i18n)
    }

    loadInitialData()
    if (isAuthenticated) {
      dispatch(isSubscribedChecker())
      dispatch(checkNotificationStatus())
      const delay = Math.floor(Math.random() * 120000) + 30000
      timer = setTimeout(() => {
        dispatch(fetchUnreadNoteMessages())
      }, delay)
      dispatch(fetchInventory())
      loadActiveChallenges()
      quinBoostChecker({
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
      // dispatch(
      //   addNoteMessageIfAllowed({
      //     title: t('Please select your language from profile'), // Added translation
      //     duration: null,
      //     width: '300px',
      //     actions: [{ actionType: 'LANGUAGE' }], // Added translation
      //   }),
      // )
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

  // Spark Engine - Handle pending invites
  useAutoJoin(isAuthenticated, user, useNavigate())

  // Check for mobile simulation to hide scrollbars
  const isMobileSim = new URLSearchParams(window.location.search).get('mobile_sim') === 'true'
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <MaintenanceHandler>
      {isMobileSim && (
        <style>{`
          ::-webkit-scrollbar { display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      )}
      {!isAdminRoute && <MobileRestrictedView />}
      {isMobileSimulation && !isAdminRoute ? (
        <MobileSimulatorWrapper>
           {/* {showLoadingScreen && <LoadingScreen progress={overallProgress} />} */}

      <Suspense fallback={null}>
        {!showLoadingScreen && <FixedBackground forceRender={true} />}
        {showLoadingScreen && <LoadingScreen screenInfo={screenInfo} />}
      </Suspense>
      <Suspense fallback={null}>
        {showPWAPrompt && <PWAPromptStrip onClose={handlePromptClose} />}
      </Suspense>
      <Suspense fallback={null}>
        {showPWAPrompt && <PWAPromptStrip onClose={handlePromptClose} />}
      </Suspense>
      <TutorialProvider>
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
        {/* Navbar completely hidden for Spark Engine - all navigation is in-app */}
        {false && showNavbar &&
          ((!(summary && isVisible) &&
            !(
              location.pathname.startsWith('/quickclash') ||
              location.pathname.startsWith('/profile')
            ) &&
            location.pathname != '/') ||
            (!location.pathname.startsWith('/quickclash') && !isLoggedIn)) &&
          !location.pathname.startsWith('/gamehub') && (
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
      <NotificationReminderModal />

      <Suspense fallback={null}>
        <ConnectionStatusIndicator />
      </Suspense>
      </TutorialProvider>
      </MobileSimulatorWrapper>
      ) : (
        <>
           {/* {showLoadingScreen && <LoadingScreen progress={overallProgress} />} */}

      <Suspense fallback={null}>
        {!showLoadingScreen && <FixedBackground forceRender={true} />}
        {showLoadingScreen && <LoadingScreen screenInfo={screenInfo} />}
      </Suspense>
      <Suspense fallback={null}>
        {showPWAPrompt && <PWAPromptStrip onClose={handlePromptClose} />}
      </Suspense>
      <Suspense fallback={null}>
        {showPWAPrompt && <PWAPromptStrip onClose={handlePromptClose} />}
      </Suspense>
      <TutorialProvider>
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
        {/* Navbar completely hidden for Spark Engine - all navigation is in-app */}
        {false && showNavbar &&
          ((!(summary && isVisible) &&
            !(
              location.pathname.startsWith('/quickclash') ||
              location.pathname.startsWith('/profile')
            ) &&
            location.pathname != '/') ||
            (!location.pathname.startsWith('/quickclash') && !isLoggedIn)) &&
          !location.pathname.startsWith('/gamehub') && (
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
      <NotificationReminderModal />

      <Suspense fallback={null}>
        <ConnectionStatusIndicator />
      </Suspense>
      </TutorialProvider>
        </>
      )}
    </MaintenanceHandler>
  )
}

// Spark Engine - Auto-join invite link logic
import { quickClashTeamService } from './services/quickClashServices/quickClashTeamService'

const useAutoJoin = (isAuthenticated, user, navigate) => {
  const isJoiningRef = React.useRef(false)

  useEffect(() => {
    const checkPendingJoin = async () => {
      const pendingCode = localStorageService.getItem('pendingTeamJoin')

      if (isAuthenticated && pendingCode && !isJoiningRef.current) {
        isJoiningRef.current = true

        try {
          // Attempt to join the team
          const response = await quickClashTeamService.joinTeamByCode(pendingCode)

          // Custom notification with Team Name
          const teamName = response.team?.name || 'the team'
          notificationManager.success(
            `Welcome to ${teamName}! ⚔️`,
            'You have successfully joined via invite link.'
          )

          // Clear the pending code
          localStorageService.removeItem('pendingTeamJoin')

          // Force navigation to Quick Clash to ensure UI update
          navigate('/quickclash')

        } catch (error) {
          // If error is "User already in a team", that's fine - just clear code and redirect
          if (error.response?.data?.message?.includes('already')) {
             localStorageService.removeItem('pendingTeamJoin')
             navigate('/quickclash')
             return
          }

          notificationManager.error(
            'Join Failed',
            error.response?.data?.message || 'Could not join team from invite link.'
          )
          // Keep code? Or remove on error? Let's remove to prevent loop
          localStorageService.removeItem('pendingTeamJoin')
        } finally {
          isJoiningRef.current = false
        }
      }
    }

    if (isAuthenticated) {
      checkPendingJoin()
    }
  }, [isAuthenticated, user, navigate])
}

export default App
