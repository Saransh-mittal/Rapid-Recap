import './App.css'
import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Box } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

// Performance tracking helper function
const trackComponentLoad = componentName => {
  performance.mark(`${componentName}-load-start`)
  return () => {
    performance.mark(`${componentName}-load-complete`)
    performance.measure(
      `${componentName} Load Time`,
      `${componentName}-load-start`,
      `${componentName}-load-complete`,
    )
  }
}

const FixedBackground = React.lazy(() => {
  performance.mark('FixedBackground-import-start')
  return import('./components/miscellaneous/FixedBackground.jsx').then(
    module => {
      performance.mark('FixedBackground-import-complete')
      performance.measure(
        'FixedBackground Import Time',
        'FixedBackground-import-start',
        'FixedBackground-import-complete',
      )
      return module
    },
  )
})
const AppRoutes = React.lazy(() => {
  performance.mark('AppRoutes-import-start')
  return import('./routes/AppRoutes.jsx').then(module => {
    performance.mark('AppRoutes-import-complete')
    performance.measure(
      'AppRoutes Import Time',
      'AppRoutes-import-start',
      'AppRoutes-import-complete',
    )
    return module
  })
})
const GuestLoginModal = React.lazy(() => {
  performance.mark('GuestLoginModal-import-start')
  return import('./components/authComponents/GuestLoginModal.jsx').then(
    module => {
      performance.mark('GuestLoginModal-import-complete')
      performance.measure(
        'GuestLoginModal Import Time',
        'GuestLoginModal-import-start',
        'GuestLoginModal-import-complete',
      )
      return module
    },
  )
})
const ButtonGradient = React.lazy(() => {
  performance.mark('ButtonGradient-import-start')
  return import('./assets/svg/ButtonGradient.jsx').then(module => {
    performance.mark('ButtonGradient-import-complete')
    performance.measure(
      'ButtonGradient Import Time',
      'ButtonGradient-import-start',
      'ButtonGradient-import-complete',
    )
    return module
  })
})
const Signin = React.lazy(() => {
  performance.mark('Signin-import-start')
  return import('./screens/Signin.jsx').then(module => {
    performance.mark('Signin-import-complete')
    performance.measure(
      'Signin Import Time',
      'Signin-import-start',
      'Signin-import-complete',
    )
    return module
  })
})
const Register = React.lazy(() => {
  performance.mark('Register-import-start')
  return import('./screens/Register.jsx').then(module => {
    performance.mark('Register-import-complete')
    performance.measure(
      'Register Import Time',
      'Register-import-start',
      'Register-import-complete',
    )
    return module
  })
})
const NoteMessageQueue = React.lazy(() => {
  performance.mark('NoteMessageQueue-import-start')
  return import('./components/miscellaneous/NoteMessageQueue.jsx').then(
    module => {
      performance.mark('NoteMessageQueue-import-complete')
      performance.measure(
        'NoteMessageQueue Import Time',
        'NoteMessageQueue-import-start',
        'NoteMessageQueue-import-complete',
      )
      return module
    },
  )
})
const XPLevelModal = React.lazy(() => {
  performance.mark('XPLevelModal-import-start')
  return import(
    './components/Header-Footer/navbarComponents/XPLevelModal.jsx'
  ).then(module => {
    performance.mark('XPLevelModal-import-complete')
    performance.measure(
      'XPLevelModal Import Time',
      'XPLevelModal-import-start',
      'XPLevelModal-import-complete',
    )
    return module
  })
})
const Quiz = React.lazy(() => {
  performance.mark('Quiz-import-start')
  return import('./screens/Quiz.jsx').then(module => {
    performance.mark('Quiz-import-complete')
    performance.measure(
      'Quiz Import Time',
      'Quiz-import-start',
      'Quiz-import-complete',
    )
    return module
  })
})

