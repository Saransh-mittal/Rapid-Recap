// /src/App.jsx
import './App.css'
import React, { act } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Suspense, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Box, VStack, Spinner, Flex, Text } from '@chakra-ui/react'
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
import SecureYourProgress from './components/miscellaneous/SecureYourProgress.jsx'
const Signin = React.lazy(() => import('./screens/Signin.jsx'))
import {
  addNoteMessage,
  setIsRegisterOpen,
  setIsSigninOpen,
} from './redux/appSlice.js'
import Button from './components/miscellaneous/ButtonComponent.jsx'
import NoteMessageQueue from './components/miscellaneous/NoteMessageQueue.jsx'

const Register = React.lazy(() => import('./screens/Register.jsx'))

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()

  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { isRegisterOpen, isSigninOpen } = useSelector(state => state.app)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [guestModalJustClosed, setGuestModalJustClosed] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const navigate = useNavigate()

  const handleClose = () => {
    setShowNote(true)
    setIsGuestLoggedin(false)
    setGuestModalJustClosed(true)
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
    if (user?.role === 'guest') {
      setShowNote(true)
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
      {/* {showNote && !isGuestLoggedin ? (
        isToken() ? (
          guestModalJustClosed ? (
            <NoteMessage
              onClose={() => setShowNote(false)}
              title="You can view your credentials of guest account in profile"
              duration={10000} // Set to null to prevent auto-closing
            >
              <Flex
                width={'100%'}
                justifyContent="center"
                alignItems="center"
                p={'10px'}
              >
                <Button
                  onClick={() => {
                    navigate(`/profile/${user?.inGameName}`)
                    setShowNote(false)
                  }}
                  buttonW={'150px'}
                >
                  View Profile
                </Button>
              </Flex>
            </NoteMessage>
          ) : (
            <NoteMessage
              onClose={() => setShowNote(false)}
              title="Register to Safegaure your progress"
              duration={5000} // Set to null to prevent auto-closing
            >
              <SecureYourProgress />
            </NoteMessage>
          )
        ) : (
          <NoteMessage
            onClose={() => setShowNote(false)}
            title="Start using Rapid Recap"
            width="250px"
            duration={15000}
          >
            <VStack p={'10px'} gap={'1rem'} justifyContent={'space-between'}>
              <GetStarted innerText={'Signin'} width={'80%'} />
              <GuestLogin
                onCloseNoteMessage={() => setShowNote(false)}
                width={'80%'}
              />
            </VStack>
          </NoteMessage>
        )
      ) : null} */}
      <NoteMessageQueue />

      <Navbar />
      <NoteMessageTestComponent />
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

      <Suspense fallback={<Spinner />}>
        <Signin
          isOpen={isSigninOpen}
          onOpen={() => dispatch(setIsSigninOpen(true))}
          onClose={() => dispatch(setIsSigninOpen(false))}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
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
        <AppRoutes isToken={isToken()} />
      </Box>
      {shouldShowFooter && <Footer />}
    </>
  )
}

const NoteMessageTestComponent = () => {
  const dispatch = useDispatch()

  const addSimpleMessage = () => {
    dispatch(
      addNoteMessage({
        title: 'Simple Message',
        content: 'This is a simple test message.',
        duration: 5000,
        width: '300px',
      }),
    )
  }

  const addMessageWithTwoActions = () => {
    dispatch(
      addNoteMessage({
        title: 'Message with Two Actions',
        content: 'This message includes two action buttons.',
        duration: null,
        width: '350px',
        actions: [
          {
            text: 'Confirm',
            actionType: 'CONFIRM',
            colorScheme: 'green',
          },
          {
            text: 'Cancel',
            actionType: 'CANCEL',
            colorScheme: 'red',
          },
        ],
      }),
    )
  }

  const addMessageWithThreeActions = () => {
    dispatch(
      addNoteMessage({
        title: 'Message with Three Actions',
        content: 'This message includes three action buttons.',
        duration: 15000,
        width: '400px',
        actions: [
          {
            text: 'Option 1',
            actionType: 'OPTION1',
            colorScheme: 'blue',
          },
          {
            text: 'Option 2',
            actionType: 'OPTION2',
            colorScheme: 'purple',
          },
          {
            text: 'Cancel',
            actionType: 'CANCEL',
            colorScheme: 'gray',
          },
        ],
      }),
    )
  }

  const addMultipleMessages = () => {
    for (let i = 1; i <= 5; i++) {
      dispatch(
        addNoteMessage({
          title: `Message ${i}`,
          content: `This is test message number ${i}.`,
          duration: 5000 + i * 1000,
          width: '300px',
          actions: [
            {
              text: 'Option 1',
              actionType: 'OPTION1',
              colorScheme: 'blue',
            },
            {
              text: 'Option 2',
              actionType: 'OPTION2',
              colorScheme: 'purple',
            },
            {
              text: 'Cancel',
              actionType: 'CANCEL',
              colorScheme: 'gray',
            },
          ],
        }),
      )
    }
  }

  return (
    <VStack spacing={4} align="stretch" p={4} mt={'10rem'}>
      <Button onClick={addSimpleMessage}>Add Simple Message</Button>
      <Button onClick={addMessageWithTwoActions}>
        Add Message with Two Actions
      </Button>
      <Button onClick={addMessageWithThreeActions}>
        Add Message with Three Actions
      </Button>
      <Button onClick={addMultipleMessages}>Add Multiple Messages</Button>
    </VStack>
  )
}
export default App
