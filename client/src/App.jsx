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
import { Helmet } from 'react-helmet'
import { Box } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

// Lazy load components and screens
const NotificationSubscription = React.lazy(() =>
  import('./components/Notifications/NotificationSubscription.jsx'),
)
const Navbar = React.lazy(() => import('./components/Header-Footer/Navbar.jsx'))
const Footer = React.lazy(() => import('./components/Header-Footer/Footer.jsx'))
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
import { useTranslation } from 'react-i18next'
const Register = React.lazy(() => import('./screens/Register.jsx'))
const NoteMessageQueue = React.lazy(() =>
  import('./components/miscellaneous/NoteMessageQueue.jsx'),
)
const XPLevelModal = React.lazy(() =>
  import('./components/Header-Footer/navbarComponents/XPLevelModal.jsx'),
)

import {
  addNoteMessage,
  fetchUnreadNoteMessages,
  setIsRegisterOpen,
  setIsSigninOpen,
  setShowXpLevelModal,
} from './redux/appSlice.js'
import { setUser } from './redux/authSlice.js'

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()

  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { isRegisterOpen, isSigninOpen, showXpLevelModal } = useSelector(
    state => state.app,
  )

  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [guestModalJustClosed, setGuestModalJustClosed] = useState(false)
  const { t: GuestLogintranslation } = useTranslation('GuestLogin')
  const { t: GuestLoginModaltranslation } = useTranslation('GuestLoginModal')

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

  useEffect(() => {
    const token = isToken()

    if (!token) {
      dispatch(
        addNoteMessage({
          title: 'Start using Rapid Recap',
          duration: 15000,
          width: '350px',
          actions: [
            { text: 'Sign-In', actionType: 'SIGN_IN' },
            { text: 'Sign-In As Guest', actionType: 'GUEST' },
          ],
        }),
      )
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log(
              'ServiceWorker registration successful with scope: ',
              registration.scope,
            )
            registration.update()
          },
          err => console.log('ServiceWorker registration failed: ', err),
        )
      })
    }

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
  }, [dispatch, isToken])

  useEffect(() => {
    if (user?.newAccount) {
      setIsGuestLoggedin(true)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated) {
      const delay = Math.floor(Math.random() * 120000) + 60000
      const timer = setTimeout(() => {
        dispatch(fetchUnreadNoteMessages())
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    ReactGA.set({
      'User Logged In': isLoggedIn ? 'Logged In' : 'Logged Out',
      'User InGameName': getUserInGameName ? getUserInGameName : 'anonymous',
    })
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })
  }, [location, getUserInGameName, isLoggedIn])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`/api/user/loginCheck`)
        if (response.status === 201) {
          dispatch(setUser(response.data))
        }
      } catch (error) {
        dispatch(setUser(null))
        console.log(error)
      }
    }

    fetchInitialData()
  }, [dispatch])

  useEffect(() => {
    if (guestModalJustClosed && user?.role === 'guest') {
      dispatch(
        addNoteMessage({
          title: 'You can view your credentials of guest account in profile',
          duration: 10000,
          width: '300px',
          actions: [{ text: 'View Profile', actionType: 'VIEW_PROFILE' }],
        }),
      )
    }
  }, [guestModalJustClosed, user, dispatch])

  useEffect(() => {
    if (
      user?.role === 'guest' &&
      !guestModalJustClosed &&
      !isGuestLoggedin &&
      !user?.newAccount
    ) {
      dispatch(
        addNoteMessage({
          title: 'Register to Safeguard your progress',
          duration: 5000,
          width: '300px',
          actions: [{ actionType: 'SECURE_YOUR_PROGRESS' }],
        }),
      )
    }
  }, [user, guestModalJustClosed, isGuestLoggedin, dispatch])

  const shouldShowFooter = useMemo(
    () =>
      !location.pathname.includes('home') &&
      (location.pathname === '/' || location.pathname === '/get-started'),
    [location.pathname],
  )

  const isSupported = useMemo(
    () =>
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window,
    [],
  )

  const shouldShowNotification = useMemo(
    () => isAuthenticated && isSupported,
    [isAuthenticated, isSupported],
  )

  return (
    <>
      <Helmet>
        <title>Rapid Recap - Stay Informed, Stay Ahead</title>
        <meta
          name="description"
          content="Rapid Recap is your go-to source for the latest news and articles. Test your knowledge with quizzes and track your Information Quotient (IQ) score."
        />
        <meta
          name="keywords"
          content="Rapid Recap, news, articles, quizzes, IQ score, leaderboard"
        />
        <meta
          property="og:title"
          content="Rapid Recap - Stay Informed, Stay Ahead"
        />
        <meta
          property="og:description"
          content="Stay updated with the latest news and articles. Take quizzes and see your Information Quotient (IQ) score on Rapid Recap."
        />
      </Helmet>

      <Suspense fallback={null}>
        <FixedBackground />
      </Suspense>

      <Suspense fallback={null}>
        <NoteMessageQueue />
      </Suspense>

      <Suspense fallback={null}>
        <Navbar />
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

      {shouldShowNotification && (
        <Suspense fallback={null}>
          <NotificationSubscription />
        </Suspense>
      )}

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
        <Signin
          isOpen={isSigninOpen}
          onOpen={() => dispatch(setIsSigninOpen(true))}
          onClose={() => dispatch(setIsSigninOpen(false))}
        />
      </Suspense>

      <Suspense fallback={null}>
        <Register
          isOpen={isRegisterOpen}
          onOpen={() => dispatch(setIsRegisterOpen(true))}
          onClose={() => dispatch(setIsRegisterOpen(false))}
        />
      </Suspense>

      <Box
        position="relative"
        minHeight="100vh"
        zIndex={1}
        overflowX={'hidden'}
      >
        <Suspense fallback={null}>
          <AppRoutes isToken={isToken()} />
        </Suspense>
      </Box>

      {shouldShowFooter && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </>
  )
}

export default App