const NotificationModal = React.lazy(() => {
  performance.mark('NotificationModal-import-start')
  return import(
    './components/Header-Footer/modernNavbarComponents/modals/NotificationModal.jsx'
  ).then(module => {
    performance.mark('NotificationModal-import-complete')
    performance.measure(
      'NotificationModal Import Time',
      'NotificationModal-import-start',
      'NotificationModal-import-complete',
    )
    return module
  })
})
const UpgradeModal = React.lazy(() => {
  performance.mark('UpgradeModal-import-start')
  return import('./components/homeComponents/UpgradeModal').then(module => {
    performance.mark('UpgradeModal-import-complete')
    performance.measure(
      'UpgradeModal Import Time',
      'UpgradeModal-import-start',
      'UpgradeModal-import-complete',
    )
    return module
  })
})
const TournamentRewardsModal = React.lazy(() => {
  performance.mark('TournamentRewardsModal-import-start')
  return import(
    './components/tournamentComponents/rewards/TournamentRewardsModal.jsx'
  ).then(module => {
    performance.mark('TournamentRewardsModal-import-complete')
    performance.measure(
      'TournamentRewardsModal Import Time',
      'TournamentRewardsModal-import-start',
      'TournamentRewardsModal-import-complete',
    )
    return module
  })
})
// import PWAPromptStrip from './components/pwa/PWAPromptStrip'
const PWAPromptStrip = React.lazy(() => {
  performance.mark('PWAPromptStrip-import-start')
  return import('./components/pwa/PWAPromptStrip.jsx').then(module => {
    performance.mark('PWAPromptStrip-import-complete')
    performance.measure(
      'PWAPromptStrip Import Time',
      'PWAPromptStrip-import-start',
      'PWAPromptStrip-import-complete',
    )
    return module
  })
})
import { getPWAPromptStatus } from './utils/pwaInstallStore'
// import { RewardDisplay } from './components/rewards'
const RewardDisplay = React.lazy(() => {
  performance.mark('RewardDisplay-import-start')
  return import('./components/rewards/RewardDisplay.jsx').then(module => {
    performance.mark('RewardDisplay-import-complete')
    performance.measure(
      'RewardDisplay Import Time',
      'RewardDisplay-import-start',
      'RewardDisplay-import-complete',
    )
    return module
  })
})

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

