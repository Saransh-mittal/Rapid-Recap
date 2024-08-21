// /src/App.jsx
import './App.css'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Box, HStack } from '@chakra-ui/react'
import NotificationSubscription from './components/Notifications/NotificationSubscription.jsx'
import Navbar from './components/Header-Footer/Navbar.jsx'
import Footer from './components/Header-Footer/Footer.jsx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setUser } from './redux/authSlice.js'
import FixedBackground from './components/miscellaneous/FixedBackground.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import GuestLoginModal from './components/authComponents/GuestLoginModal.jsx'
import ButtonGradient from './assets/svg/ButtonGradient.jsx'
import NoteMessage from './components/miscellaneous/NoteMessage.jsx'
import GuestLogin from './components/authComponents/GuestLogin.jsx'
import GetStarted from './components/Header-Footer/navbarComponents/GetStarted.jsx'

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()

  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [showNote, setShowNote] = useState(false)

  const handleClose = () => {
    setIsGuestLoggedin(false)
  }

  const isLoggedIn = () => {
    return isAuthenticated && user
  }
  const isToken = () => {
    const token = localStorage.getItem('token')

    return token
  }

  const getUserInGameName = () => {
    return isLoggedIn() ? user?.inGameName : null
  }

  let timeout
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) setShowNote(true)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log(
              'ServiceWorker registration successful with scope: ',
              registration.scope,
            )
            registration.update()
          },
          function (err) {
            console.log('ServiceWorker registration failed: ', err)
          },
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
      timeout =
        timeUntilMidnight > 0 ? timeUntilMidnight : 86400000 + timeUntilMidnight

      setTimeout(() => {
        window.location.reload(true)
      }, timeout)
    }

    refreshAtMidnightUTC()

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (user?.newAccount) {
      setIsGuestLoggedin(true)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const loggedIn = isLoggedIn()
    const userInGameName = getUserInGameName()

    ReactGA.set({
      'User Logged In': loggedIn ? 'Logged In' : 'Logged Out',
      'User InGameName': userInGameName ? userInGameName : 'anonymous',
    })
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })
  }, [location, user, isAuthenticated])

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

  const shouldShowFooter =
    !location.pathname.includes('home') &&
    (location.pathname === '/' || location.pathname === '/get-started')

  const isSupported = () =>
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  const shouldShowNotification = isAuthenticated && isSupported()

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
      <FixedBackground />
      {showNote && (
        <NoteMessage
          onClose={() => setShowNote(false)}
          title="Start using Rapid Recap"
          duration={null} // Set to null to prevent auto-closing
        >
          <HStack p={'10px'} gap={'5px'} justifyContent={'space-between'}>
            <GetStarted innerText={'Signin'} width={'8.5rem'} />
            <GuestLogin
              width={'8.5rem'}
              onCloseNoteMessage={() => setShowNote(false)}
            />
          </HStack>
        </NoteMessage>
      )}
      <Navbar />
      <ButtonGradient />
      {shouldShowNotification && <NotificationSubscription />}
      <GuestLoginModal
        isOpen={isGuestLoggedin}
        onClose={handleClose}
        guestName={user?.inGameName}
        guestPassword={user?.guestTempPassword}
        guestId={user?._id}
        onOpen={() => setIsGuestLoggedin(true)}
      />
      <Box
        position="relative"
        minHeight="100vh"
        zIndex={1}
        overflowX={'hidden'}
      >
        <AppRoutes isToken={isToken()} />
      </Box>
      {shouldShowFooter && <Footer />}
    </>
  )
}
export default App