// Log all performance metrics
const logPerformanceMetrics = () => {
  const measures = performance.getEntriesByType('measure')
  console.group('App Performance Metrics')
  measures.forEach(measure => {
    console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`)
  })
  console.groupEnd()
}

const App = () => {
  // Start tracking app component render time
  const hasLoggedMetrics = useRef(false)
  console.log(`App starting: ${new Date().toISOString()}`)

  // Add as first useEffect
  useEffect(() => {
    console.log(`First useEffect: ${new Date().toISOString()}`)
    console.log(`Document readyState: ${document.readyState}`)

    // Resource timing analysis
    const resources = performance.getEntriesByType('resource')
    console.log(`Resources loaded: ${resources.length}`)

    // Find slowest resources
    const slowResources = [...resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(r => ({
        name: r.name.split('/').pop(),
        duration: Math.round(r.duration),
        size: r.transferSize,
        type: r.initiatorType,
      }))
    console.log('Slowest resources:', slowResources)

    // Check for render blocking resources
    const blockingResources = resources.filter(
      r => r.renderBlockingStatus === 'blocking',
    )
    console.log(`Blocking resources: ${blockingResources.length}`)
  }, [])
  useEffect(() => {
    // Mark the start of App component mounting
    performance.mark('app-component-mount-start')

    // Clean up and log performance metrics when component unmounts
    return () => {
      performance.mark('app-component-unmount')
      performance.measure(
        'App Component Lifecycle',
        'app-component-mount-start',
        'app-component-unmount',
      )
      logPerformanceMetrics()
    }
  }, [])

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
  const { isListening, initializeQuickClashSocket, cleanupSocketListeners } =
    useQuickClashSocket()
  const { loadActiveChallenges } = useQuickClash()
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
    performance.mark('initial-app-effect-start')

    setTimeout(() => {
      performance.mark('pwa-prompt-timeout-start')
      setShowPWAPrompt(true)
      performance.mark('pwa-prompt-timeout-end')
      performance.measure(
        'PWA Prompt Timeout',
        'pwa-prompt-timeout-start',
        'pwa-prompt-timeout-end',
      )
    }, 45000)

    setTimeout(() => {
      performance.mark('upgrade-modal-timeout-start')
      setShowUpgradeModal(true)
      performance.mark('upgrade-modal-timeout-end')
      performance.measure(
        'Upgrade Modal Timeout',
        'upgrade-modal-timeout-start',
        'upgrade-modal-timeout-end',
      )
    }, 5000)

    performance.mark('performance-navigation-check-start')
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
    performance.mark('performance-navigation-check-end')
    performance.measure(
      'Performance Navigation Check',
      'performance-navigation-check-start',
      'performance-navigation-check-end',
    )

    performance.mark('initial-app-effect-end')
    performance.measure(
      'Initial App Effect',
      'initial-app-effect-start',
      'initial-app-effect-end',
    )

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
    performance.mark('service-worker-effect-start')
    const token = isToken()

    // Enhanced Service Worker handling
    if ('serviceWorker' in navigator) {
      dispatch(setTaskProgress({ task: 'serviceWorker', progress: 50 }))

      // Register service worker immediately instead of waiting for load event
      navigator.serviceWorker
        .register('/sw.js')
        .then(
          registration => {
            performance.mark('service-worker-registered')
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
            performance.mark('service-worker-failed')
            console.error('ServiceWorker registration failed:', err)
          },
        )
        .finally(() => {
          performance.mark('service-worker-setup-complete')
          performance.measure(
            'Service Worker Setup Time',
            'service-worker-effect-start',
            'service-worker-setup-complete',
          )
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
    performance.mark('service-worker-effect-end')
    performance.measure(
      'Service Worker Effect Total',
      'service-worker-effect-start',
      'service-worker-effect-end',
    )

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
      performance.mark('leaderboard-fetch-start')
      dispatch(getTopLeaderboard({ tournamentId, t })).finally(() => {
        performance.mark('leaderboard-fetch-end')
        performance.measure(
          'Leaderboard Fetch Time',
          'leaderboard-fetch-start',
          'leaderboard-fetch-end',
        )
      })
    }
  }, [tournamentId, status])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') {
      performance.mark('tournament-registration-check-start')
      dispatch(checkTournamentRegistration(tournamentSliceTranslation)).finally(
        () => {
          performance.mark('tournament-registration-check-end')
          performance.measure(
            'Tournament Registration Check Time',
            'tournament-registration-check-start',
            'tournament-registration-check-end',
          )
        },
      )
    }
  }, [loginCheckStatus])

  useEffect(() => {
    performance.mark('hash-change-effect-start')

    if (loginCheckStatus === 'fulfilled' && isAuthenticated) {
      performance.mark('demotion-summary-fetch-start')
      dispatch(fetchDemotionSummary()).finally(() => {
        performance.mark('demotion-summary-fetch-end')
        performance.measure(
          'Demotion Summary Fetch Time',
          'demotion-summary-fetch-start',
          'demotion-summary-fetch-end',
        )
      })
    }

    const handleHashChange = () => {
      if (
        window.location.hash.split('?')[0] === '#signin' &&
        !isAuthenticated &&
        loginCheckStatus === 'fulfilled'
      ) {
        if (window.location.hash.split('?')?.[1]?.split('=')?.[0] === 'ref') {
          localStorage.setItem(
            'ref',
            window.location.hash.split('?')?.[1]?.split('=')?.[1],
          )
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

    performance.mark('hash-change-effect-end')
    performance.measure(
      'Hash Change Effect Time',
      'hash-change-effect-start',
      'hash-change-effect-end',
    )

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [loginCheckStatus, isAuthenticated])

  useEffect(() => {
    performance.mark('quick-clash-socket-effect-start')

    let intervalToJoinQuickClashSocket
    if (isAuthenticated) {
      // setInterval to to poll initializeQuickClashSocket untill isListening is true and then clear the interval
      intervalToJoinQuickClashSocket = setInterval(() => {
        if (!isListening) {
          initializeQuickClashSocket()
        } else {
          clearInterval(intervalToJoinQuickClashSocket)
          performance.mark('quick-clash-socket-connected')
          performance.measure(
            'Quick Clash Socket Connect Time',
            'quick-clash-socket-effect-start',
            'quick-clash-socket-connected',
          )
        }
      }, 1000)
    }

    performance.mark('quick-clash-socket-effect-end')
    performance.measure(
      'Quick Clash Socket Effect Setup Time',
      'quick-clash-socket-effect-start',
      'quick-clash-socket-effect-end',
    )

    return () => {
      clearInterval(intervalToJoinQuickClashSocket)
    }
  }, [isAuthenticated, isListening, initializeQuickClashSocket])

  useEffect(() => {
    performance.mark('auth-effect-start')

    let timer
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
      performance.mark('i18n-change-language-start')
      i18n
        .changeLanguage(user?.userLanguage ? user.userLanguage : 'en')
        .then(() => {
          performance.mark('i18n-change-language-end')
          performance.measure(
            'i18n Change Language Time',
            'i18n-change-language-start',
            'i18n-change-language-end',
          )
        })
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

    performance.mark('auth-effect-end')
    performance.measure(
      'Auth Effect Time',
      'auth-effect-start',
      'auth-effect-end',
    )

    return () => clearTimeout(timer)
  }, [isAuthenticated])

  useEffect(() => {
    if (user && user.inGameName) {
      performance.mark('tournament-rewards-claim-start')
      tournamentRewardsClaim({ user, dispatch, t: rewardsTranslation }).finally(
        () => {
          performance.mark('tournament-rewards-claim-end')
          performance.measure(
            'Tournament Rewards Claim Time',
            'tournament-rewards-claim-start',
            'tournament-rewards-claim-end',
          )
        },
      )
    }
  }, [user])

  useEffect(() => {
    performance.mark('analytics-effect-start')

    ReactGA.set({
      'User Logged In': isLoggedIn ? t('Logged In') : t('Logged Out'), // Added translation
      'User InGameName': getUserInGameName ? getUserInGameName : t('anonymous'), // Added translation
    })
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })

    performance.mark('analytics-effect-end')
    performance.measure(
      'Analytics Effect Time',
      'analytics-effect-start',
      'analytics-effect-end',
    )
  }, [location, getUserInGameName, isLoggedIn])

  useUserCache()

  // Modified fetchInitialData
  useEffect(() => {
    performance.mark('initial-data-fetch-start')

    const fetchInitialData = async () => {
      await userCacheService.fetchAndCacheUser(dispatch)

      performance.mark('initial-data-fetch-end')
      performance.measure(
        'Initial Data Fetch Time',
        'initial-data-fetch-start',
        'initial-data-fetch-end',
      )
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
    performance.mark('navbar-loaded')
    setNavbarLoaded(true)
    dispatch(setTaskProgress({ task: 'navbarLoad', progress: 100 }))
    performance.measure(
      'Navbar Load Time',
      'app-component-mount-start',
      'navbar-loaded',
    )
  }, [dispatch])

  useEffect(() => {
    if (overallProgress === 100) {
      performance.mark('app-complete-load-start')
      // dispatch after 500ms to ensure all components are loaded
      setTimeout(() => {
        dispatch(setIsLoading(false))
        setShowLoadingScreen(false)

        performance.mark('app-complete-load-end')
        performance.measure(
          'App Complete Load Time',
          'app-complete-load-start',
          'app-complete-load-end',
        )

        // Log all performance metrics once app is fully loaded
        if (!hasLoggedMetrics.current) {
          hasLoggedMetrics.current = true
          performance.mark('app-interactive')
          performance.measure(
            'Time To Interactive',
            'app-component-mount-start',
            'app-interactive',
          )

          // Report app is interactive to any monitoring
          if (window.requestIdleCallback) {
            requestIdleCallback(() => {
              logPerformanceMetrics()
            })
          } else {
            setTimeout(() => {
              logPerformanceMetrics()
            }, 0)
          }
        }
      }, 500)
    }
  }, [navbarLoaded, overallProgress, dispatch])

  return (
    <MaintenanceHandler>
      {showLoadingScreen && <LoadingScreen progress={overallProgress} />}

      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('fixed-background-suspense')}
      >
        {!showLoadingScreen && <FixedBackground />}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('pwa-prompt-suspense')}
      >
        {showPWAPrompt && <PWAPromptStrip onClose={handlePromptClose} />}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() =>
          performance.mark('note-message-queue-suspense')
        }
      >
        <NoteMessageQueue />
      </Suspense>

      {showXpLevelModal && (
        <Suspense
          fallback={null}
          onSuspenseFallback={() => performance.mark('xp-level-modal-suspense')}
        >
          <XPLevelModal
            setShowXPLevelModal={show => dispatch(setShowXpLevelModal(show))}
          />
        </Suspense>
      )}

      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('button-gradient-suspense')}
      >
        <ButtonGradient />
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() =>
          performance.mark('guest-login-modal-suspense')
        }
      >
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
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('quiz-suspense')}
      >
        {isOpen ? tournamentQuiz ? <TournamentQuiz /> : <Quiz /> : null}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('signin-suspense')}
      >
        <Signin
          isOpen={isSigninOpen}
          onOpen={() => dispatch(setIsSigninOpen(true))}
          onClose={() => dispatch(setIsSigninOpen(false))}
        />
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('upgrade-modal-suspense')}
      >
        {isAuthenticated && USER_IQ > 90 && user.societyUpgradeMessage && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title={t('upgrade_modal_title')}
            content={t('upgrade_modal_content')}
          />
        )}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('register-suspense')}
      >
        <Register
          isOpen={isRegisterOpen}
          onOpen={() => dispatch(setIsRegisterOpen(true))}
          onClose={() => dispatch(setIsRegisterOpen(false))}
        />
      </Suspense>
      <NavbarProvider>
        {showNavbar &&
          ((!(summary && isVisible) &&
            !location.pathname.startsWith('/quickclash') &&
            location.pathname != '/') ||
            (!location.pathname.startsWith('/quickclash') && !isLoggedIn)) && (
            <Suspense
              fallback={null}
              onSuspenseFallback={() => performance.mark('navbar-suspense')}
            >
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
          <Suspense
            fallback={null}
            onSuspenseFallback={() => performance.mark('app-routes-suspense')}
          >
            <AppRoutes
              isToken={isToken()}
              needsOnboarding={user?.needsOnboarding}
              setIsGuestLoggedin={setIsGuestLoggedin}
            />
          </Suspense>
        </Box>
      </NavbarProvider>
      <Suspense
        fallback={null}
        onSuspenseFallback={() =>
          performance.mark('notification-modal-suspense')
        }
      >
        {isNotifInboxModalOpen && (
          <NotificationModal
            handleNotifModalClose={handleNotifModalClose}
            selectedNotificationId={selectedNotificationId}
            selectedNotification={getLatestWeeklyReportUpdate()}
          />
        )}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() =>
          performance.mark('tournament-rewards-modal-suspense')
        }
      >
        {!isLoadingRewardsModal && (
          <TournamentRewardsModal
            isOpen={isOpenRewardsModal}
            onClose={onClose}
          />
        )}
      </Suspense>
      <Suspense
        fallback={null}
        onSuspenseFallback={() => performance.mark('reward-display-suspense')}
      >
        <RewardDisplay />
      </Suspense>
      <NotificationReminderModal />
    </MaintenanceHandler>
  )
}

export default App
